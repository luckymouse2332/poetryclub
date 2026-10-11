# CHORE-4：设计系统复用与样式精简

## 背景

全量扫描发现管理列表、目录行、编辑器、单选项、登录弹窗和邮件重复组合样式。用户确认保留纸刊基线、允许小幅统一，加入自动排序与样式检查，并整理邮件。

## 范围

- [x] 复用列表、目录、编辑器、单选项、阅读区及成员登录门槛。
- [x] 收敛 Card 列表变体、尺寸和动效 Token。
- [x] 添加 Prettier/Tailwind 排序、Stylelint、设计规则和 CI。
- [x] 抽取邮件模板，统一浅色纸刊配色并保留内联 CSS。
- [x] 更新设计规范、测试、扫描及验证记录。

## 非目标

不改变业务规则、权限、分页 URL、数据库、主题持久化或首页/关于页专属设计。不发布，不创建标签，不修改既有 output 文件。

## 架构边界

纯组合位于 components，登录门槛位于 auth feature，邮件位于 server/email。保持 app → features → server、components → lib；复用既有 shadcn 原语，保留 data-slot/asChild/cn 和无障碍关联。服务端授权不受影响。

## 验收条件

- [x] 明确重复组合迁移到共享组件，独立 Card 行为保持兼容。
- [x] 类型、规范、lint、单元、适用 E2E、生产构建通过；限制据实记录。
- [x] 五个验收尺寸、深浅主题、焦点和 reduced-motion 无回归。
- [x] 邮件保留内容、转义和有效期，共享样式与网页浅色色板一致。

## 发布影响

- 预期版本影响：无需单独发布。
- migration / 环境变量 / 部署顺序：无。
- 兼容性与回滚边界：保持现有 feature props；工具、组合、邮件可分别回滚。

## 测试

基线：283 unit、typecheck、lint 通过。增加组件变体、覆盖、标签关联、规则样例和邮件色板验证；运行 check:conventions、typecheck、lint、test、相关 Playwright 和 build。仅使用专用测试库；不发送真实邮件。

## 风险 / 回滚

类名排序、组合层级和 Card 继承可能影响覆盖或焦点。逐组迁移，参数覆盖顺序保持，截图及计算样式验证。邮件保留内联 CSS 与网页独立渲染。格式变更独立记录。

## 全量扫描与实施记录

扫描基线为当前 HEAD e8b32d8 的 218 个 TS/TSX/CSS 源文件（src 下共 228 个已跟踪文件），其中 128 个 TSX、6 个 CSS；同时检查组件、调用方、邮件、依赖及质量脚本。全量格式覆盖所有 TSX/CSS，不将每一个任意布局值机械转换为 Token。

| 发现 | 实施与保留边界 |
| --- | --- |
| 12 处目录/空状态反复组合纸面、留白、分隔 | PaperList 统一组合；后台 inset=false，公开目录 inset=true，有序目录保留 ol/li/start |
| 6 种后台 Card 重复后代选择器关闭行内分隔 | Card 的 cva list 变体；默认 Card 结构和独立分区保留 |
| 3 个正文/设置编辑器，5 个业务 Radio 选项 | EditorLayout、RadioOption 复用；原有表单校验、dirty、key 和选中值不变；展示页同步复用选项 |
| 2 种公开目录、3 种个人/治理行 | CatalogRow、ManagementRow；领域日期、操作和摘要字体由调用方决定 |
| 阅读与预览、2 个成员门槛几乎相同 | PoemReading、ReadingContext、MemberAccessGate；保留权限、文案、焦点、纯文本及返回地址 |
| 顶层导航文字类及等价尺寸/动效值重复 | 纯 navigation-styles、控件/浮层/动效 Token；删除 SiteNavLink 对不存在 brandLink 的引用 |
| 重设密码与 OTP 邮件单独维护样式 | 结构化共享模板，集中转义，浅色色值校验；保留纯文本、主题、收件人及有效期 |

6 个 CSS 文件逐一检查：globals.css 保留语义色板、主题映射和全局基础；home.module.css 保留照片、锯齿 mask、编辑式首屏；about journal 保留专属叙事布局并收敛动效；site-nav-link、mobile-global-navigation、floating-unfold 保留各自导航/状态/展开动画，统一排序和校验。没有适合替代这些专属布局的运行时 CSS 框架，不额外增加一套样式体系。

工具沿用 CVA、clsx、tailwind-merge；仅增加精确锁定的开发依赖 Prettier 3.6.2、Tailwind 插件 0.6.14、Stylelint 16.26.1、standard 38.0.0。直接依赖的 Node 要求均低于仓库 Node 20.9 基线；锁文件已通过指定 pnpm 10.33.0 的 frozen-lockfile/offline 检查。

度量口径：TSX 中静态 className 字符串从 26,589 字符降至 21,597（减少 4,992，约 18.8%，含新组合组件）。这不是总代码体积指标；加入具名 API、检查规则和 Prettier 换行后总行数增加。将基线先按同配置格式化后比较，约 60 个既有样式文件仅发生格式/类排序，业务复用变更单独由组件及浏览器契约验证。

## 验证记录

- 基线 283 unit；新增变体、覆盖、有序目录、标签、转义、色板及规则校验。既有 UI 快照更新仅涉及类排序、等价 Token、Card 变体和组状态；授权及业务断言保留。
- typecheck、lint（JS/CSS/格式，零警告）、check:conventions 已通过。最终 303 unit（34 个文件）、完整 129 项 Playwright（7.8 分钟、零跳过）、追加 6 项真实邮件模板预览（390/768/1440px）及生产 build 均通过。
- 本地沙箱禁止连接开发服务，首次浏览器启动未完成；获准本地连接后运行。生产构建与 E2E 不并行，避免 Next 构建清理父目录影响 E2E 独立缓存。

- 浏览器覆盖 22 个基础组件、公开/成员/管理页面、390/768/920/1024/1440px、深浅主题、键盘/焦点、reduced-motion、目录分页/空状态/序号及内容访问；主题套件另覆盖 320px。截图位于 `output/playwright/chore-4`，人工核对管理行、单选项、阅读区、深色编辑器及两类邮件。
- 生产构建保留现有 next/font 字体源；仅进程内提供 Resend 格式占位配置完成环境校验，未修改环境文件、未发送真实邮件。邮件客户端仍需具体投递环境验证，此次为浏览器排版预览。
- 实施结束时全部变更保留在任务分支供审阅，未提交或发布。2026-10-11 用户随后授权提交、推送并创建 PR；以 master 为目标的 PR 包含 6 个既有前置提交，说明中分别列出前置范围与 CHORE-4 改动，不创建发布标签。
- PR 交付清理：按用户要求移除 `.codex-overnight`，忽略整个 `/output/` 与 `/.codex-overnight/`，本地截图及日志保留在 Git 之外。

## 状态

- 状态：已完成
- 负责人：Codex
- 分支：refactor/chore-4-design-system-deduplication
- 基线：当前 HEAD（保留尚未合入 master 的主题与架构工作，用户要求整理当前项目）
- 开始日期：2026-10-11
- 完成日期：2026-10-11
