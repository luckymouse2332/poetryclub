# M6.2 移动端导航信息架构 Design QA

**Source visual truth**

- 旧版问题基线：`C:/Users/mouse/AppData/Local/Temp/codex-clipboard-5b94f5a6-55df-41c2-a13e-5d8487e797b7.png`，移动端同时常驻品牌块、全站导航与账户二级导航。
- 信息架构参考：`C:/Users/mouse/AppData/Local/Temp/codex-clipboard-db7b8538-5d07-4441-9fc2-f5dc01f57d37.png` 与 `C:/Users/mouse/AppData/Local/Temp/codex-clipboard-05e79987-1dea-4549-9dd4-08d7fa02fade.png`。只参考单行刊头和明确菜单状态，没有复制 Poetry Foundation 的品牌、字体、搜索或黑白视觉。

**Implementation evidence**

- 匿名关闭状态：`output/playwright/m6-2-mobile-header-anonymous-settled.png`，390 × 844，`deviceScaleFactor: 1`。
- 匿名全站菜单：`output/playwright/m6-2-mobile-menu-anonymous-settled.png`，390 × 844，`deviceScaleFactor: 1`。
- 管理员账户页：`output/playwright/m6-2-mobile-account-admin-settled.png`，390 × 844，带未读通知状态。
- 管理员账户菜单：`output/playwright/m6-2-mobile-account-menu-settled.png`，390 × 844。
- 桌面回归：`output/playwright/m6-2-desktop-header-admin.png`，1440 × 900。
- 旧版与新版账户层级：`output/playwright/m6-2-before-after-account-navigation.png`。
- 关闭状态参考对照：`output/playwright/m6-2-reference-header-comparison.png`。
- 展开状态参考对照：`output/playwright/m6-2-reference-menu-comparison.png`。

**Full-view comparison evidence**

旧版在进入账户页前已经占用两段导航，账户二级导航继续贴在 Header 下方。新版移动端始终只有 64px 单行刊头，左右各使用相同的 48px 网格轨道，站名以独立中列实现几何居中。账户页的二级导航位于页面标题和说明之后，页面层级清楚变为全站刊头、页面标题、页面内导航、正文。

全站菜单使用接近全屏的暖纸表面，诗作、关于、通知和权限控制后的管理入口采用大点击区与细分隔线。账户入口不在左侧重复；首字符圆标打开我的诗作、账户信息、账户安全和登出。未读通知只通过圆标附近和通知条目末端的小暗红点表达。

**Required fidelity surfaces**

- Fonts and typography：站名、菜单和账户首字符继续使用项目衬线字体；功能说明与状态继续使用现有无衬线 Token。
- Spacing and layout rhythm：移动刊头固定为单行 64px；左右交互区域均不少于 44px；菜单使用较大行高、充分留白与细分隔线。
- Colors and visual tokens：继续使用暖纸背景、墨色正文、边框色和印章红，没有新增渐变、毛玻璃、大阴影或彩色头像。
- Image quality and asset fidelity：导航不需要图片资产，没有新增占位图或装饰素材。
- Copy and content：桌面入口、账户入口、通知和管理权限语义均保持；移动端只重新分配入口职责。

**Interaction and state evidence**

- 匿名状态显示“登录”；普通成员使用显示名首字素；管理员保留管理入口。
- `Intl.Segmenter` 覆盖中文、英文、重音字母、日文、组合字符与 emoji，并以 `Array.from` 提供简单回退。
- 有未读通知时显示暗红点，无未读通知时不渲染状态点；通知数据仍使用现有服务与 DTO。
- 汉堡按钮支持 Enter、Space，菜单支持 Escape、关闭按钮、菜单项导航、焦点归还和 1024px 断点自动关闭。
- 320、375、390、430、768、1024 与 1440px 已检查；移动端无水平溢出，桌面导航结构和视觉保持。
- Playwright 使用现有 `http://localhost:3000` 开发服务器完成检查，没有启动或重启服务器。

**Findings and comparison history**

- Pass 1：识别出旧版 P1 信息层级冲突，站名、主导航和账户导航累计占用过高；“我的”同时承担全站和账户职责。
- Fix 1：建立单行移动刊头，拆分全站菜单与账户菜单，将账户二级导航移入正文。
- Pass 2：并排图确认结构与参考一致，同时保留回中诗社的暖纸、宋体和暗红语言；修正焦点环为印章红。
- Pass 3：匿名、普通成员、管理员、未读和无未读状态通过；桌面 1440px 回归无变化。没有剩余 P0、P1 或 P2 问题。

**Verification**

- [x] `pnpm check:conventions`
- [x] `pnpm typecheck`
- [x] `pnpm lint`
- [x] `pnpm test`：16 个测试文件、215 项测试通过。
- [x] Playwright：移动 Header、成员账户导航、通知桌面 Popover、管理员与未读移动导航通过。
- [x] `pnpm build`

final result: passed
