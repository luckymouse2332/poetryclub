# M6.3 移动端导航浮层与动效 Design QA

**Source visual truth**

- 用户反馈截图：`C:/Users/mouse/AppData/Local/Temp/codex-clipboard-7d971d05-09dd-4f8f-b8dc-abf859032cd9.png`，583 × 729px。截图记录了旧版账户菜单打开状态：页面内容不可辨认，头像旁存在无说明红点，菜单没有通知入口。
- 用户明确要求：页面背景应保留并模糊；通知进入头像菜单并以文字解释状态；开合需要符合触发方向的位移与缩放，不只使用透明度变化。

**Implementation evidence**

- 修正后完整截图：`output/playwright/m6-3-account-menu-blur-notifications.png`，390 × 844px，CSS viewport 390 × 844，`deviceScaleFactor: 1`，管理员登录且有 28 条未读通知。
- 左侧抽屉完整截图：`output/playwright/m6-3-global-drawer-left.png`，375 × 812px，CSS viewport 375 × 812，`deviceScaleFactor: 1`，匿名状态。
- 源截图归一化：`output/playwright/m6-3-source-normalized.png`，将 583 × 729px 归一化为 390 × 488px。
- 实现同区裁切：`output/playwright/m6-3-implementation-crop.png`，从实现截图顶部裁切 390 × 488px。
- 同尺寸并排比较：`output/playwright/m6-3-before-after-account-menu.png`，780 × 488px；左侧为旧状态，右侧为修正后状态。

**Full-view comparison evidence**

旧状态的菜单之外只剩均匀纸色，页面内容及菜单与页面的空间关系消失。修正后首页标题、正文、锯齿纸边和诗集照片仍可辨认，但通过 4px 背景模糊与低透明墨色遮罩降低注意力；菜单继续保持暖纸表面和足够对比度，没有变成毛玻璃卡片。

头像旁的小红点已完全移除。账户菜单增加“通知”行，并以暗红文字直接显示“28 条未读”；无未读状态显示“无未读”。通知、账户和登出的行高、图标基线与分隔关系一致。

**Focused region comparison evidence**

并排图本身使用 390px 同宽的顶部菜单区域，账户圆标、菜单标题、通知状态、入口图标与页面背景均可直接辨认，因此没有再放大单一控件。旧状态的红点与新状态的“通知 28 条未读”在同一对照中足以判断语义改善。

**Required fidelity surfaces**

- Fonts and typography：继续使用现有宋体 / 人文字体层级；通知标题沿用菜单项字号，未读说明使用较小无衬线状态文字，没有新增品牌字体。
- Spacing and layout rhythm：菜单仍从头像下方右对齐，宽度、内边距、44px 最低点击区和分隔节奏保持；新增通知行纳入同一列表，不改变 Header 高度。
- Colors and visual tokens：背景遮罩使用现有墨色低透明度，菜单使用暖纸透明表面，未读文字使用印章红；不再用孤立红点表达状态。
- Image quality and asset fidelity：首页照片和锯齿资产只作为被模糊的页面背景，没有替换、重采样或新增装饰图片。
- Copy and content：通知入口明确使用“通知 / N 条未读 / 无未读”，其余账户入口与登出文案保持不变。

**Interaction and accessibility evidence**

- 全站抽屉使用 `navigation-drawer-in/out`，从顶栏下方由左向右推入和收回；原顶栏保留，关闭按钮与汉堡按钮具有相同边界，只在同一位置把三道杠切换为叉。
- 账户菜单使用 `account-menu-in/out`，以上边缘为轴，通过纵向裁切和 `scaleY` 从上向下展开，关闭时反向收起。
- 背景遮罩和菜单运动分别使用 180–240ms 的开合时间；`prefers-reduced-motion: reduce` 将动画与过渡压缩到 0.01ms。
- 账户菜单通过 Escape 关闭后焦点归还头像触发器；点击模糊背景也可关闭。
- 320、375、390、430 和 768px 的普通成员、管理员、有未读与无未读状态通过；全站菜单不再重复通知入口。
- 桌面通知 Popover、账户菜单、注册、登录和登出回归通过；测试复用现有 `http://localhost:3000`，没有启动或重启服务器。

**Findings and comparison history**

- Pass 1：[P1] 菜单打开后页面背景不可辨认，用户失去空间连续性；[P1] 孤立红点没有文字解释；[P2] 开合运动过于接近淡入淡出，触发方向不清楚。
- Fix 1：增加保留页面的模糊遮罩和半透明暖纸表面；移除头像红点，将通知与明确未读文字移入账户菜单。
- Pass 2：[P2] 初版动效方向与交互含义不符：Dropdown 从右上缩放，全站菜单从上方进入并复制顶栏。
- Fix 2：Dropdown 改为从上向下展开；全站抽屉改为从左向右推入并始于顶栏下方，原顶栏和按钮位置保持。
- Pass 3：同尺寸账户菜单并排图与左侧抽屉截图确认背景、信息层级和空间关系；浏览器计算样式确认动画名称、4px blur 和 reduced-motion 生效。没有剩余 P0、P1 或 P2 问题。

**Implementation checklist**

- [x] 页面背景保留、轻度压暗并模糊。
- [x] 头像红点移除，通知入口与未读文字进入账户菜单。
- [x] 全站抽屉从左向右推入，账户菜单从上向下展开。
- [x] Escape、外部点击、焦点归还和 reduced-motion 正常。
- [x] 桌面导航与通知行为保持。

**Verification**

- [x] `pnpm check:conventions`
- [x] `pnpm typecheck`
- [x] `pnpm lint`
- [x] `pnpm test`：16 个测试文件、215 项测试通过。
- [x] Playwright：完整认证流程 7 项、完整通知流程 4 项、移动抽屉 / 账户菜单 / reduced-motion 定向流程通过。
- [x] `pnpm build`

**Follow-up polish**

- 当前没有需要阻止交付的 P3 项。

final result: passed
