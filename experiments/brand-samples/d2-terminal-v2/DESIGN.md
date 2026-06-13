# DESIGN.md — 方向 2「终端霓影 Terminal v2」(精修暗色·单一酸性强调)

## Style Prompt

Linear/Vercel 式的指挥舱:暖近黑画布、蓝图点阵网格、毫米级 keyline、单一酸性黄绿像状态灯一样
出现在每一帧。开发者自我认同的精密感 —— 不是 2021 年的紫色科技渐变,而是 2026 年的
「monochrome + acid interrupt」。利落、工程、零废动作。

## Colors

| 角色 | Hex |
|---|---|
| 背景(暖近黑,**不是藏青**) | `#121212` |
| 浮层面板 | `#1C1C1E` |
| 主文字(off-white) | `#EDEBE6` |
| 次级文字 | `#8A8A85` |
| **签名色:酸性黄绿**(每一帧都要在场:高亮、光标、进度、关键词) | `#CCFF4D` |
| 电青(数据/链接,≤10% 帧) | `#5FD3E8` |
| 信号珊瑚(警示,≤10% 帧) | `#FF6B5E` |

纪律:除签名色外,任何一帧最多再出现一种辅助色。对比度 off-white/acid on #121212 均 >11:1。

## Typography(@font-face → assets/fonts/)

| 用途 | font-family | 文件 |
|---|---|---|
| 中文大标题 | `MiSans` 900 | MiSans-Heavy.ttf |
| 中文次级/卡片 | `MiSans` 600 | MiSans-Demibold.ttf |
| 正文/字幕 | `MiSans` 400/500 | MiSans-Regular.ttf / MiSans-Medium.ttf |
| 英文展示/代码/标签/时间码 | `JetBrains Mono` 400/500/700 | JetBrainsMono-*.ttf |

mono 是身份元素:场景编号(`[01/03]`)、时间码、`$` 提示符、标签全用 JetBrains Mono。

## Texture & Motifs

- 蓝图点阵:背景细点网格(2px 点、56px 间距、4–5% 不透明度),贴近边缘淡出
- 终端 chrome:金句卡做成终端窗口(顶栏三圆点 + mono 标题栏),`$` 提示符开头
- 光标:酸性黄绿 块状光标,所有打字机动画共用;系列标识 = `精读AI_` + 闪烁光标(有限次 repeat)
- keyline:1px `#2A2A2C` 分隔线;角标记号(L 形 corner brackets)框住重点区
- 状态灯:小圆点 + mono 标签(`RECORDING` / `LOOP RUNNING`)做氛围细节

## Motion 性格(工程式利落)

- 入场:y 16–20px + fade,0.25–0.35s,power3.out / expo.out;快、稳、无余晃
- 打字机:中文按字、英文按字符,带块状光标;速度 ~28ms/字符
- 高亮:「一次讲透」「写循环」= 酸性黄绿背景块从左到右 0.3s 扫过(文字反色为 #121212),
  或文字直接变酸性绿 + 下方 2px 亮线 draw
- 转场:利落 push(整面 0.5s power4.inOut 横推)或 1–2 帧白闪式瞬切感(用 #1C1C1E 闪,不用纯白)
- 循环图:节点 = 带 corner bracket 的面板,箭头 = 酸性绿 1.5px 线 stroke-draw + 箭头三角
- pattern interrupt(26.0s):循环图压暗至 25% + 珊瑚色 `BREAK` 标记,宣言大字 MiSans Heavy 入场
- hero moment:「来了。」= 块状光标放大落位一拍;「写循环」= 酸性绿块扫过 + 全场其他元素瞬降亮度
- 计数/编号:tabular-nums,tick 式逐字入场

## 字幕带

`rgba(18,18,18,0.6)` 含 1px `#2A2A2C` 上边线的窄带,文字 `#EDEBE6` 40px MiSans Medium;
当前句的关键词可用酸性绿(每句 ≤1 处)。bottom: 340px。

## What NOT to Do

1. 不要紫色、不要多色渐变、不要 glow 光晕大于 8px —— 这不是 2021 科技风
2. 不要藏青 `#0D0D1A` 背景(那是旧版),必须 `#121212` 暖近黑
3. 不要圆角大于 8px;不要阴影(用 keyline 和面板色分层)
4. 暗背景禁全屏线性渐变(H.264 banding);点阵网格不透明度 ≤5%
5. 不要弹性/回弹 ease(expo/power4 的利落感是身份;hero moment 也只用一拍放大,不弹)
