# BUG-8 Dropdown 阴影动画闪烁修复

## 背景

账户 Dropdown 与通知 Popover 的展开动画直接在带阴影的浮层上使用 `clip-path`。动画终点仍会裁掉元素边界外的阴影，动画属性结束并移除后阴影才完整出现，产生一次明显闪烁。

## 范围

- [x] 调整共享展开动画，让阴影在动画结束前平滑显现。
- [x] 补充回归测试，锁定动画裁剪区域会为浮层阴影预留空间。

## 非目标

- [x] 不改变 Dropdown、Popover 的结构、定位、尺寸或交互行为。
- [x] 不调整全局阴影 Token、动画时长和缓动曲线。

## 架构边界

修复只修改纯 UI 动画样式及其测试。账户和通知功能继续复用现有 shadcn/ui 与 Radix 结构，不改变服务端数据、认证、权限或通知实时逻辑。

## 验收条件

- [x] 展开账户 Dropdown 和通知 Popover 时，阴影不会在动画结束后突然出现。
- [x] 收起动画、碰撞定位与 reduced-motion 行为保持不变。
- [x] `pnpm typecheck`、`pnpm lint` 和 `pnpm test` 通过。

## 发布影响

- 预期版本影响：`PATCH`
- migration / 环境变量 / 部署顺序：无。
- 兼容性与回滚边界：可单独回滚共享浮层动画样式与对应测试。

## 测试

已新增共享浮层动画的样式契约测试。`pnpm check:conventions`、`pnpm typecheck`、`pnpm lint` 和 221 个单元测试通过。

## 风险 / 回滚

扩大 `clip-path` 的终点区域可能增加极小的绘制区域，但不会改变布局或命中范围。若产生兼容性问题，可回滚为原裁剪范围。

## 状态

- 状态：`已完成`
- 负责人：Codex
- 分支：`feat/m6-0-sitewide-visual-redesign`
- 完成日期：2026-08-11
