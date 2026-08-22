# 架构文档：回中诗社

技术栈由 `temp.md` 固定，除非有明确且书面记录的理由，否则不替换、不增加功能重叠的库：

- Next.js App Router、React、TypeScript strict mode、pnpm
- PostgreSQL、Drizzle ORM + 版本化 SQL migration
- Better Auth、Zod
- Tailwind CSS、shadcn/ui
- Vitest、Playwright
- Docker Compose、Caddy 或 Nginx 反向代理

## 总览

采用**模块化单体**：一个 Next.js 应用同时承担 Web 前端、服务端入口、领域逻辑与数据访问。不创建独立后端、微服务、GraphQL 服务或额外仓库。

## 模块结构

```text
src/
├── app/             # 薄层：路由、布局、页面组合、错误边界、请求入口
├── components/      # 纯 UI 组件
│   └── ui/          # shadcn 组件
├── features/        # 按功能组织的领域模块
│   ├── auth/
│   ├── users/
│   ├── communities/
│   ├── posts/
│   ├── comments/
│   ├── reactions/
│   ├── notifications/
│   └── moderation/
├── server/          # 仅服务端
│   ├── auth/
│   ├── db/
│   ├── email/
│   ├── policies/
│   ├── services/
│   └── validation/
└── lib/             # 跨模块共享的小工具
```

## 职责边界与依赖方向

- `src/app` 是**薄层**：只负责路由、布局、页面组合、错误边界和请求入口，业务规则不得大量堆积在 page、layout、Route Handler 或 Server Action 中。
- `src/components` 只放纯 UI；`src/components/ui` 放 shadcn 组件。
- `src/features/*` 按功能组织业务模块；`src/server/*` 集中服务端逻辑（auth / db / policies / services / validation）。
- `src/lib` 放通用小工具（如 `cn`、分页常量）。
- 依赖方向：`app → features → server`，`components → lib`；禁止反向或循环依赖。
- 默认使用 Server Components。只有需要浏览器 API、本地交互状态或事件处理的组件才允许添加 `"use client"`。
- React Client Component **不得直接访问数据库**；数据库访问只能位于 `src/server` 或明确的服务端模块。

## 请求流程

1. 浏览器请求 → 反向代理 → Next.js。
2. `src/app` 的路由与布局确定页面结构；默认以 Server Components 渲染。
3. 页面服务端取数：`page → service → db`（数据读取在服务端完成，再渲染）。
4. 内部页面的数据变更优先使用 **Server Actions**（写操作走 `action → service → db`）。
5. 每个写操作都是独立可被外部调用的入口，必须依次执行身份认证、对象级授权、输入校验、业务规则校验、错误处理。
6. Route Handlers 用于 Webhook、认证回调、健康检查、文件接口，以及评论等需要客户端增量读取的内部只读端点。内部端点不是受支持的开放 API，必须重新解析会话、执行对象授权、严格校验游标并返回 `private, no-store`。

## 认证边界

- 会话由 Better Auth 在服务端管理；客户端只得到受限的身份视图。
- 邮箱密码注册、登录、修改密码和密码重置请求挂载在 `/api/auth/[...all]`；不启用 OAuth、Better Auth admin 插件或复杂权限组。
- M3 采用项目自有的 `member | admin` 最小角色与 `active | suspended` 状态。角色和状态是服务端控制字段，管理写操作走项目 policy/service，不暴露 Better Auth admin mutation endpoint。
- M4.1 的作品访问范围使用 `public | members_only`。只有服务端重新确认状态为 `active` 的 member/admin 才能读取成员作品；suspended 账号保留公开和既有账户只读访问，但不能读取成员作品。
- M7 评论继承所属诗作的访问范围。游客只读取公开作品评论，active member/admin 可以读取成员作品评论并写入；suspended 账号只能读取公开作品评论。评论 Server Actions 与两个只读 Route Handlers 都独立重新验证身份和作品访问权。
- 公开注册必须提供有效邀请码。邀请码只保存 SHA-256 哈希；Better Auth Drizzle adapter 启用真实事务，注册的 user/account 创建与邀请码原子计数在同一事务提交或回滚。
- 注册后不自动登录，以避免现阶段在既有邮箱注册时形成账号枚举差异；用户需显式登录。
- 会话凭据只通过 HttpOnly Cookie 传递；认证 JSON 响应会移除 session token、provider token 和密码字段，避免暴露给浏览器脚本。
- Better Auth 负责其认证端点的协议级输入校验、密码哈希、Cookie 和错误响应；项目自有写入口仍必须使用 Zod 并执行完整安全检查。
- 注册、修改密码与重置密码共用 `8..128` 字符长度规则。修改密码调用 Better Auth `changePassword` 并撤销其他会话；邮件重置调用 `requestPasswordReset` / `resetPassword`，令牌保存于 Better Auth 既有 `verification` 表，有效期一小时，成功后撤销全部旧会话。
- 重置邮件经 `src/server/email` 抽象发送。生产仅允许 Resend 适配层，开发日志 transport 与测试 JSONL outbox 只能在显式非生产环境使用；异步发送失败统一脱敏记录，不改变对外统一响应。
- `/reset-password` 服务端先通过 Better Auth 官方回调验证令牌状态；客户端取得令牌后立即清理地址栏，不写入持久化存储，也不向无关链接传播。
- 生产限流对修改密码、请求重置和提交重置使用更严格的 Better Auth 自定义规则。当前单应用容器使用内存存储；未来横向扩容时必须改为共享限流存储。
- 当前宿主机 Caddy 直接反向代理仅绑定回环地址的应用端口。Better Auth 只从 Caddy 重写的 `X-Forwarded-For` 读取客户端 IP，不启用会信任任意转发头的 `trustedProxyHeaders`；若 Caddy 前方增加其他代理，必须先在 Caddy 层配置可信代理链。
- 服务端入口不得信任客户端传入的用户 ID、角色、权限、作者信息或审核状态。
- 对象级授权逻辑集中在 `src/server/policies`，由服务端入口调用。
- 作品读取策略集中在 `src/server/services/poems`，统一组合发布状态、管理员治理状态、发布时间和读取者访问范围；游客直达成员作品时只返回不含作品数据的登录门槛。
- `requireActiveUser()` 和 `requireAdmin()` 根据会话用户 ID 重新读取数据库权威状态；suspended 用户保留会话和只读页面，但不能执行任何身份写操作，suspended admin 不能管理。
- M4 已提供账户安全页和邮件密码重置；邮箱验证与独立会话管理页仍属于后续任务。

## 数据库 / 事务 / migration 规则

- 数据库访问只允许位于 `src/server/db` 及明确的服务端模块。
- 多表写入、计数更新和状态转换必须考虑事务、并发与幂等性。
- Schema 的任何改动必须生成并提交版本化 SQL migration；禁止在生产流程中使用不保留迁移历史的 schema push。
- M0 的认证表为 Better Auth 官方 CLI 生成的 `user`、`session`、`account`、`verification`，随后由 Drizzle Kit 生成 `drizzle/0000_harsh_echo.sql`。
- `user → session/account` 外键使用级联删除；邮箱和 session token 唯一，外键与验证标识具有索引。
- 生产环境必须使用持久化的 PostgreSQL 数据卷。
- 可能移除 active admin 的操作先锁定 `admin_guard(id=1)`，在同一事务内复查 active admin 数量、更新目标并写审计，避免并发产生 0 个管理员。
- 诗作作者状态 `draft | published` 与治理状态 `visible | hidden` 独立；公开读取统一要求 published、visible 且 `publishedAt` 非空。
- 诗作作者状态、治理状态和访问范围彼此独立；匿名读取要求 `published`、`visible`、`publishedAt` 非空且 `visibility = public`，active 成员/admin 读取允许 `public | members_only`。
- `poem_comment` 使用 `parent_id + root_id + depth` 表达线程结构；首版服务层仅接受 `depth=0` 根评论和 `depth=1` 回复。作者删除清空正文并保留节点，管理员隐藏不破坏回复结构。
- 评论创建使用 `(author_id, creation_token)` 唯一约束保证幂等。新回复在事务中更新根线程活动时间；删除、隐藏和恢复后按可见且未删除节点重新计算活动时间。
- 评论隐藏或恢复、管理员审计和作者通知在同一 PostgreSQL 事务提交；Redis 实时发布发生在事务提交后，失败不回滚持久数据。
- 管理操作与 `admin_audit_log` 在同一事务内完成；日志只读，不记录凭据、Cookie、邀请码明文或其他敏感信息。
- 服务器终端紧急恢复脚本通过 Better Auth 公开的密码哈希入口更新唯一 credential account，并在同一 PostgreSQL 事务撤销该用户全部会话；该能力没有 Route Handler 或管理后台入口。

## 错误与敏感信息

- 密钥、数据库连接串、会话令牌、服务端错误堆栈一律不发送给浏览器。
- 错误边界（`error.tsx` / `global-error.tsx`）只向用户展示友好文案；服务端错误通过 `digest` 关联服务端日志。
- 用户可编辑文本一律按不可信内容处理；当前阶段默认以纯文本或受限 Markdown 展示，禁止直接渲染未经净化的 HTML。
- 评论 DTO 只包含显示名、纯文本正文或占位状态、时间、所有权与可用操作；不得把邮箱、作者 ID、原始记录或治理内部字段发送给普通读者。隐藏评论只有作者能看到原文与当前原因。

## 分页

- 所有列表必须分页；禁止无界读取帖子、评论、用户或通知。
- 评论根线程使用版本化的不透明“活动时间 + ID”游标，每批十条；完整线程使用“创建时间 + ID”游标默认读取最近二十条并向更早回复翻页。游标 payload 严格拒绝额外字段和错误类型。

## 测试策略

- 单元测试：Vitest（node 环境），匹配 `tests/unit/**/*.test.ts`。
- 集成测试：Vitest（node 环境），匹配 `tests/integration/**/*.test.ts`，通过 `pnpm test:integration` 连接真实 PostgreSQL。
- E2E：Playwright，位于 `tests/e2e/`，webServer 使用 `pnpm dev`。
- 服务端入口的认证 / 授权 / 校验逻辑通过直接测试 service 与 policy 层覆盖（自 M1 起），不依赖真实数据库。
- 质量命令：`pnpm typecheck`、`pnpm lint`、`pnpm test`、`pnpm test:integration`、`pnpm test:e2e`、`pnpm build`、`pnpm db:check`。

## 生产部署结构

- 生产环境运行**一个 Next.js 应用容器 + 一个 PostgreSQL 实例**。
- Next.js 前方必须有 **Caddy 或 Nginx 反向代理**（TLS 终结、静态资源与转发）。
- PostgreSQL 使用**持久化数据卷**。
- Redis 仅用于通知实时唤醒和评论发布十秒冷却；搜索服务、对象存储和后台任务系统只在真实需求出现后引入。
- 通知数据以 PostgreSQL 为权威来源，Redis Pub/Sub 与 SSE 只提供在线用户的最佳努力提示；断线和 Redis 故障通过重新读取通知列表恢复。
- 评论限流在 Redis 不可用时记录不含账号、正文和连接信息的告警并放行；PostgreSQL 幂等约束仍然生效，相同创建标识的安全重试不受冷却阻断。
- 事务邮件由应用容器直接调用 Resend HTTP API；邮件供应商被隔离在服务端适配层，不进入页面或客户端 bundle。
- 开发环境由根 `compose.yaml` 提供 PostgreSQL；应用仍推荐在宿主机运行。
- 生产由 `deploy/compose.production.yaml` 编排一次性 migration、应用和 PostgreSQL；数据库通信使用内部后端网络，应用另接非内部入口网络；应用仅在 migration 成功后启动，并把宿主机回环地址的 `4000` 端口发布给宿主机 Caddy 或 Nginx。
- 生产反向代理在宿主机独立运行，不由项目 Compose 管理证书或占用 80/443 端口。
- 生产 Compose 的 Redis 只加入内部 `backend` 网络，不发布宿主机端口；应用启动依赖 Redis 健康检查，但 Redis 运行时短暂不可用不得破坏已持久化通知。
- 完整操作说明见 `docs/deployment.md`。
