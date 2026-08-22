# 回中诗社设计系统

## 1. 视觉定位与当前基线

回中诗社的视觉语言来自班级档案、校刊和手抄诗集。暖米色纸张承担页面与阅读表面，深色文字保证长文可读性，低饱和深蓝用于常规操作，印章红用于品牌、当前页短线和编辑性链接反馈。整体保持现代、清晰和克制，不使用重度仿古装饰。

- 产品名称：`回中诗社`，年级标识为 `2021—2024级`。
- 首页以用户提供的暖色诗集实拍图作为全幅首屏背景，不使用多图画廊、假作品或装饰性素材堆叠。
- 首页首屏由全幅照片、左侧米白水平遮罩和简短文案组成，不使用多边形裁切；窄屏提高遮罩不透明度并保留照片主体。
- 首页下半部分由“最新诗作”和“关于回中诗社”组成，使用最大 1240px 的居中正文容器；桌面端约为 41% / 59% 双栏，栏间距保持 64px 至 88px，区块标题使用短印章红横线。
- 通用内容页继续使用清晰的页面标题、卡片、表单和分页结构，不把首页的裁切造型复制到管理与认证页面。

历史 Figma 与 `docs/mockups/website.png` 只保留为设计来源。当前实现与规范的直接依据是 `src/app/globals.css`、`src/app/home.module.css`、`src/components` 和本文件；当历史效果图与现行代码冲突时，以已经验收的现行界面为准。

## 2. 配色与语义 Token

具体颜色值只定义在 `src/app/globals.css` 的 `:root` 色板中，组件只使用语义 Token。禁止在 TSX 中直接写十六进制颜色或 Tailwind 任意颜色类。

### 2.1 基础色板

| 语义 | CSS Token | 色值 | 用途 |
| --- | --- | --- | --- |
| Page | `--background` | `#F3EEE4` | 页面最外层暖米色背景 |
| Surface | `--surface` | `#F5F0E7` | 主内容与卡片 |
| Surface muted | `--surface-muted` | `#ECE3D4` | 次级区域、分段控件 |
| Paper | `--paper` | `#F8F2E7` | 阅读和输入表面 |
| Paper aged | `--paper-aged` | `#EEE2CE` | 校刊视觉中的少量旧纸层次 |
| 主要文字 | `--foreground` | `#28251F` | 标题与正文 |
| 次要文字 | `--text-secondary` | `#736B61` | 说明、元数据 |
| 弱化文字 | `--muted-foreground` | `#70685E` | 非关键提示、占位符 |
| 反色文字 | `--primary-foreground` | `#FAF7F0` | 深色按钮文字 |
| 品牌蓝 | `--primary` | `#28597F` | 主要交互 |
| 品牌蓝 hover | `--primary-hover` | `#204866` | hover |
| 品牌蓝 active | `--primary-active` | `#193A54` | active / 深色品牌区 |
| 印章红 | `--seal` | `#9B4F3F` | 少量品牌、档案印记 |
| 危险 | `--danger` | `#A64238` | 错误、删除操作 |
| 成功 | `--success` | `#527450` | 成功、确认状态 |
| 提醒 | `--warning` | `#926B2D` | 提醒、待处理状态 |

`seal` 与 `danger` 是独立语义：Seal 表示品牌或档案印记；Danger 表示错误和破坏性操作。即使视觉接近也不得互换。

### 2.2 表面、边框和状态

- `--card` / `--card-foreground`：默认 Surface 卡片。
- `--text-secondary` 在 Tailwind 主题中映射为 `text-subtle`，供页面说明和必要的次级信息使用；`text-muted-foreground` 只用于非关键提示。
- `--border`：普通边框；`--border-subtle`：纸面分隔；`--border-strong`：强调分区。
- `--secondary`：低强调的品牌浅蓝操作面；`--accent`：hover / 当前项背景。
- `--success-surface`、`--warning-surface`、`--danger-surface`、`--seal-surface`：状态浅背景。
- 状态不得只依赖颜色，必须同时包含文本、图标、边框或 `aria-*` 语义中的至少一项。

## 3. 字体

- 字体通过 `next/font/google` 加载 Noto Sans SC 与 Noto Serif SC 的可变字重，使用 `display: swap`，分别暴露 `--font-sans` 与 `--font-serif`。
- 全局表单、管理界面、分页、状态和普通页面标题以 `--font-sans` 为主，保证信息密度和控件可读性。
- 品牌名、主导航、首页介绍、首页区块标题和诗名等编辑性内容显式使用 `--font-serif`。
- 首页诗作日期与作者使用无衬线小字号元数据，诗名使用衬线正文，形成清晰层级。
- 字体回退以 `globals.css` 与局部模块样式中的实际声明为准，不在业务组件中重新定义字体栈。

`next/font/google` 在构建阶段需要可访问字体源。若构建环境无法稳定获取，任务必须报告失败，不得静默替换为另一字体方案。

## 4. 字号与行高

| Token / Tailwind 类 | 字号 | 行高 | 用途 |
| --- | --- | --- | --- |
| `text-display` | `clamp(2.25rem, 7vw, 4.75rem)` | 1.08 | 首页品牌主标题 |
| `text-page-title` | `clamp(1.75rem, 4vw, 2.5rem)` | 1.2 | 页面标题 |
| `text-section-title` | `1.5rem` | 1.35 | 区块标题 |
| `text-body-lg` | `1.125rem` | 1.8 | 引导与阅读文本 |
| `text-body` | `1rem` | 1.7 | 默认正文 |
| `text-label` | `0.875rem` | 1.5 | 表单标签与导航 |
| `text-caption` | `0.75rem` | 1.5 | 非关键补充信息 |

正文中文每行建议 28—40 字。必要信息不能使用弱化文字 Token 和过小字号。

## 5. 间距

基础节奏为 4px：`--space-1` 至 `--space-16` 覆盖 4、8、12、16、24、32、48、64px。组件内部优先使用 8/12/16px，卡片内边距使用 16/24/32px，页面区块间距使用 48/64px。

- `--space-page-gutter`：移动 16px，≥640px 为 24px，≥1024px 为 32px。
- `--space-section`：移动 48px，≥768px 为 64px。
- `--control-height`：44px，作为主要按钮、输入和图标按钮的最低交互高度。

禁止用大量任意值类绕开间距节奏。

## 6. 圆角

| Token | 值 | 用途 |
| --- | --- | --- |
| `--radius-sm` | 6px | Badge、小状态 |
| `--radius-md` | 10px | Button、Input |
| `--radius-lg` | 14px | Surface、表单卡片 |
| `--radius-xl` | 20px | 主要品牌面板 |
| `--radius-full` | 9999px | 圆形 IconButton / 胶囊 |

圆角表达现代纸张与装订感，不使用夸张气泡式圆角。

## 7. 边框与阴影

- 默认边框 1px；只有焦点、选中和印章可使用 2px。
- `shadow-card`：纸张平铺般的轻阴影。
- `shadow-floating`：仅用于少量浮层，不用于普通内容卡片。
- `shadow-focus`：品牌蓝焦点环；不得用 `outline: none` 后不提供替代焦点。
- 不使用高对比黑色投影或拟物厚阴影。
- 动效时长只使用 `fast 160ms`、`normal 220ms`、`slow 260ms`，进入和退出分别使用 `--motion-ease-enter`、`--motion-ease-exit`；组件级关键帧放在组件或共享 CSS Module。
- 层级只使用 `floating 50`、`header 60`、`sheet 70`。普通页面内容不得创建额外任意层级；`globals.css` 只保留 Token、基础样式、Radix 通用浮层行为和 reduced-motion。

## 8. 响应式断点与页面宽度

沿用 Tailwind 默认移动优先断点：`sm 640px`、`md 768px`、`lg 1024px`、`xl 1280px`、`2xl 1536px`。常用验收视口为 390px、768px、920px、1024px 和 1440px。

- `max-w-content` / `--content-max-width`：1120px，通用页面内容。
- `max-w-reading` / `--reading-max-width`：720px，长文本。
- `max-w-narrow` / `--narrow-max-width`：512px，认证表单和少量确认流程。
- 成员与管理工作区在 `lg` 至 `xl` 之间统一使用页面顶层横向二级导航，`xl` 起切换为约 224px 的常驻左侧导航；账户页在更小视口保留正文内导航，管理入口则由全站 Sheet 承载。
- 通用内容页使用 `PageContainer`。首页仍复用该组件，但允许通过局部样式放宽最大宽度，并由首页模块单独控制首屏和下半区页边距。
- 移动端不得水平滚动，长邮箱、昵称、诗名和用户正文必须可换行。

## 9. 页面骨架与当前导航

- `SiteHeader`：`lg` 以下固定为单行三段式刊头，左右使用相同宽度轨道，左侧汉堡按钮打开全站 Sheet，中间“回中诗社”保持几何居中，右侧匿名用户显示“登录”、登录用户显示单 Unicode 字素账户圆标。全站菜单只包含诗作、关于和正常管理员的管理入口；账户圆标打开通知、我的诗作、账户信息、账户安全和独立危险语义登出。有未读通知时，圆标右上角显示单个暗红点，菜单内继续显示“无未读 / N 条未读”。Sheet 保留原顶栏，遮罩与面板从顶栏下方开始，汉堡按钮原位切换为叉；打开时焦点留在该按钮上，Tab / Shift+Tab 进入导航边界，Escape、外部点击和路由跳转关闭后焦点回到触发器。账户菜单以上边缘为轴，从上向下展开。两者用半透明暖纸表面和轻度背景模糊保留页面空间关系，并在 reduced-motion 下取消位移与缩放。
- `lg` 起保留既有桌面刊头：左侧站名与年级，右侧诗作、关于、通知、正常管理员的管理入口和“我的”菜单；桌面通知继续使用最近消息 Popover。导航显示不承担权限判断。
- 账户页在小于 `lg` 时把“我的诗作 / 账户信息 / 账户安全”放在页面标题之后；`lg` 至 `xl` 之间与管理后台统一使用页面顶层横向二级导航，`xl` 起恢复工作区左侧导航，并以 `MEMBER DESK / 成员工作区` 建立与管理侧栏对等的标题层级。横向二级导航以衬线大字、上下细分隔线和印章红短线表达当前项，短线使用 React View Transition 在路由切换时平滑移动，并在 reduced motion 下取消时长；侧栏以左侧边线、浅印章底色和文字颜色表达当前项。
- `PageContainer`：统一最大宽度、响应式页边距和可选窄 / 阅读宽度。
- `PageHeader`：eyebrow、标题、描述和可选 actions；标题层级由调用方指定。
- `Section`：统一垂直节奏，可包含区块标题、描述和 actions。
- 管理后台首页入口使用管理场景专用的 `AdminDashboardCard`，复用通用 Card 结构但不扩展其 API。卡片提供 paper、muted、plain 三种无边框表面层级，并以有间距的响应式网格排列；不得把这些业务样式并入通用 Card。
- 首页首屏：小屏为上文下图并使用横向锯齿纸边，`lg` 起为左文右图并切换为竖向锯齿纸边；只使用 `poetry-collection.jpg`，不使用渐变遮罩。主操作和“查看全部诗作”采用文字链接，箭头在 hover / focus-visible 时轻微右移。
- 首页最新诗作：日期、诗名、作者按响应式网格排列。反馈只作用于诗名文字与下划线，不给整行增加背景或阴影。
- 首页关于区：与最新诗作并列或上下排列，正文和收录标准最大宽度为 43rem，保持长文可读宽度。
- 独立 About 页：以“序言 → 过去 → 现在 → 未来 → 附录”的诗社沿革组织内容。序言说明来源与继续维护的原因；“四次迁徙”以年份和正文的左右关系记录历史；“现在”使用三栏说明网站今天承担的角色；未来方向使用无卡片的两列编辑网格；更新记录降为页面末尾的最近五条修订记。各章节通过不同排版节奏区分，不使用时间轴圆点、营销式大文案或密集卡片。
- `SiteFooter`：页脚，用于展示合规信息和用户协议
  - 左栏品牌名与年级短说明，中栏版权与 ICP 备案号（合并为一行），右栏政策链接（隐私政策 / 使用条款）；
  - 三组内容在同一行内垂直居中对齐；中栏因等宽栅格始终落在页面水平中心，左右两栏相对中心对称；
  - ICP 备案号必须居中展示、链接到工信部备案系统，并使用 `target="_blank"` + `rel="noopener noreferrer"`；
  - <1024px 改为居中纵向堆叠（品牌 → 说明 → 合规信息 → 政策链接），避免三栏挤压换行；
  - 链接保持 44px 最低点击高度，横向内边距用列表负外边距抵消，使文字与内容边界对齐。

## 10. 组件状态

### Button / IconButton

- 变体：`primary`、`secondary`、`ghost`、`danger`。
- 状态：default、hover、active、disabled、loading、focus-visible。
- Loading 必须有可感知文本，设置 `aria-busy` 并阻止重复提交。
- 默认高度至少 44px；IconButton 必须提供可访问名称。

### Badge

- 变体：`neutral`、`primary`、`seal`、`success`、`warning`、`danger`。
- Badge 不默认承担按钮行为；可交互标签需要单独定义键盘和按压状态。

### Input / Textarea / FormField

- Paper 背景、统一边框 / 圆角 / 最低高度。
- FormField 统一生成 label、description、required、error、disabled 和 `aria-describedby` 关系。
- Error 同时使用 `aria-invalid`、提示文本和危险样式；disabled 不能只降低透明度而失去可读性。

### Surface / Card / Empty

- Surface 表达承载层级，变体：default、paper、muted，内边距：none / sm / md / lg；只表达承载层级，不制造业务语义。
- Card 是 shadcn 上游的卡片家族（Card / CardHeader / CardTitle / CardDescription / CardAction / CardContent / CardFooter），
  用于需要标题、描述与页脚分区的卡片；不带 variant，承载层级由 Surface 负责，两者不互相替代。
- Empty 包含真实标题、说明和可选操作；不得用假业务数据填充空白。

### Alert

- 变体：`default`、`success`、`warning`、`danger`；后三种分别固定使用成功、警告和错误 Lucide 图标。
- Alert 不默认创建 live region。交互或异步错误显式使用 `role="alert"`，异步成功与非阻断状态变化使用 `role="status"`，不得再重复声明 `aria-live`；初始页面中的静态禁用、隐藏和治理原因说明不声明 live role。
- 字段错误继续由 Field / FormField 承担，Badge、必填标记和普通内联状态文字不迁入 Alert。

### Pagination

- 通用展示组合 `PaginationNavigation` 只接收当前页、总页数、上一页 / 下一页 href、可访问名称和可选 className；不解析 feature 查询参数。
- posts、notifications 和 moderation 各自保留 URL 与筛选参数生成逻辑，通过 shadcn Pagination 的 `asChild` 组合 Next.js Link；首页和末页不生成可点击的越界链接。

### 评论与回复

- 诗作详情的“评论与补充”使用现有 Textarea、Button、Alert、Dialog 和 AlertDialog 组合，不增加新的通用 UI 原语。
- 根评论使用暖纸表面，一级回复在小屏缩进 16px、较宽视口缩进 32px；正文必须允许换行和长词断行，390px 下不能产生水平溢出。
- 已删除和对当前读者隐藏的节点保留相同结构并显示明确占位。隐藏作者视图使用 warning Alert 呈现治理原因，不能只依靠颜色表达状态。
- 回复与编辑在 Dialog 中完成，删除使用 AlertDialog 二次确认；成功后关闭浮层并把焦点交还触发器。pending 期间禁止重复提交，失败信息可在原操作位置重试。
- 通知定位目标使用 `--seal-surface` 与 `--seal-foreground` 突出显示，并设置可编程焦点；滚动定位尊重浏览器的 reduced-motion 设置。

### 组件实现基线

`src/components/ui` 同时存在两类组件，任何新增组件必须先归类再实现：

| 类别 | 含义 | 组件 |
| --- | --- | --- |
| 上游同构 | 结构、`data-slot`、子组件与上游 shadcn/ui 一致，只把类名映射到本文件的 Token 并去掉 `dark:` 变体 | `card`、`empty`、`field`、`label`、`pagination`、`separator`、`spinner`、`dropdown-menu`、`popover`、`skeleton` |
| 上游同构 + 项目变体 | 以上游为基线，额外增加项目需要的 cva 变体或行为 | `button`（variant/size/loading）、`badge`、`input`、`textarea`、`alert`（success/warning/danger 固定图标且 role 由调用方声明）、`alert-dialog`（项目 Button 变体与语义 Token）、`dialog`、`sheet`（`overlayClassName`） |
| 项目自有 | 上游没有对应组件，由本项目定义并负责维护 | `surface`、`form-field`、`icon-button`、`pagination-navigation`、`secondary-navigation`、`workspace-shell`、`auth-split-shell`、`site-header`、`mobile-global-navigation` |

- 基线为 shadcn/ui new-york（配置见 `components.json`）。本文件定义的 Token 与状态规范优先于 shadcn 默认样式；
  每个文件顶部注释必须写明与上游的差异，项目自有组件必须在注释中明确声明「不是上游组件」。
- 组件来源规则见 `AGENTS.md`「UI 组件来源规则」：除非上游没有，否则一律 `pnpm dlx shadcn@latest add` 添加后再改写，自实现组件登记进上表「项目自有」一行。
- 组件保留 shadcn 约定：`data-slot` 标记、`asChild`（Radix Slot）与 `cn()` 合并顺序。
- 当前命名统一使用 `Empty`；`FormField` 内部复用 `Field` 家族与 Radix `Label`；`Surface` 保持项目自有的承载层级语义。

## 11. 可访问性规则

- 正文和背景达到 WCAG 2.2 AA；普通文本至少 4.5:1，大文本至少 3:1。
- 所有键盘可交互元素有清晰 `:focus-visible`；焦点顺序与视觉顺序一致。
- 主要交互目标尽量达到 44×44px。
- 表单 label 必须通过 `htmlFor` / `id` 关联；说明和错误通过 `aria-describedby` 关联。
- 不以颜色作为唯一状态信息；动画尊重 `prefers-reduced-motion`。
- 动态 Alert 按状态声明唯一的 `role="alert"` 或 `role="status"`，静态说明不创建 live region。
- 使用语义化 heading、nav、main、section、form、dl；装饰元素从辅助技术隐藏。
- 390px 至 1440px 不得因固定宽度、长文本或导航造成水平滚动。

## 12. 禁止事项

1. 不使用红黑金传统诗词网站风格。
2. 不使用高饱和渐变、荧光色或大面积印章红。
3. 不用污渍、卷边、强泛黄、横线格纹干扰阅读。
4. 不使用纯黑正文或大面积纯白页面背景。
5. 不在业务组件中写具体色值或大量 `bg-[#…]` 任意值类。
6. 不为不同卡片随机配色，不让装饰压过内容。
7. 不把 Seal 当 Danger，不用颜色作为唯一反馈。
8. 不自动实现深色模式；如未来需要，应单独设计夜间阅读主题。
9. 不创建未实现功能链接、假作品、假时间线或难以删除的演示数据。
10. 不因视觉改造改变认证、授权、跳转、会话或数据库行为。
11. 不手写或复制粘贴 shadcn/ui 已有的组件；必须用 `pnpm dlx shadcn@latest add` 添加后再改写。
