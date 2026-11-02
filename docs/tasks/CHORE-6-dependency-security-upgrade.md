# CHORE-6：依赖安全升级

## 背景

2026-11-02 `pnpm audit --prod` 报告 38 个漏洞（8 critical / 13 high / 12 moderate / 5 low）。生产可达的关键项：next 16.2.12（图像优化等 RCE 公告，修复版 ≥16.3.6，部分需 16.4.1）、better-auth ^1.6.25（OAuth state 冒登 critical，项目未启用 OAuth 但应升级 ≥1.7.7）、zod ^4.4.3（high，≥4.6.6）；dev 链：vite ^6.4.3、vitest 链上的 tinypool 等。升级前由专项研究确认破坏性变更（Next 16.2→16.4 的 experimental 变化、better-auth 1.7 API 变化）。

## 范围

- [ ] 按研究结论升级 `next`（保持精确锁定）与 `eslint-config-next` 至同线安全版本。
- [ ] 升级 `better-auth` 至 ≥1.7.7，适配 auth 配置/插件 API 变化。
- [ ] 升级 `zod` 至 ≥4.6.6。
- [ ] 升级 `vite` / `vitest`（含传递依赖），消除 dev 链 critical/high。
- [ ] 重跑 `pnpm audit` 至 prod 依赖无 critical/high；记录仍存在的传递告警与原因。
- [ ] 全量门禁复跑：typecheck、lint、test、check:conventions、db:check、build（补齐本地环境变量后）。

## 非目标

- [ ] 不新增/替换功能重叠的库，不引入新运行时依赖。
- [ ] 不升级 React 主版本（保持 Next 兼容线）、不迁移 Tailwind。
- [ ] 不创建发布标签、不发 Release（发布由负责人按工作流执行）。

## 架构边界

技术栈组合由架构文档固定，升级只做同线安全修复。Next 升级须先阅读 `node_modules/next/dist/docs/` 中相关指南与新版 deprecation 说明，改动后不得破坏 app → features → server 分层与 Server Actions 安全链。

## 验收条件

- [ ] `pnpm audit --prod` 无 critical/high；剩余告警有明确记录与理由。
- [ ] `pnpm typecheck`、`pnpm lint`、`pnpm test`、`pnpm check:conventions`、`pnpm db:check` 全部通过。
- [ ] `pnpm build` 通过（本机需临时提供 RESEND 环境变量，仅验证用，不入库）。
- [ ] 集成/E2E 因本地无 PostgreSQL/Redis 无法运行时，在任务文档记录环境阻塞，不虚报。

## 发布影响

- 预期版本影响：`PATCH`（安全修复；若升级引入兼容性适配按实际再评估）
- migration / 环境变量 / 部署顺序：无新 migration、无新环境变量。
- 兼容性与回滚边界：lockfile 与 package.json 单提交回滚；better-auth 适配如涉及行为变化单独成提交。

## 测试

`pnpm typecheck`、`pnpm lint`、`pnpm test`、`pnpm build`、`pnpm audit --prod`；重点回归 auth 相关单测（session-model、auth-response、password-*）。

## 风险 / 回滚

Next 小版本升级可能改变构建/缓存行为，须在 build 后人工核对关键页面；better-auth 1.7 若调整插件接口，回滚该提交并重新评估版本。

## 状态

- 状态：`进行中`
- 负责人：luckymouse2332
- 分支：`chore/chore-6-dependency-security-upgrade`
- 完成日期：未完成
