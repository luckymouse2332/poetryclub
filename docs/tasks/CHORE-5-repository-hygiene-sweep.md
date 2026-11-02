# CHORE-5：仓库卫生与文档一致性清扫

## 背景

2026-11-02 对 `master`（v1.7.0）做了全量扫描（代码安全审计、仓库/发布审计、质量门禁实测）。代码质量与安全基线良好，但发现一批仓库治理问题：`audit-lint.log` 被误提交、`design-qa.md` 工作残留入版控、`docs/tasks/README.md` 表格损坏、根 `README.md` 版本信息停留在 v1.1.0、`docs/architecture.md` 引用已删除的 `temp.md`、`.dockerignore` 未排除本地输出目录、已实现模块遗留 `.gitkeep`、CHORE-2 遗留过时验收项，以及 `mirror`（CNB）远端缺 release/v1.4.0–v1.6.0 分支与 v1.1.0–v1.4.0 标签、多出 `m1-auth-session` 轻量标签。

## 范围

- [ ] 删除被跟踪的 `audit-lint.log`，在 `.gitignore` 增加通用 `*.log` 忽略。
- [ ] 把 `design-qa.md` 移出版控（保留到 `output/` 作本地参考）。
- [ ] `.dockerignore` 排除 `output/` 与 `.codex-overnight/`，缩小构建上下文。
- [ ] 修复 `docs/tasks/README.md` 第 95 行 BUG-13 行损坏、M6.8–M6.11 表格断裂，登记本任务与 BUG-19、CHORE-6。
- [ ] 更新根 `README.md`：稳定版本改为 v1.7.0，功能清单补评论、特辑、通知、公告等已实现能力。
- [ ] 修正 `docs/architecture.md`：`temp.md` 引用改为真实来源，模块树补 `about`、`collections` 并标注预留空壳。
- [ ] 删除已实现模块（comments/moderation/notifications/posts）遗留的 `.gitkeep`。
- [ ] 补记 CHORE-2 过时验收项（M5 通知分支已合入）。
- [ ] 同步 `mirror` 远端：推送 release/v1.4.0–v1.6.0 分支与 v1.1.0–v1.4.0 标签；删除本地与 `mirror` 上的 `m1-auth-session` 轻量标签并记录。

## 非目标

- [ ] 不重写提交历史、不移动或删除任何 `v*` 发布标签。
- [ ] 不修改产品代码、数据库或运行时行为（代码级加固见 BUG-19）。
- [ ] 不升级依赖（见 CHORE-6）、不创建发布标签、不发 Release。

## 架构边界

只修改仓库治理文件与 Git 引用。文档改动必须与实际实现一致，不得虚报能力；`docs/tasks/README.md` 的编号、标题、状态与文件链接保持一致。mirror 同步只推送 `origin` 上已存在的 ref，禁止向两个远端产生不同历史。

## 验收条件

- [ ] `git ls-files` 不再包含 `audit-lint.log`、`design-qa.md`；工作区干净。
- [ ] `docs/tasks/README.md` 表格连续渲染，新任务行格式正确。
- [ ] 根 README 版本与 v1.7.0 一致，功能描述与产品文档一致。
- [ ] `git ls-remote mirror` 的 release 分支与 `v*` 标签集合和 `origin` 一致，`m1-auth-session` 已删除并有记录。
- [ ] `pnpm check:conventions`、`pnpm typecheck`、`pnpm lint`、`pnpm test` 通过。

## 发布影响

- 预期版本影响：`无需单独发布`
- migration / 环境变量 / 部署顺序：无。
- 兼容性与回滚边界：文档与 ignore 规则可按提交回滚；被移出文件保留在 `output/` 本地副本。

## 测试

`pnpm check:conventions`、`pnpm typecheck`、`pnpm lint`、`pnpm test`；远端状态用 `git ls-remote` 核对。

## 风险 / 回滚

删除 `m1-auth-session` 前确认其不是发布标签且无 workflow 依赖；同步 mirror 只推已有 ref。所有改动为单文件级回滚。

## 状态

- 状态：`进行中`
- 负责人：luckymouse2332
- 分支：`chore/chore-5-repository-hygiene-sweep`
- 完成日期：未完成
