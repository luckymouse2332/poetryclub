# BUG-12 工作区导航断点 Design QA

**Source visual truth**

- 中等宽度参考图：`C:/Users/mouse/AppData/Local/Temp/codex-clipboard-053fc1cc-b295-49c5-9d02-52ac73bf00dc.png`，原始 2316 × 1524px。
- 大屏参考图：`C:/Users/mouse/AppData/Local/Temp/codex-clipboard-37c134ba-f4d1-4413-94e1-2ee5b2747f88.png`，原始 3041 × 1582px。
- 用户指定的视觉目标是响应式导航结构：中等宽度使用页面顶层横向二级导航，大屏使用正文左侧常驻导航。

**Implementation evidence**

- 中等宽度实现：`output/playwright/workspace-navigation-medium.png`，1158 × 762px，CSS viewport 1158 × 762，`deviceScaleFactor: 1`，管理员总览。
- 大屏实现：`output/playwright/workspace-navigation-large.png`，1521 × 791px，CSS viewport 1521 × 791，`deviceScaleFactor: 1`，管理员总览。
- 中等宽度参考图按 50% 归一化为 `output/playwright/workspace-navigation-medium-reference.png`，1158 × 762px；并排图为 `output/playwright/workspace-navigation-medium-comparison.png`。
- 大屏参考图按 50% 归一化并按奇数宽度向上取整为 `output/playwright/workspace-navigation-large-reference.png`，1521 × 791px；并排图为 `output/playwright/workspace-navigation-large-comparison.png`。

**State and interaction evidence**

- 两个视口均为管理员登录后的 `/admin` 总览，活动项为“总览”。参考图使用用户账号，测试实现使用 E2E 管理员，因此欢迎语显示名不同。
- 1158px 下只有 `data-variant="bar"` 的横向二级导航；1521px 下只有 `data-variant="sidebar"` 的左侧导航。
- 大屏侧栏的“评论”入口可以进入 `/admin/comments`，页面导航过程中没有浏览器 console error 或 page error。
- 390px、1024px、1280px 的账户与管理工作区相关 E2E 同时通过，页面无重复导航和水平溢出。

**Full-view comparison evidence**

中等宽度并排图中，站点刊头、横向导航上下分隔线、导航文字节奏、活动短线、页面标题与两列入口卡片的结构一致。实现保留了 M7 新增的“评论”入口，因此导航比早期参考图多一项，这是产品内容更新，不是布局偏差。

大屏并排图中，正文从横向导航切换为左侧约 224px 工作区导航；侧栏标题、纵向分隔线、当前项暖红底色和正文两列布局均与参考结构一致。实现增加“评论”入口后，侧栏共七项，卡片顺序也因评论治理入口插入而变化，属于 M7 的预期内容差异。

**Focused region comparison evidence**

两张归一化并排图中的横向导航和完整侧栏均可清楚辨认，目标只涉及导航断点与主要区域比例，不包含需要放大的细小图标、图像资产或精细控件，因此无需额外局部裁切。

**Required fidelity surfaces**

- Fonts and typography：沿用现有衬线刊头、页面标题和无衬线工作区标签；字号、字重、行高和活动项层级与参考图一致。
- Spacing and layout rhythm：1158px 保持全宽横向导航，1521px 恢复 `14rem + minmax(0,1fr)` 两栏；侧栏、正文间距和卡片网格没有挤压或溢出。
- Colors and visual tokens：继续使用暖纸背景、墨色正文、印章红活动态、现有边框与表面 Token，没有引入新颜色或渐变。
- Image quality and asset fidelity：目标界面没有内容图片、插画或非标准图标，本次也没有新增或替换图像资产。
- Copy and content：导航保留当前所有入口，并增加 M7 的“评论”；参考图与测试账号的显示名差异不影响导航视觉判断。

**Findings and comparison history**

- Pass 1：在相同归一化视口和管理员总览状态下完成两组并排对照。没有发现 P0、P1 或 P2 差异；中屏横向导航与大屏侧栏的切换、区域比例和活动态均符合参考图。
- 本轮没有因视觉比较产生需要再次修正的 P0、P1 或 P2 项。

**Implementation checklist**

- [x] 小于 1024px 保持既有移动导航职责。
- [x] 1024px 至 1279px 只显示横向二级导航。
- [x] 1280px 起只显示常驻左侧导航。
- [x] 管理侧栏包含 M7 评论入口并保持活动路由语义。
- [x] 相关交互、无溢出、控制台错误与响应式 E2E 通过。

**Follow-up polish**

- 当前没有需要阻止交付的 P3 项。

final result: passed
