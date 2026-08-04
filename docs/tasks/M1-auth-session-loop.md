# M1：认证会话闭环

## 背景

来源：MVP 的“注册 / 登录，进入社区”核心流程，以及 `docs/architecture.md` 的认证边界。M0 已完成 Better Auth 邮箱密码框架和数据库会话表，但尚未提供统一的服务端当前用户访问方式、认证态导航、受保护账号页和安全登出。

前置检查发现仓库中不存在用户指定的 `docs/design-system.md`。本任务不扩大范围创建新视觉体系；界面仅复用 `src/app/globals.css` 中现有设计令牌和现有 UI 组件，并把缺失文档记录为风险。

## 需求与范围

- [x] 在 `server-only` 模块中统一获取当前会话、当前用户并要求登录；缺失、无效和过期会话一致按未登录处理。
- [x] 导航栏由 Server Component 读取认证状态，只渲染最小安全用户视图，不向客户端传递完整会话或 token。
- [x] 使用 Better Auth 服务端能力实现幂等登出，使当前数据库会话失效并清除 Cookie，随后跳转安全站内页面。
- [x] 创建 `/account` 最小受保护页面，展示名称、邮箱、账号创建时间和认证状态。
- [x] 未登录访问 `/account` 时跳转 `/login`，并携带经过固定生成的站内返回地址。
- [x] 集中校验登录成功后的 `next` 参数，只允许安全站内相对路径，非法值回退 `/`。
- [x] 增加单元、集成和 Playwright 覆盖认证导航、账号页、失效会话、登出、重定向和敏感字段泄漏。
- [x] 运行完整验收命令并完成安全复核。

## 非目标

- 不实现诗作、评论、收藏、社刊、通知或其他业务功能。
- 不增加 OAuth、邮箱验证、密码找回、资料编辑、头像上传、密码修改、账号删除、会话管理、角色或管理员权限。
- 不增加全局 middleware / proxy 认证层，不使用客户端界面隐藏代替服务端保护。
- 不使用 localStorage 或客户端全局认证状态库。
- 不修改认证技术选型，不新增大型依赖。
- 除非实现闭环确有必要，不修改数据库 Schema；当前设计预计无需 Schema 或 migration 改动。
- 不创建新的视觉体系；设计系统文档缺失期间仅复用已有语义化令牌。

## 架构边界

- 会话读取集中在 `src/server/auth`，模块首行导入 `server-only`；页面、Server Action 和业务服务不得手写 Cookie / 会话解析。
- 服务端会话通过 Better Auth `auth.api.getSession({ headers })` 权威读取；敏感写操作禁用 Cookie cache（如配置存在）。
- 只向渲染层返回明确的最小 DTO；不返回 session token、provider token、密码、IP 或 User-Agent。
- `/account` 在页面服务端调用统一 `requireCurrentUser`，保护靠服务端会话而不是客户端状态。
- 登出 Server Action 是外部可调用写入口：Better Auth 从请求的签名 Cookie 认证并只删除当前会话；缺失会话按幂等成功处理，Cookie 由 `nextCookies` 集成失效，且只跳转固定站内路径。
- 返回地址校验是纯函数并集中复用；输入按不可信 URL 参数处理。
- 不缓存跨请求用户数据；如使用 React `cache`，仅用于单次服务端渲染请求去重。
- `src/app` 保持薄层，依赖方向保持 `app → features → server`。

## 验收条件

- [x] 提供统一的 `getCurrentSession`、`getCurrentUser`、`requireCurrentSession`、`requireCurrentUser` 服务端接口。
- [x] 未登录导航显示“登录”“注册”，已登录显示安全名称 / 邮箱、“账号”“登出”。
- [x] 未登录、无效或过期会话不能访问 `/account`；有效会话可访问。
- [x] 登出使当前服务端会话失效并清除 Cookie；重复登出不抛异常；登出后 `/account` 被拒绝。
- [x] `/account` 只展示名称、邮箱、创建时间和“已登录”。
- [x] 合法站内 `next` 被接受；外部、协议相对、协议、反斜杠及编码绕过均回退 `/`。
- [x] 浏览器可见响应不包含 session token、provider token 或密码字段。
- [x] `pnpm typecheck`、`pnpm lint`、`pnpm test`、`pnpm test:e2e`、`pnpm build`、`pnpm db:check` 全部通过。
- [x] 安全复核无未处理的阻断级或严重问题。

## 测试

- 单元：7 个文件、54 个用例通过；覆盖返回地址校验、会话最小 DTO / 过期处理、用户安全展示、敏感认证 JSON 清理和 M0 基线。
- 集成 / Playwright：9 个用例通过；使用真实 Better Auth 与 PostgreSQL 覆盖匿名导航、账号页服务端跳转、无效 Cookie、注册后显式登录、有效会话、登出、重复登出、旧 Cookie 重放拒绝和响应 token 清理。
- 最终验收：`pnpm typecheck`、`pnpm lint`、`pnpm test`、`pnpm test:e2e`、`pnpm build`、`pnpm db:check` 全部通过。Windows 环境默认 3000 端口因系统 `EACCES` 无法监听，E2E 使用配置支持的 `PLAYWRIGHT_BASE_URL=http://localhost:4000` 运行并通过 9/9。

## 复核记录

- 首轮：无阻断级或严重问题；发现 `server → features` 的返回地址工具反向依赖，已将工具移至 `src/lib/safe-redirect.ts` 并更新全部导入。
- 首轮建议删除登出前无效的重复会话查询。进一步核对 Better Auth 源码后，登出改为先用权威会话调用受对象授权保护的 `revokeSession`，确认数据库记录已删除后再由 `signOut` / `nextCookies` 清除 Cookie；数据库删除失败时保留 Cookie 并抛错，允许安全重试。
- 复核确认：HTTP `auth.handler` 路径与程序化 Server Action 路径的 Cookie 写入互斥，不存在重复 `Set-Cookie`；依赖方向修复无回归。
- 最终复核确认：强化登出中的 token 只存在于 `server-only` 局部；`revokeSession` 会权威认证当前会话并验证 token 所有权；并发 / 重复登出稳定，真实删除错误不会被吞掉。
- 最终结论：0 个阻断、0 个严重、0 个一般问题，可完成 M1。

## 风险 / 回滚

- 风险：`docs/design-system.md` 缺失，无法核对书面视觉规范；本任务严格复用现有 CSS 语义令牌和组件以降低偏差。
- 风险：E2E 真实认证持续依赖可用 PostgreSQL、已安装 Chromium 和正确的测试环境变量；本次环境具备并已通过。
- 风险：服务端导航读取会话使相关路由动态渲染；这是避免认证态串号和首屏闪烁的必要取舍。
- 风险：全站服务端导航会为每个请求执行一次权威数据库会话读取；已用 React `cache` 限定为同一渲染请求去重，后续需关注数据库负载。
- 回滚：移除 M1 新增会话适配、账号页和登出接线，恢复 M0 导航与登录默认跳转；本任务不改变 Schema，无数据库回滚。

## 状态

- 状态：`已完成`
- 负责人：项目维护者
- 完成日期：2026-08-01
