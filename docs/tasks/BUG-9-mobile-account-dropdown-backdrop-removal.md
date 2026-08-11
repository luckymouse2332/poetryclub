# BUG-9 移动账户 Dropdown 遮罩移除

## 背景

移动端右上角头像打开账户 Dropdown 后，会额外渲染覆盖全屏的半透明模糊遮罩。该效果干扰页面上下文，需要移除，同时保留 Dropdown 原有关闭与焦点行为。

## 范围

- [x] 删除移动账户 Dropdown 的自定义遮罩 Portal 与专用样式。
- [x] 更新移动端 E2E 断言，确认打开账户菜单时不再产生遮罩。

## 非目标

- [x] 不修改移动端全站导航 Sheet 的遮罩。
- [x] 不改变账户 Dropdown 的内容、位置、动画和暖纸表面。
- [x] 不改变外部点击、Escape、链接跳转或焦点归还行为。

## 架构边界

修改仅限认证 feature 的账户菜单表现层与对应测试。继续使用现有 shadcn/ui DropdownMenu 和 Radix 行为，不改变认证、权限、通知数据或服务端逻辑。

## 验收条件

- [x] 移动端打开右上角账户 Dropdown 时，页面不存在账户菜单专用遮罩与背景模糊。
- [x] 点击菜单外部或按 Escape 仍可关闭菜单，关闭后焦点归还触发按钮。
- [x] `pnpm typecheck`、`pnpm lint` 和 `pnpm test` 通过。

## 发布影响

- 预期版本影响：`PATCH`
- migration / 环境变量 / 部署顺序：无。
- 兼容性与回滚边界：可单独恢复账户菜单遮罩 Portal、专用样式和 E2E 断言。

## 测试

已更新移动账户 Dropdown 的 E2E 遮罩断言，并补充长流程用例的超时和 hydration 等待。`pnpm check:conventions`、`pnpm typecheck`、`pnpm lint`、221 个单元测试和通知导航的 4 个 Chromium E2E 用例通过。

## 风险 / 回滚

移除自定义遮罩后，关闭行为完全由 Radix DropdownMenu 负责。现有 E2E 会继续覆盖外部点击、Escape 和焦点归还；如发生回归，可恢复该 Portal。

## 状态

- 状态：`已完成`
- 负责人：Codex
- 分支：`feat/m6-0-sitewide-visual-redesign`
- 完成日期：2026-08-11
