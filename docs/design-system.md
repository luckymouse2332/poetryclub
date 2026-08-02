# 回中诗社设计系统

## 1. 视觉定位与设计来源

回中诗社的视觉语言来自班级档案馆、校刊和手抄诗集：暖米色纸张承载内容，低饱和深蓝承担品牌与交互，印章红只作少量品牌强调和班史语义。页面应现代、清晰、克制，不做重度仿古。

- 产品名称：`回中诗社` / `2021—2024级`
- Figma：<https://www.figma.com/design/QdyP8Z9m6skhklm67oWzCN>
- 参考效果图：`docs/mockups/website.png`
- 实现边界：效果图中的作品列表、诗作详情、班史年表与人物入口只作为视觉参考，不代表 M1.5 的业务范围。
- 可追溯性：当前自动化环境访问 Figma 返回 HTTP 403；以下规范依据产品书面要求、参考效果图与仓库内已有配色草案收敛，交付时仍需人工对照 Figma。

效果图对应关系：温暖桌面底色映射为 Page；浅色主面板映射为 Surface；正文稿纸映射为 Paper；侧栏和交互映射为品牌蓝；“新”和档案印记映射为 Seal。M1.5 使用顶部导航替代效果图中的完整业务侧栏，以避免未实现入口。

## 2. 配色与语义 Token

具体颜色值只定义在 `src/app/globals.css` 的 `:root` 色板中，组件只使用语义 Token。禁止在 TSX 中直接写十六进制颜色或 Tailwind 任意颜色类。

### 2.1 基础色板

| 语义 | CSS Token | 色值 | 用途 |
| --- | --- | --- | --- |
| Page | `--background` | `#F3EDE2` | 页面最外层暖米色背景 |
| Surface | `--surface` | `#FBF8F1` | 导航、主内容与卡片 |
| Surface muted | `--surface-muted` | `#F6F0E6` | 次级区域、分段控件 |
| Paper | `--paper` | `#FFFDF8` | 阅读和输入表面 |
| Paper aged | `--paper-aged` | `#EEE2CE` | 校刊视觉中的少量旧纸层次 |
| 主要文字 | `--foreground` | `#24211D` | 标题与正文 |
| 次要文字 | `--text-secondary` | `#615B52` | 说明、元数据 |
| 弱化文字 | `--muted-foreground` | `#7A7268` | 非关键提示、占位符 |
| 反色文字 | `--primary-foreground` | `#FAF7F0` | 深色按钮文字 |
| 品牌蓝 | `--primary` | `#28597F` | 主要交互 |
| 品牌蓝 hover | `--primary-hover` | `#204866` | hover |
| 品牌蓝 active | `--primary-active` | `#193A54` | active / 深色品牌区 |
| 印章红 | `--seal` | `#A94C39` | 少量品牌、档案印记 |
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

- UI：Noto Sans SC，字重 400—700 为主。
- 诗歌或编辑性展示：Noto Serif SC，正文通常 400/500，标题可用 600/700。
- 实现：通过 `next/font/google` 自托管构建产物，以 `display: swap` 加载，并分别暴露 `--font-sans`、`--font-serif`。
- 回退：UI 使用 `PingFang SC`、`Microsoft YaHei`、sans-serif；诗歌使用 `Songti SC`、`SimSun`、serif。
- 使用原则：全局 UI 默认 sans；只有明确的品牌副标题、诗歌正文或编辑性标题使用 `font-serif`，不可用衬线字体降低表单可读性。

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

## 8. 响应式断点与页面宽度

沿用 Tailwind 默认移动优先断点：`sm 640px`、`md 768px`、`lg 1024px`、`xl 1280px`、`2xl 1536px`。强制验收视口为 390px、768px、1440px。

- `max-w-content` / `--content-max-width`：1120px，通用页面内容。
- `max-w-reading` / `--reading-max-width`：720px，长文本。
- `max-w-narrow` / `--narrow-max-width`：512px，认证与账户信息。
- 所有页面使用 `PageContainer`；移动端不得水平滚动，长邮箱和用户文本必须可换行。

## 9. 页面骨架

- `SiteHeader`：品牌、首页和认证态入口；不展示未实现业务导航。
- `PageContainer`：统一最大宽度、响应式页边距和可选窄 / 阅读宽度。
- `PageHeader`：eyebrow、标题、描述和可选 actions；标题层级由调用方指定。
- `Section`：统一垂直节奏，可包含区块标题、描述和 actions。
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

### 组件实现基线

`src/components/ui` 同时存在两类组件，任何新增组件必须先归类再实现：

| 类别 | 含义 | 组件 |
| --- | --- | --- |
| 上游同构 | 结构、`data-slot`、子组件与上游 shadcn/ui 一致，只把类名映射到本文件的 Token 并去掉 `dark:` 变体 | `card`、`empty`、`field`、`label`、`separator`、`spinner` |
| 上游同构 + 项目变体 | 以上游为基线，额外增加项目需要的 cva 变体或行为 | `button`（variant/size/loading）、`badge`、`input`、`textarea` |
| 项目自有 | 上游没有对应组件，由本项目定义并负责维护 | `surface`、`form-field`、`icon-button` |

- 基线为 shadcn/ui new-york（配置见 `components.json`）。本文件定义的 Token 与状态规范优先于 shadcn 默认样式；
  每个文件顶部注释必须写明与上游的差异，项目自有组件必须在注释中明确声明「不是上游组件」。
- 组件来源规则见 `AGENTS.md`「UI 组件来源规则」：除非上游没有，否则一律 `pnpm dlx shadcn@latest add` 添加后再改写，自实现组件登记进上表「项目自有」一行。
- 组件保留 shadcn 约定：`data-slot` 标记、`asChild`（Radix Slot）与 `cn()` 合并顺序。
- 迁移期的命名对应关系：EmptyState → `Empty`，FormField 内部改用 `Field` 家族与 Radix `Label`；`Surface` 保留原名与原语义。

## 11. 可访问性规则

- 正文和背景达到 WCAG 2.2 AA；普通文本至少 4.5:1，大文本至少 3:1。
- 所有键盘可交互元素有清晰 `:focus-visible`；焦点顺序与视觉顺序一致。
- 主要交互目标尽量达到 44×44px。
- 表单 label 必须通过 `htmlFor` / `id` 关联；说明和错误通过 `aria-describedby` 关联。
- 不以颜色作为唯一状态信息；动画尊重 `prefers-reduced-motion`。
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
