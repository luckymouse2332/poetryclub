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
6. Route Handlers 仅用于：Webhook、认证回调、健康检查、文件接口以及未来需要公开的 API。

## 认证边界

- 会话由 Better Auth 在服务端管理；客户端只得到受限的身份视图。
- M0 启用邮箱密码注册 / 登录，认证请求挂载在 `/api/auth/[...all]`；不启用 OAuth、角色插件或复杂权限系统。
- 注册后不自动登录，以避免现阶段在既有邮箱注册时形成账号枚举差异；用户需显式登录。
- 会话凭据只通过 HttpOnly Cookie 传递；认证 JSON 响应会移除 session token、provider token 和密码字段，避免暴露给浏览器脚本。
- Better Auth 负责其认证端点的协议级输入校验、密码哈希、Cookie 和错误响应；项目自有写入口仍必须使用 Zod 并执行完整安全检查。
- 服务端入口不得信任客户端传入的用户 ID、角色、权限、作者信息或审核状态。
- 对象级授权逻辑集中在 `src/server/policies`，由服务端入口调用。
- M0 不提供邮箱验证、找回密码、会话管理页和路由保护；这些必须作为独立任务实现。

## 数据库 / 事务 / migration 规则

- 数据库访问只允许位于 `src/server/db` 及明确的服务端模块。
- 多表写入、计数更新和状态转换必须考虑事务、并发与幂等性。
- Schema 的任何改动必须生成并提交版本化 SQL migration；禁止在生产流程中使用不保留迁移历史的 schema push。
- M0 的认证表为 Better Auth 官方 CLI 生成的 `user`、`session`、`account`、`verification`，随后由 Drizzle Kit 生成 `drizzle/0000_harsh_echo.sql`。
- `user → session/account` 外键使用级联删除；邮箱和 session token 唯一，外键与验证标识具有索引。
- 生产环境必须使用持久化的 PostgreSQL 数据卷。

## 错误与敏感信息

- 密钥、数据库连接串、会话令牌、服务端错误堆栈一律不发送给浏览器。
- 错误边界（`error.tsx` / `global-error.tsx`）只向用户展示友好文案；服务端错误通过 `digest` 关联服务端日志。
- 用户可编辑文本一律按不可信内容处理；当前阶段默认以纯文本或受限 Markdown 展示，禁止直接渲染未经净化的 HTML。

## 分页

- 所有列表必须分页；禁止无界读取帖子、评论、用户或通知。

## 测试策略

- 单元测试：Vitest（node 环境），匹配 `tests/unit/**/*.test.ts`。
- E2E：Playwright，位于 `tests/e2e/`，webServer 使用 `pnpm dev`。
- 服务端入口的认证 / 授权 / 校验逻辑通过直接测试 service 与 policy 层覆盖（自 M1 起），不依赖真实数据库。
- 质量命令：`pnpm typecheck`、`pnpm lint`、`pnpm test`、`pnpm test:e2e`、`pnpm build`。

## 生产部署结构

- 生产环境运行**一个 Next.js 应用容器 + 一个 PostgreSQL 实例**。
- Next.js 前方必须有 **Caddy 或 Nginx 反向代理**（TLS 终结、静态资源与转发）。
- PostgreSQL 使用**持久化数据卷**。
- Redis、搜索服务、对象存储、后台任务系统只在真实需求出现后引入。
- 开发环境由根 `compose.yaml` 提供 PostgreSQL；应用仍推荐在宿主机运行。
- 生产由 `deploy/compose.production.yaml` 编排一次性 migration、应用、PostgreSQL 和 Caddy；应用仅在 migration 成功后启动。
- 完整操作说明见 `docs/deployment.md`。
