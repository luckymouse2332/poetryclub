# BUG-6 账户页卡片对齐 Design QA

**Source visual truth**

- 用户问题截图：`C:/Users/mouse/AppData/Local/Temp/codex-clipboard-3560a04d-e7ac-4388-9179-84d54b792edb.png`，1602 × 1416 px。
- 截图明确标出两个目标：移除左栏上方异常空白并让左右内容对齐；让“我的作品”和“账户安全”使用相同卡片颜色。

**Implementation evidence**

- 桌面：`output/playwright/account-card-alignment/after-account-1440.png`，1440 × 900 px，CSS 视口 1440 × 900，`deviceScaleFactor: 1`。
- 手机：`output/playwright/account-card-alignment/after-account-390.png`，390 × 1679 px，CSS 视口 390 × 844，`deviceScaleFactor: 1`。
- 并排比较：`output/playwright/account-card-alignment/comparison-desktop.png`。
- 状态：E2E 管理员已登录，账户正常，桌面工作区展开。

源截图是裁切后的 1602px 图片，缺少完整刊头和工作区导航；实现截图是完整 1440px 页面，因此不对页面整体比例作像素级判断。比较范围限定为用户指出的主内容双栏、卡片起点和 Surface 颜色。

**Full-view comparison evidence**

并排图显示，旧页面右侧“我的作品”从双栏网格顶部开始，左侧“基本信息”标题和纸面卡片明显下沉；修复后左侧基本信息纸面卡片与右侧“我的作品”纸面卡片共享同一顶部基线。旧页面两张快捷卡分别为 `surface-muted` 与 `paper`；修复后两者均为 `paper`，背景、边框和阴影一致。

**Focused region comparison evidence**

本次问题集中在桌面主内容区，并排图中的三张卡片足以清楚判断边界、标题位置和底色，不需要额外裁切。E2E 同时读取了两张快捷卡的 `backgroundColor`、`borderColor` 和 `boxShadow`，三项计算样式完全相同；左侧基本信息卡与右侧第一张快捷卡的 `y` 坐标差不超过 1px。

**Required fidelity surfaces**

- Fonts and typography：继续使用现有 PageHeader、衬线卡片标题和无衬线字段元信息，字号、字重与行高未改变。
- Spacing and layout rhythm：移除 `Section` 默认 `py-section` 造成的重复上内边距；“基本信息”标题进入纸面卡片，三张卡片在桌面从同一网格基线开始。移动端保持基本信息、我的作品、账户安全的原有顺序。
- Colors and visual tokens：三张卡片均使用现有 `paper` Surface Token。两个快捷按钮继续使用 primary / secondary，表达操作优先级；这不再改变卡片本身的承载层级。
- Image quality and asset fidelity：页面没有图片资产，本次没有新增或替换视觉素材。
- Copy and content：字段、状态、说明、链接名称和按钮文字均未修改。

**Findings**

- 没有剩余 P0、P1 或 P2 问题。
- 当前开发服务器的注册表单 hydration 仍会受到既有 HMR WebSocket 问题影响；本次专项测试改用同一认证 API 建立管理员会话，不依赖客户端注册表单，账户页面服务端渲染、布局和链接均正常。

**Comparison history**

- Pass 1：源截图确认 P2 左栏重复上间距和 P2 同级快捷卡 Surface 不一致。
- Fix：移除账户页对共享 `Section` 间距的依赖，把基本信息标题放入纸面 Surface，并把“我的作品”从 `muted` 改为 `paper`。
- Pass 2：1440px 截图与运行时几何断言确认卡片顶部对齐；390px 截图确认自然单列且无水平溢出。没有新的 P0/P1/P2。

**Implementation checklist**

- [x] 左右首张卡片顶部对齐。
- [x] 两张快捷卡片背景、边框和阴影一致。
- [x] 主次按钮语义保持不变。
- [x] 手机端单列无水平溢出。

**Follow-up polish**

- 当前没有需要阻止交付的 P3 项。

final result: passed
