# BUG-10 桌面工作区二级导航统一

## 背景

问题截图 `docs/mockups/管理.png` 与 `docs/mockups/账户.png` 显示，桌面工作区中的管理导航、账户导航采用了不同的渲染位置和视觉变体。目标图 `docs/mockups/目标.png` 要求两者统一为暖纸背景上的衬线文字导航，以印章红文字和短横线表示当前项，并在路由切换时让短横线平滑移动。

## 范围

- [ ] 让管理与账户工作区在 1024px 起共用 `WorkspaceShell` 中同一套 `SecondaryNavigation`。
- [ ] 按 `docs/mockups/目标.png` 统一桌面容器、衬线字号、间距、选中态和分隔线。
- [ ] 使用 Next.js 16.2 与 React View Transition 提供的共享元素动效，让当前项短横线在路由切换时平滑移动，并尊重 reduced motion。
- [ ] 删除不再使用的桌面侧栏导航组件与对应布局分支。
- [ ] 将账户正文内导航限制在小于 1024px，避免桌面端重复渲染。
- [ ] 更新响应式测试并完成 1024px、1280px 视觉 QA。

## 非目标

- [x] 不改变管理和账户各自的链接集合、路由匹配与 active 语义。
- [x] 不删除小于 1024px 的账户正文内导航。
- [x] 不修改认证、管理员权限或服务端数据逻辑。
- [x] 不为导航引入新的运行时依赖。

## 架构边界

共享视觉继续由 `src/components/secondary-navigation.tsx` 和 `WorkspaceShell` 提供；feature 模块只保留各自的导航数据。`src/app` 只组合布局，不复制导航样式或 active 规则。路由活动态继续集中在小型 Client Component 中，页面与布局保持 Server Component。

## 验收条件

- [ ] 1024px 与 1280px 下管理与账户页面的二级导航使用相同容器、间距、字号、选中态和横向滚动规则。
- [ ] 桌面导航与 `docs/mockups/目标.png` 的上下分隔线、文字层级和印章红短横线一致。
- [ ] 点击不同导航项时，当前项短横线产生共享元素切换动画；reduced motion 下动画时长归零。
- [ ] 小于 1024px 的账户正文导航保持可用。
- [ ] 每个视口只显示一套对应的二级导航。
- [ ] 不再存在未使用的 `WorkspaceNavigation` 组件。
- [ ] `pnpm typecheck`、`pnpm lint`、`pnpm test` 和相关 E2E 通过。

## 发布影响

- 预期版本影响：`PATCH`
- migration / 环境变量 / 部署顺序：无。
- 兼容性与回滚边界：可单独恢复账户布局的导航开关与正文导航断点类。

## 测试

扩展账户与管理工作区的断点及动效 E2E，运行 conventions、typecheck、lint、单元测试和相关 Chromium E2E；在 1024px、1280px 捕获两套实现并与目标图完成视觉对比。

## 风险 / 回滚

主要风险是 1024px 同时出现外层和正文内两套账户导航、实验性 View Transition 配置导致兼容问题，或共享元素名称重复。通过互补断点类、唯一活动指示器和 E2E 可验证；不支持 View Transitions 的浏览器继续保留无动画导航。

## 状态

- 状态：`进行中`
- 负责人：Codex
- 分支：`feat/m6-0-sitewide-visual-redesign`
- 完成日期：
