# CHORE 样式架构收敛

## 背景

站内状态提示、管理列表和分页目前重复拼装视觉与语义，组件级动效散落在 `globals.css`，部分 UI 组件仍保留上游字号和任意值。此维护任务在不改变业务规则与 URL 的前提下，收敛组件基线、Token、局部样式和测试定位方式。

## 范围

- [x] 通过 shadcn/ui CLI 生成 Alert、Item / ItemGroup 和 Pagination，映射项目 Token、字号和圆角，移除 `dark:` 变体。
- [x] Alert 提供 `default | success | warning | danger` 变体；迁移认证、诗作、账户、通知和管理功能中的完整状态提示框。
- [x] 交互错误使用 `role="alert"`，异步成功使用 `role="status"`，静态说明不创建 live region；成功、警告和错误使用固定 Lucide 图标。
- [x] 六组管理列表使用 `ItemGroup + ItemSeparator + Item`，相关 `Admin*Card` 内部组件改名为 `Admin*Item`，删除父容器对 Card 内部结构的样式覆盖。
- [x] 新增基于上游组件的 `PaginationNavigation`，接收 `page`、`pageCount`、`previousHref`、`nextHref`、`ariaLabel` 和 `className`；三个 feature 保留各自的查询参数和 URL 生成逻辑。
- [x] 把移动导航、账户遮罩和共享下拉动效分别迁入对应 CSS Module，`globals.css` 只保留 Token、基础样式、Radix 通用浮层行为和 reduced-motion。
- [x] 增加 fast / normal / slow 动效 Token、enter / exit easing，以及 floating / header / sheet 层级 Token，并替换对应任意值。
- [x] 收敛 UI 组件 `className` 合并方式、Popover / Dropdown 圆角、上游字号映射和首页语义色 Token。
- [x] 更新组件单元测试、E2E 语义定位和设计系统基线。

## 非目标

- [x] 不更改分页 URL、管理员权限、通知实时逻辑、服务端接口、数据库或业务规则。
- [x] 不引入新的动画库，不更改页面信息架构。
- [x] 字段错误、Badge、必填标记和普通内联状态文字保持现有专用语义。

## 架构边界

新增 UI 原语位于 `src/components/ui`，业务组合位于 `src/components` 或对应 feature。Pagination 展示组件不解析业务查询参数。管理 Item 只接收现有 DTO，不访问数据库。组件来源与变体登记遵守 `docs/design-system.md` 第 10 节基线表。

## 验收条件

- [x] Alert 的四种视觉变体及三类动态状态具有一致图标和正确 live-region 语义，不重复声明 `aria-live`。
- [x] 六组管理列表具有 `item-group`、`item` 和 `item-separator` 语义结构，不再依赖 `data-slot="card"` 覆盖。
- [x] 三个分页调用方在首页、末页和中间页生成原有 URL，禁用边界不产生可点击链接。
- [x] 组件级动效位于 CSS Module；全局文件只保留全局职责，reduced-motion 仍覆盖全部过渡和动画。
- [x] fast 为 160ms、normal 为 220ms、slow 为 260ms；floating 为 50、header 为 60、sheet 为 70，并替换对应任意值。
- [x] UI 组件调用方覆盖默认字号时只保留一个字号类，Popover / Dropdown 不含 `rounded-[10px]`，首页不直接使用 `--palette-ink`。
- [x] 测试使用角色、可访问名称和 `data-slot` 定位，不依赖旧的组件实现类名。

## 发布影响

- 预期版本影响：`PATCH`
- migration / 环境变量 / 部署顺序：无。
- 兼容性与回滚边界：可按 Alert、Item、Pagination、动效 Token 四组分别回滚；外部 feature props 保持兼容。

## 测试

单元测试已覆盖 Alert 状态、Item 组合、Pagination 边界与 href、className 字号覆盖；相关 Playwright 已回归用户、诗作、邀请码、公告、审计、通知和导航。`check:conventions`、typecheck、lint、220 个单元测试和生产构建通过。

## 风险 / 回滚

批量语义迁移可能改变测试定位，Item 结构也可能影响管理操作按钮布局。逐类迁移并在每类完成后执行单元测试和对应 E2E；分页 URL 通过现有 feature 生成函数保持不变。

## 状态

- 状态：`已完成`
- 负责人：Codex
- 分支：`feat/m6-0-sitewide-visual-redesign`
- 完成日期：2026-08-11
