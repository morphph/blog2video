# DESIGN.md — 白板讲解 Whiteboard Tutor kit（精读/tutor 线专用，与 d2-kit 并存）

风格锚：`references/example_visual-style-prompt.md` + `references/example_transcript.md`
（Sean's AI Stories 白板讲解视频，作者钦定对标）。两文档 = 逐字落库的原件，本文件只做提炼与本管线适配。

## Style Prompt

Excalidraw 白板讲解：纯白画布上一张**单一连续的手绘系统图**，没有幻灯片、没有硬切——
整支视频就是镜头在这张大图上平移、缩放、逐段揭示。手绘线条降低技术内容的威慑感，
「聪明朋友在白板前给你讲」而非企业培训片。1920×1080 横屏，中文精读线。

## 与 example 的两处明示偏离（作者已拍板）

1. **Faceless 纯白板**：不复刻 webcam PiP（AI avatar 留二期）。
2. **不复刻浏览器 chrome / Excalidraw 工具栏**：我们不是录屏，是确定性渲染；白板铺满全帧。

## 单画布铁律

- 全片一张 `.excalidraw` 大图（S2 分层导出 → `layers/step-NN.svg` + `steps.json`）；
  场景内**只有镜头动**（`.canvas` transform），层按叙事节奏揭示。
- **所有手写文字都在白板图里**（标题、概念大字块、标注全部画进 .excalidraw）；
  HTML 层不配手写字体，只有字幕（MiSans）与角标（JetBrains Mono）。
- 层文件 = `<img>` 引用（各层内嵌自己的字体子集，内联会同名互踩——不许内联 SVG）。

## Colors（图内配色系统 = excalidraw-diagram skill 白板约定，此处为对照表）

| 元素 | 颜色 |
|---|---|
| 背景 | 纯白 `#FFFFFF` |
| 章节标题（手写） | 橙红 `#e8590c` 系 |
| 分组框 | 橙色虚线边框 |
| 核心概念节点 | 粉珊瑚椭圆填充 `#FFB3B3` 系 |
| 输入/输出节点 | 绿填充 `#B2F2BB` 系 |
| 普通流程盒 | 白底黑边 |
| DB/存储 | 灰圆柱 |
| 箭头/正文 | 黑 |
| 字幕带底 | 半透明黑 `rgba(20,20,20,.72)` |
| 字幕文字 | 白，关键词淡黄 `#FFD43B`（每句 ≤1 处） |

HTML 侧唯一的色彩纪律：**不引入图外新颜色**；字幕关键词淡黄是唯一 HTML 强调色。

## Typography（@font-face → assets/fonts/，符号链接自 d2-kit，零重复）

| 用途 | font-family | 备注 |
|---|---|---|
| 字幕 | `MiSans` 500 | 例中即「YouTube 自动字幕」的干净无衬线 |
| 角标/场景编号 | `JetBrains Mono` 400 | 极小用量 |
| 白板内一切文字 | （在 SVG 内，Virgil/Xiaolai 子集内嵌） | HTML 不管 |

## Motion 性格（镜头是主角，揭示是配角）

- **镜头**：`WB.camera(bbox)` 平移/缩放到 steps.json 的 bbox，1.2–1.8s `power2.inOut`——
  从容、连贯，像人推着画布走；**绝不瞬移**（唯场景开头允许 `WB.setCamera` 定起点）。
- **揭示**：`WB.revealLayer` 三模式——`draw`（clip-path 左→右擦出，0.8s，像正在画，默认）、
  `pop`（0.35s 轻弹入，用于结论/强调块）、`fade`（0.5s，用于底图/氛围层）。
- **节奏**：先讲后现（口播引出概念 → 层浮现 → 镜头跟过去）；recap 段 `WB.home()` 缩回全景。
- **呼吸**：长驻镜头允许 ≤1.02 的极缓 scale 漂移防止死帧；不做 d2 式整屏 push 转场。
- d2 同款禁令：无 Math.random / Date.now、无 repeat:-1、timeline 同步构建、
  只动 transform / opacity / clip-path。

## 渲染质量铁律（supersample）

`<img>` SVG 按布局尺寸栅格化，CSS 放大即糊 → `.canvas` 按 **2× viewBox 尺寸**布局
（`data-ss="2"`），WB 镜头算法内部消化该系数；放大上限 = 2× 视图单位（`maxScale`，
即 css scale ≤1，永不上采样）。场景作者只用 steps.json 原始 bbox 思考，不碰 SS。

## 字幕带（track 5，与 d2 同契约）

`.sub` 底部居中，bottom 64px，`data-track-index="5"`；`.sub-inner` 半透明黑底 圆角 10px、
白字 42px MiSans 500、max-width 1440px、两行内。关键词 `.sub-k` 淡黄。
镜头取景默认预留底部 200px 安全区（`WB.fit` 的 `safeBottom`）——目标内容永不被字幕带遮挡。

## What NOT to Do

1. 不要深色背景、不要 d2 的酸性黄绿——线路视觉隔离是品牌决策
2. 不要硬切/幻灯片式转场——只有一张画布和一个镜头
3. 不要在 HTML 里写手写体大字（进图去）；不要内联层 SVG（字体子集互踩）
4. 不要瞬移镜头（场景开头 set 除外）；不要 >2× 视图单位的放大（会糊）
5. 不要图外新颜色；白板的「白」就是留白，别拿面板/卡片去填
