<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 项目：回中诗社

校园诗歌兴趣社区。采用模块化单体：一个 Next.js 应用同时承担 Web 前端、服务端入口、领域逻辑与数据访问。产品与架构决策记录在 `docs/product.md` 和 `docs/architecture.md`；任务说明与状态在 `docs/tasks/`。

## 模块化单体边界

- `src/app` 是薄层：只放路由、布局、页面组合、错误边界和请求入口。业务规则不得大量堆积在 page、layout、Route Handler 或 Server Action 中。
- 业务按功能组织：`src/features/*`（auth、users、communities、posts、comments、reactions、notifications、moderation）。
- 服务端逻辑集中在 `src/server/*`（auth、db、policies、services、validation）。
- 通用小工具在 `src/lib`；纯 UI 组件在 `src/components`（shadcn 组件在 `src/components/ui`）。
- 依赖方向：`app → features → server`，`components → lib`；禁止反向或循环依赖。
- 默认使用 Server Components。只有需要浏览器 API、本地交互状态或事件处理的组件才允许添加 `"use client"`。
- React Client Component 不得直接访问数据库；数据库访问只能位于 `src/server` 或明确的服务端模块。

## UI 组件来源规则

- 除非 shadcn/ui 没有对应组件，否则禁止自实现。新组件一律用 `pnpm dlx shadcn@latest add <component>` 添加，不得手写或复制粘贴源码。
- 在生成的源码上改写以满足业务目标：类名映射到 `docs/design-system.md` 的 Token、去掉 `dark:` 变体、按需增加 cva 变体；保留上游的组件结构、`data-slot`、`asChild` 与 `cn()` 约定。差异写在文件顶部注释。
- 确认上游没有对应组件才可自实现，须在注释中声明「不是上游组件」并登记进 `docs/design-system.md` 第 10 节的基线表。现有项目自有组件：`surface`、`form-field`、`icon-button`。
- 禁止把自实现组件改名成上游组件名冒充迁移。
- 无头原语统一从 `radix-ui` 导入，不混用 `@radix-ui/react-*`。

## 服务端入口安全检查

Server Action 和 Route Handler 都必须视为可被外部直接调用的服务端入口。每个写操作必须独立执行：

1. 身份认证
2. 对象级授权
3. 输入校验（Zod）
4. 业务规则校验
5. 错误处理

不得信任客户端传入的用户 ID、角色、权限、作者信息和审核状态。

## 数据库 / migration 规则

- Schema 的任何改动必须生成并提交版本化 SQL migration；禁止在生产流程中使用不保留迁移历史的 schema push。
- 多表写入、计数更新和状态转换必须考虑事务、并发和幂等性。
- 仅 `src/server/db` 及明确的服务端模块可访问数据库。

## 分页与不可信文本

- 所有列表必须分页；禁止无界读取帖子、评论、用户或通知。
- 用户可编辑文本一律按不可信内容处理；当前阶段默认以纯文本或受限 Markdown 展示，禁止直接渲染未经净化的 HTML。

## 敏感信息

- 不允许把密钥、数据库连接串、会话令牌或服务端错误堆栈发送给浏览器。

## 测试与质量命令

- 单元测试：Vitest（node 环境），匹配 `tests/unit/**/*.test.ts`。
- E2E：Playwright，`tests/e2e/`，webServer 使用 `pnpm dev`。
- 质量命令：`pnpm typecheck`、`pnpm lint`、`pnpm test`、`pnpm test:watch`、`pnpm test:e2e`、`pnpm build`。
- 提交前必须通过 typecheck、lint、test（E2E 在具备浏览器环境时运行）。

## 任务工作流

- 任务说明与状态放在 `docs/tasks/`。开始任务前先复制 `docs/tasks/template.md` 并填写背景、范围、非目标、架构边界、验收条件、测试、风险/回滚、状态。
- 完成的任务必须在 `docs/tasks/` 更新状态，不得虚报完成。
- 路线任务使用 `M<阶段>.<序号>`；缺陷、运维、仓库维护、调查原型分别使用 `BUG-*`、`OPS-*`、`CHORE-*`、`SPIKE-*`。任务编号与发布版本没有对应关系。

## Git 与发布工作流

- 完整规则以 `docs/development-workflow.md` 为准。普通分支使用 `<type>/<task-id>-<slug>`，例如 `feat/m4-1-content-access-control`；`master` 保持可部署，普通工作不得直接提交到 `master`。
- 提交信息使用 Conventional Commits：`<type>(<scope>)!: <subject>`。提交标题使用英文，正文可以使用中文或英文；一个提交只处理一个可独立说明和回滚的逻辑变化。
- 发布版本使用 Semantic Versioning。稳定标签和 RC 标签分别使用 `vX.Y.Z`、`vX.Y.Z-rc.N`，必须为 annotated tag；`package.json` 与准备发布的标签保持一致，稳定发布同步更新 `CHANGELOG.md`。
- 提交前运行 `pnpm check:conventions`、`pnpm typecheck`、`pnpm lint` 和 `pnpm test`。不得在没有明确授权时创建、移动或推送发布标签。

