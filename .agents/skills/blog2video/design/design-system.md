# Blog2Video 视觉设计系统

## 画面规格

- **分辨率**: 1080 × 1920 px（竖屏 9:16）
- **FPS**: 30
- **背景色**: `#0D0D1A`（深蓝黑）

## 配色方案

| 用途 | 色值 | CSS 变量 |
|------|------|----------|
| 背景 | `#0D0D1A` | `--bg` |
| 卡片背景 | `#1A1A2E` | `--card-bg` |
| 卡片边框 | `rgba(139, 92, 246, 0.2)` | `--card-border` |
| 标题文字 | `#FFFFFF` | `--text-primary` |
| 副标题/正文 | `#B0B0CC` | `--text-secondary` |
| 紫色强调 | `#8B5CF6` | `--accent-purple` |
| 红色警告 | `#EF4444` | `--accent-red` |
| 绿色正面 | `#10B981` | `--accent-green` |
| 黄色高亮 | `#F59E0B` | `--accent-yellow` |
| 蓝色信息 | `#3B82F6` | `--accent-blue` |
| 暗淡文字 | `#6B7280` | `--text-muted` |

## 颜色语义

- **紫色** = 核心概念、视频标题、重要术语
- **红色** = 问题、代价、警告、底部强调字幕
- **绿色** = 解决方案、正面信号、场景编号
- **黄色** = 字幕高亮、次要强调
- **蓝色** = 中性信息、第一个场景卡片

## 字体

| 元素 | 字体 | 大小 | 重量 |
|------|------|------|------|
| 视频主标题 | Inter / PingFang SC | 48px | Bold |
| Slide 标题 | Inter / PingFang SC | 36px | Bold |
| 卡片标题 | Inter / PingFang SC | 24px | SemiBold |
| 卡片正文 | Inter / PingFang SC | 18px | Regular |
| 标签/来源 | Inter / PingFang SC | 14px | Medium |
| 底部字幕 | Inter / PingFang SC | 22px | SemiBold |
| 英文术语 | JetBrains Mono | 16px | Medium |

## 布局规则

### 水平+垂直居中
- Slide 内容水平垂直居中（`.slide` 使用 `justify-content: center; align-items: center; text-align: center`）
- 所有标题和正文默认水平居中，匹配慢学AI等头部账号的视觉风格
- 卡片容器需显式设置 `width: 100%` 撑满宽度（`align-items: center` 会使子元素 auto-width），内部文字可根据内容选择 `text-align: left`
- 居中区域 = 手机端自然视线焦点，避开顶部状态栏和底部平台 UI 遮挡
- 安全边距已通过 padding 保证（上 120px, 下 520px），居中在安全区内进行

### 间距
- Slide 外边距: 48px（左右），60px（上下）
- 卡片内边距: 24px
- 卡片间距: 16px
- 卡片圆角: 12px
- 元素间距（垂直）: 16px-24px

### 标签样式
- Section label（如 "FIRST PRINCIPLE"）: 14px, 大写, 紫色, 字间距 2px
- 标签前带紫色竖线（4px 宽 × 100% 高）或紫色圆点

### 底部字幕区（TTS 字幕）
- 位置：距底部 450px（`bottom: 450` in Subtitles.tsx）——视频号/小红书平台 UI 覆盖底部约 350px，字幕需在其上方
- 背景：半透明黑色（`rgba(0,0,0,0.7)`），圆角 8px
- 文字颜色：白色，38px, weight 600
- 最大宽度：900px，居中
- 句子级拆分：MiniMax 返回的段落级字幕（6-14s, 40-120+ chars）会被自动拆分为句子级（按 。！？ 分割），每次只显示一句话

### 卡片样式
- 背景: `--card-bg` (半透明可选)
- 边框: `1px solid rgba(139, 92, 246, 0.2)`（紫色调边框，比纯灰色更有层次感）
- 左侧色条: `border-left: 4px solid <accent-color>`（颜色对应卡片语义：紫=概念, 红=警告, 绿=正面, 蓝=信息, 黄=强调）
- 阴影: none（暗色主题不需要阴影）

### 高对比度规则
- 卡片必须与背景有明显视觉分离：用 `border: 1px solid rgba(139, 92, 246, 0.2)` 或更亮的边框
- 重要卡片加 4px 左侧色条（`border-left: 4px solid <accent-color>`），颜色对应卡片语义
- 数据数字（如 55K、85%、49%→74%）必须 ≥56px、font-weight 800、用完整强调色（不用灰色）
- 封面图标题区域加微妙渐变光晕（`radial-gradient`）增加视觉深度
- 避免大面积纯黑空白——用微妙的渐变或装饰元素填充（但不要过度）

## 动画规范（Remotion）

### Slide 转场
- 类型: Fade (opacity 0 → 1)
- 时长: 15 帧（0.5秒）

### 元素入场
- 卡片: 从下方滑入 + 淡入, 间隔 5 帧
- 文字: 淡入, 间隔 3 帧
- 列表项: 依次从左侧滑入, 间隔 8 帧

### 底部字幕
- 淡入: 10 帧
- 持续: 跟随 Slide 时长
- 淡出: 10 帧（Slide 结束前）

## 封面图（Cover Photo）

用于小红书缩略图 + 视频片头 3s 帧（足够截屏为缩略图）。

### 布局
- 1080×1920，背景 `#0D0D1A`
- 三个元素垂直居中（`justify-content: center; align-items: center`）：
  1. **系列标签**：`精读AI · [topic]`，28px，`#8B5CF6`，letter-spacing 2px
  2. **主标题**：64-72px，weight 900，2-3行，≤15字/行，关键词高亮（`#EF4444` 或 `#F59E0B`）
  3. **来源标签**：英文博客原标题，圆角胶囊（`#1A1A2E` bg + `#B0B0CC` text）

### 视频中的行为
- 在视频最前面插入 3s 封面帧（slide_number: 0）
- 所有 slide 和字幕时间轴向后移 3s
- 音频延迟 3s 开始播放

### 输出文件
- `cover_photo.html` → `cover_photo.png`（独立缩略图）
- 视频 config 中 `cover_duration: 3`

## 小红书/视频号适配

- 安全区：上方留 120px（状态栏）、下方留 520px（字幕保留区）
- 核心内容区: 1080 × 1280 px（居中）
- 不放水印（平台会加）
- 字号偏大（手机屏幕小）
