# M6.0 整站视觉与交互重构 QA

## 对照目标与证据

- 首页目标：`docs/mockups/效果图.png`
- 桌面创作区参考：`docs/mockups/website.png`
- 首页指定照片：`public/poetry-collection.jpg`
- 首页桌面截图：`output/playwright/m6-home-desktop.png`
- 首页移动截图：`output/playwright/m6-home-mobile.png`
- 账户桌面截图：`output/playwright/m6-account-desktop.png`
- 编辑器桌面截图：`output/playwright/m6-editor-desktop.png`
- 首页并排对照：`output/playwright/m6-home-comparison.png`

## 第一次检查

- P1：首页最初仍沿用全幅照片和渐变遮罩，与目标的左文右图结构不符。已移除渐变和旧图片，改用指定实拍照片与稳定的左右分区。
- P1：临时锯齿方案使用手写 SVG，不符合本次 Product Design 资产约束。已删除临时 SVG，改为生成并透明化的真实纸边 PNG，分别裁切为横向和竖向版本。
- P2：1440px 下主标题最初分为三行，左栏视觉过重。已降低桌面字号上限，稳定为两行。
- P2：第一版竖向纸边因旋转和透明区域计算几乎不可见。已改为单独裁切的竖向资产，桌面边界清晰，移动端使用横向资产。

## 最终检查

- 首页：1440px 为左文右图，390px 为上文下图；指定照片可见且无渐变，纸边方向随 1024px 断点切换。图片容器本身是普通矩形，纸边资产加载失败时照片仍保持可见。
- 公共内容：诗作列表使用档案式索引行，详情正文保持阅读宽度；长文和认证页面共享更稳定的衬线标题与双栏说明结构。
- 成员工作区：桌面常驻导航宽度约 224px，账户页为主信息与快捷操作双栏；新建和编辑表单为正文主栏与设置侧栏，移动端自然恢复单列。
- 浮层：Popover 与 DropdownMenu 使用统一暖纸背景、10px 圆角、边框、浮层阴影、9px 间距和 12px 碰撞边距；打开与关闭时长分别为 160ms 和 120ms，reduced-motion 关闭位移与缩放。
- 通知与管理：通知未读项使用左侧印章红标记和轻背景；通知底部入口会关闭浮层。管理页改为常驻导航和单列分组扫描结构。
- 可访问性：保留 Radix 键盘和焦点语义，主要操作高度不低于 44px；390、768、1024、1440px 首页与登录页无水平溢出。

## 验证结果

- `pnpm check:conventions`：通过。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test`：208 个测试通过。
- 首页相关 Playwright E2E：15 个测试通过。
- `pnpm build`：使用构建期占位邮件配置后通过。
- 账户、诗作和通知整组 E2E：复用现有 3000 端口开发服务器时，Next.js HMR WebSocket 握手失败导致 Client Component 无法 hydration，测试停在既有 `waitForHydration`。未启动、重启或终止开发服务器；该项不作为视觉实现缺陷关闭。

## Findings

没有仍需修复的 P0、P1 或 P2 视觉问题。现有开发服务器的 HMR/hydration 状态仍阻止完整交互回归，任务文档因此继续保持“进行中”。

## Open Questions

完整账户、诗作和通知 E2E 需要在可正常 hydration 的服务器状态下重跑。

final result: passed
