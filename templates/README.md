# templates/ — 视频风格模板库

每个模板定义一种**视频格式/风格**:旁白口吻 + 视觉系统 + 渲染方式。

> **别和 `.agents/skills/` 混淆**:那边是 HyperFrames 的 short-form 模板家族(≤3 分钟,上游 GitHub 管理,如 `faceless-explainer`、`slideshow` 等)。本库是**长视频风格模板**,本地拥有,两回事。

## 收录约定

一个模板一个文件夹。**种子形态 = 两半拆法**——把一支参照视频逆向拆成:

| 文件 | 内容 |
|---|---|
| `transcript.md` | 参照视频说了什么 → 旁白口吻/结构的靶子 |
| `visual-style-prompt.md` | 逆向出的视觉 DNA(布局、配色、镜头运动等) |
| `TEMPLATE.md` | 模板卡:来源、状态、精髓、生产件指针 |
| `captions.srt`(可选) | 原始时间轴字幕 |

## 生命周期

- **seed**:只有参照对,零代码。收集期看到想模仿的视频,拆两半存进来即算入库,不动代码。
- **production**:已蒸馏成生产件——narration.mjs 的 MODES 表一行 + 旁白 prompt + `design/` 下的 kit + render verb + content-ops driver 的 lane 值。

## 登记表

| 模板 | 状态 | 外部参照 | 生产件 |
|---|---|---|---|
| `sean-whiteboard-explainer` | production | 本目录(Sean's AI Stories, youtube GrNbuWWJYiI) | wb-kit(`.claude/skills/blog2video/design/wb-kit/`)· 旁白 prompt `script-writer-tutor.md` · `render-wb` verb · WF1 lane=whiteboard |
| d2 | production | 无(自创格式:「终端霓影」竖版 9:16 暗色工程风讲解——暖近黑画布 + 每帧在场的酸性黄绿 `#CCFF4D` 签名色,MiSans + JetBrains Mono,见 `design/d2-kit/DESIGN.md`) | d2-kit(`.claude/skills/blog2video/design/d2-kit/`)· narration `--mode d2` · `render-d2` verb · lane=d2 |
