# DESIGN.md — 方向 3「高亮笔记 Highlighter Pop」(明亮玩趣·大字报)

## Style Prompt

最聪明同学的划重点笔记 × 新波普贴纸文化:暖骨白纸面、得意黑的倾斜大字报、荧光黄马克笔
真实扫过、粗描边贴纸「啪」地拍上来、手绘箭头和圈注。为小红书 CTR 物理学而生 ——
大、快、好玩,但描边和网格让它停在「设计感」,不滑向营销号。

## Colors

| 角色 | Hex |
|---|---|
| 背景(暖骨白) | `#F2EFE6` |
| 文字(软黑) | `#191919` |
| **签名色:荧光黄**(马克笔扫过关键词) | `#FFD43A` |
| 橘(数字、箭头、能量元素) | `#FF7A1A` |
| 钴蓝(结构、边框、代码) | `#2447F0` |
| 贴纸粉(梗层/旁注,极省) | `#FF5C8A` |

规则:彩色元素一律带 3px 软黑描边或承载软黑文字 —— 对比度永远由黑保证,颜色只管能量。

## Typography(@font-face → assets/fonts/)

| 用途 | font-family | 文件 |
|---|---|---|
| 大字报标题/宣言/金句 | `Smiley Sans`(得意黑,自带倾斜) | SmileySans-Oblique.ttf |
| 正文/chip/字幕 | `MiSans` 500/600 | MiSans-Medium.ttf / MiSans-Semibold.ttf |
| 英文/代码 | `JetBrains Mono` 700 | JetBrainsMono-Bold.ttf |

(正式版正文字体为阿里巴巴普惠体,样片用 MiSans 代位 —— 观感差异极小,汇报时注明即可。)

## Texture & Motifs

- 贴纸:白底卡片 + 3px 软黑描边 + 8px 偏移硬阴影(`box-shadow: 8px 8px 0 #191919`),圆角 16–20px
- 手绘层:橘色手绘箭头、钴蓝圈注、双下划线(SVG path + stroke-draw,css-patterns.md 的 circle/scribble)
- 荧光笔:荧光黄色块在文字后方真实扫过(skew -3° 的矩形,左→右 scaleX)
- 半调网点:角落装饰性 halftone 圆点阵(SVG pattern,固定 seed)
- 胶带:卡片顶角一截半透明「胶带」矩形(rotate ±4°)
- 徽章:圆形橘底徽章「全网最全」之类,带锯齿边或星形爆炸框(burst)

## Motion 性格(弹!但有纪律)

- 贴纸拍上:scale 1.12→1 + rotation 从 ±3° 回正,0.35s back.out(1.4) —— 这是本方向的标准入场
- 大字报标题:逐词 slam(y 40px + scale 1.06→1,stagger 0.06s,power3.out)
- 荧光笔:0.4s scaleX 0→1 left-origin,power1.inOut,像真手在划
- 手绘箭头/圈注:stroke-draw 0.5–0.8s
- 转场:大色块 wipe(荧光黄/钴蓝整面横扫 0.5s power3.inOut,新场景从色块后露出)
- 循环图:四个贴纸卡 + 橘色手绘箭头;回环箭头画完后,「无限循环」贴纸粉小标签拍上
- pattern interrupt(26.0s):循环图整体压到 30% + 灰度,宣言「有一群人,已经不这么做了」
  得意黑大字 slam + 荧光黄扫底
- hero moment:「来了。」= 三字逐字 slam + 橘色爆炸框;「写循环」= 荧光黄重扫 + 钴蓝双下划线 draw
- 注意:back.out 弹性只给贴纸入场和两个 hero moment;字幕、箭头、荧光笔不弹

## 字幕带

白底贴纸条(描边 3px 软黑、圆角 14px、硬阴影 6px),文字软黑 40px MiSans Semibold,
当前句关键词可加荧光黄底(每句 ≤1 处)。bottom: 340px。

## What NOT to Do

1. 不要超过两种彩色同屏(荧光黄 + 一种辅助色);粉色每场景至多一次
2. 不要无描边的彩色文字(可读性会塌);彩底上文字永远软黑
3. 不要 3D、渐变、光晕 —— 这是平面贴纸宇宙,扁平 + 硬阴影
4. 不要让弹性 ease 出现在字幕/箭头/荧光笔上(只有贴纸和 hero moment 可以弹)
5. 不要把画面塞满:每屏保留 ≥25% 纸面留白,贴纸最多 4 张同屏
