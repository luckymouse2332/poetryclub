# 首页单图调整视觉 QA

## 对照目标

- 原桌面效果图：`C:\Users\mouse\Documents\Codex\2026-08-04\qing\outputs\huizhong-poetry-site\implementation-desktop-final.png`
- 用户指定的新照片：`D:\OneDrive\桌面\海报\修改图.jpg`
- 项目内资源：`D:\mouse\Projects\poetryclub\docs\mockups\诗集合照.jpg`
- 最终生产截图：`D:\mouse\Projects\poetryclub\output\playwright\home-1536-viewport.png`
- 并排证据：`D:\mouse\Projects\poetryclub\output\playwright\comparison-single-photo-1536.png`
- 对照视口：1536 × 1024 CSS px，`deviceScaleFactor: 1`
- 原效果图与实现截图均为 1536 × 1024 像素，无需密度归一化
- 状态：匿名访问、浅色主题、页面顶部、无 hover 或 focus 的默认视觉状态

## 最终检查

- 字体与排版：沿用已通过 M3.1 验收的中文衬线标题、正文和无衬线导航。站名、年级、简介与阅读入口的层级、换行和字重保持稳定。
- 间距与布局：1536 px 下照片从第 5 栅格列开始并延伸到视口右缘，位置接近原效果图；首页专用容器明确移除通用 `py-section`，照片紧接刊头下方。375 px 与 768 px 仍按简介、入口、照片的自然顺序排列。
- 颜色与 Token：暖白背景、正文墨色、印章红链接和细分隔线继续使用项目语义 Token，没有新增渐变、阴影或装饰层。
- 图片质量与资源：页面只使用用户指定的 1707 × 983 原始合照，复制前后 SHA-256 一致。`next/image` 保持原始宽高比，桌面和移动端均没有拉伸；封面和两页诗稿完整可见。
- 文案与内容：照片 alt 准确说明深色桌面、《杂诗集》封面和展开的两页手写诗稿。最新诗作、关于内容和开发状态没有被本次视觉调整改写。
- 交互与可访问性：生产截图覆盖 375、768、1024、1440、1536 像素视口，均无横向滚动；阅读入口焦点为 2 px 实线；浏览器 console error 与 page error 均为 0。

## 比较历史

第一次单图实现仍受 `max-w-content` 约束，1536 px 下照片只有约 702 × 403 像素，与原效果图的大幅右侧视觉相比过小，记录为 P2。随后将 Hero 改为完整宽度的左右 page-edge 加 12 栏网格，让照片延伸到视口边缘，最终尺寸为约 942 × 542 像素。

第二次对照发现 `PageContainer` 的 `py-0` 没有覆盖通用 `py-section`，浏览器实际仍有 64 px 顶部内边距，导致照片低于刊头且首屏分隔线过晚，记录为 P2。随后增加首页专用 `.homeContainer`，明确设置 `padding-block: 0`，并移除桌面 Hero 的额外上下内边距。

第三次使用最新生产构建重新捕获全部视口。照片在桌面端紧接刊头、延伸至右缘，移动端完整按比例显示；并排全视图已足以判断本次唯一变化的首屏照片尺寸、裁切和区块节奏，因此没有另做局部裁切对照。未发现仍需修复的 P0、P1 或 P2。

只读代码审查指出早期方案的 `100vw` 负外边距在传统滚动条环境中有潜在越界风险，因此没有保留该实现。最终网格只使用 Hero 自身的 `100%` 计算 page-edge，没有负外边距；复核同时把 `Image` 的 `sizes` 改为与 66vw / `calc(50vw + 11rem)` 实际布局相符，避免桌面端选择偏小的图片候选。

## Findings

没有仍需处理的 P0、P1 或 P2 视觉问题。

## Open Questions

无阻塞问题。

## Implementation Checklist

- [x] 双照片替换为一张用户指定合照
- [x] `next/image`、准确 alt 与原始比例
- [x] 桌面端大幅右侧视觉并延伸至视口边缘
- [x] 移动端自然排列且无横向滚动
- [x] 五档生产截图、焦点和控制台检查

## Follow-up Polish

当前没有影响交付的 P3 项。

final result: passed
