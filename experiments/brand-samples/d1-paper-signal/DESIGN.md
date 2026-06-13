# DESIGN.md — 方向 1「纸面信号 Paper Signal」(暖编辑部·浅色)

## Style Prompt

一本认真排版的中文科技杂志专栏被搬上了竖屏:暖奶油纸面、墨色宋体大标题、陶土橙的手绘划重点、
一枚印章式的系列章。气质是「我替你读完了硬核材料并划好了重点」——从容、可信、书卷气,
零科技炫光,零弹跳浮夸。参照 Anthropic 品牌的 book-cream 质感。

## Colors

| 角色 | Hex |
|---|---|
| 背景(暖奶油纸) | `#F6F2E9` |
| 卡片/浮纸 | `#FFFDF7` |
| 墨色正文/标题 | `#1C1A16` |
| 次级文字 | `#6E6A5F` |
| **签名色:陶土橙**(高亮扫过、强调、章) | `#D9603B` |
| 墨蓝(数据/代码/英文) | `#3E5C76` |
| 苔绿(正向信号) | `#6F7D4E` |
| 印章红(警示/宣言,极省着用) | `#B3382C` |

对比度:墨色 on 奶油 ≈14:1;陶土橙只用于大字(≥30px)或图形,不用于小正文。

## Typography(@font-face → assets/fonts/)

| 用途 | font-family | 文件 |
|---|---|---|
| 中文大标题/金句 | `Source Han Serif SC` weight 900 | SourceHanSerifSC-Heavy.otf |
| 中文次级标题 | `Source Han Serif SC` weight 700 | SourceHanSerifSC-Bold.otf |
| 正文/chip/字幕 | `MiSans` 400/500 | MiSans-Regular.ttf / MiSans-Medium.ttf |
| 英文/代码/时间 | `JetBrains Mono` 400/700 | JetBrainsMono-Regular.ttf / -Bold.ttf |

英文展示词(如 Loop Engineering)用宋体 Heavy 的拉丁字形或 JetBrains Mono Bold,体现「文印」感。

## Texture & Motifs

- 纸纹:背景叠 2–3% 不透明度的细噪点(用固定 seed 的 SVG feTurbulence data-URI,确定性)
- 细编辑线:1.5px 墨色分隔线、脚注式编号(01 / 02 / 03)、页眉页脚小字(栏目名·期号)
- 手绘感划重点:陶土橙马克笔底色扫过(css-patterns.md 的 highlight sweep)、手绘下划线
- 印章:圆形/方形红章「精读AI」,盖章式入场(scale 1.15→1 + 轻微透明度,无弹跳)
- 引用排版:大号宋体 + 悬挂引号「」,墨蓝色英文 mono 小字注释

## Motion 性格(编辑部式从容)

- 入场:y 24px + fade,0.4–0.5s,power2.out / power3.out;像排版落位,稳
- 高亮:马克笔底色从左到右扫过,0.45s,power1.inOut(阅读速度)
- 转场:纸面 crossfade(0.6s)或新纸自下而上轻推(power2.inOut),不许硬切感
- 循环图:墨色细线箭头 stroke-draw,节点是带细边的纸片卡
- pattern interrupt(26.0s):循环图整体降到 28% 不透明度并轻微去色,宣言用宋体 Heavy + 印章红
- hero moment:「来了。」= 盖章式落位;「写循环」= 陶土橙马克笔重扫 + 字重对比
- 打字机(英文行):墨蓝 mono,光标为细竖线

## 字幕带

奶油纸上的墨字:`#1C1A16`,40px MiSans Medium,无背景块(纸面本身够干净),
顶部一条 1.5px 陶土橙短线(60px 宽,居中)作为字幕带锚点。bottom: 340px。

## What NOT to Do

1. 不要任何霓虹光晕、glow、暗色渐变 —— 这是纸,不是屏幕
2. 不要 bounce/elastic(两个 hero moment 也只用盖章式 scale,不弹)
3. 不要纯白 `#FFFFFF` 背景或纯黑文字 —— 必须是暖奶油和暖墨色
4. 不要超过一处同屏陶土橙高亮;印章红每场景至多一次
5. 不要无衬线大标题 —— 大标题永远是宋体 Heavy
