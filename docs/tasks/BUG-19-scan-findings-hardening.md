# BUG-19：扫描发现的安全加固项

## 背景

2026-11-02 全量扫描的代码审计结论为「无高危、无中危，2 个低危 + 6 条建议」。本任务落地其中属于代码级安全与边界加固的项：

- 低危 1：`src/features/comments/actions.ts` 三个入口在 Zod 校验前使用原始客户端 `poemId` 拼装登录重定向 `returnTo`。
- 低危 2（记录与固化）：开发邮件 transport 会输出含验证码的邮件，生产已被 env 校验强制排除；补充说明注释。
- 建议：4 个 Client Component 从 `@/server/validation` 导入共享常量，违反分层边界。
- 建议：SSE 通知流允许 suspended 账号（只读）是有意行为，补注释固化。
- 建议：`sanitize-response.ts` 用固定字段黑名单，改为 token/password 模式匹配，覆盖未来新增的令牌字段。
- 建议：`scripts/reset-user-password.mjs` break-glass 改密不写审计日志（`bootstrap-admin.mjs` 有），不可追溯。

## 范围

- [ ] `comments/actions.ts`：重定向 `returnTo` 先经 `commentIdSchema` 校验，非法 UUID 回退到安全路径。
- [ ] `src/lib` 新增评论/治理共享常量模块，`src/server/validation` re-export；4 个 Client Component 改从 `src/lib` 导入。
- [ ] `sanitize-response.ts` 改为匹配 key 中含 `token` / `password` 的模式（大小写不敏感），更新 `tests/unit/auth-response.test.ts` 并新增 resetToken/verificationToken 用例。
- [ ] `api/notifications/stream` 与 `requireExistingUser` 处补注释，固化 suspended 只读订阅意图。
- [ ] `reset-user-password.mjs` 在同一事务内写入 `admin_audit_log`（新增 `user_password_recovered` 枚举值与 versioned migration），`admin_id` 记录恢复对象并带 CLI 来源 metadata。
- [ ] 补充/更新对应单元测试。

## 非目标

- [ ] 不在 `account/layout.tsx` 加布局级认证护栏：匿名深链的 `next` 返回参数已被 E2E（auth-flow、poem-flow）断言，布局级统一 redirect 会改变已验证的返回语义，留待有 E2E 环境的专项任务。
- [ ] 不改变公开用户流程、产品范围或 DTO 结构。
- [ ] 不升级依赖（见 CHORE-6）。

## 架构边界

Client Component 不得 import `src/server` 模块；共享常量放 `src/lib`。服务端入口校验链不变；migration 走 `pnpm db:generate` 生成版本化 SQL，禁止 schema push。审计记录只读、不记录凭据或密码。

## 验收条件

- [ ] 三处 `returnTo` 不再直接拼接原始 `poemId`。
- [ ] 无 Client Component 从 `@/server` 导入（grep 验证）。
- [ ] `sanitize-response` 单测全过且覆盖新字段。
- [ ] migration 链连续（`pnpm db:check` 通过），恢复脚本写入审计行。
- [ ] `pnpm typecheck`、`pnpm lint`、`pnpm test`、`pnpm check:conventions` 通过；`pnpm build` 在补齐本地环境变量后通过。

## 发布影响

- 预期版本影响：`PATCH`
- migration / 环境变量 / 部署顺序：新增 `drizzle/0009_*.sql`（枚举值追加，PG12+ 事务内可用），部署时随既有 migration 流程执行；回滚代码不影响枚举存在。
- 兼容性与回滚边界：枚举只增不改，旧版本应用不受影响；审计行写入与密码更新同事务，失败整体回滚。

## 测试

`tests/unit/auth-response.test.ts` 更新；`pnpm typecheck`、`pnpm lint`、`pnpm test`、`pnpm db:check`。`tests/integration/reset-user-password.test.ts` 需本地测试库（Docker 未运行时记录环境阻塞，不虚报）。

## 风险 / 回滚

`ALTER TYPE ... ADD VALUE` 生成语句需人工核对 drizzle-kit 输出；恢复脚本失败时不得产生密码已改而无审计的半状态（同事务保证）。单文件回滚。

## 状态

- 状态：`进行中`
- 负责人：luckymouse2332
- 分支：`fix/bug-19-scan-findings-hardening`
- 完成日期：未完成
