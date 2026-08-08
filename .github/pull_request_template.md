## 关联任务

填写任务编号和文档链接，例如 `M4.1` 与 `docs/tasks/M4.1-content-access-control.md`。

## 变更内容

说明实际改变的行为、明确未包含的范围，以及需要重点复核的安全或架构边界。

## 发布影响

- [ ] 不需要单独发布。
- [ ] PATCH：向后兼容的修复。
- [ ] MINOR：向后兼容的新功能。
- [ ] MAJOR：存在不兼容变化，已在正文和提交 footer 中说明。

填写 migration、环境变量、部署顺序、备份和回滚要求；不适用时写“无”。

## 验证

列出实际运行的命令和结果。没有运行的检查必须说明原因，不能标记为通过。

- [ ] `pnpm check:conventions`
- [ ] `pnpm typecheck`
- [ ] `pnpm lint`
- [ ] `pnpm test`
- [ ] `pnpm test:integration`
- [ ] `pnpm test:e2e`
- [ ] `pnpm build`
- [ ] `pnpm db:check`

## 界面检查

涉及界面时附真实截图或说明检查过的视口、认证状态、交互和无障碍行为；不涉及界面时写“无”。
