# 品牌样片创作简报(三方向共用)

三支 40.6s 竖屏样片,**内容、口播、字幕、场景结构完全相同**,只有视觉语言不同(各项目的 DESIGN.md)。
目的:让用户对比三个品牌方向的真实成片效果。内容取自 loop-engineering video_1 开头(hook → 现状循环 → Boris 金句)。

## 环境(必读)

```bash
export PATH="/usr/local/opt/node@22/bin:$PATH"   # hyperframes 需要 Node 22,已全局安装 v0.6.91
cd <本项目目录>                                    # index.html 所在目录
hyperframes --version                              # 应输出 0.6.91
```

- 渲染:`hyperframes render --workers 2`(机器上同时有三个渲染任务,workers 限 2)
- 不要跑 `preview`(无头环境,且 preview 有已知音频偏移 bug,以 snapshot/render 为准)
- 参考 skill:本会话可用 `hyperframes` / `gsap` skill;参考文件在
  `/Users/yufanp/Desktop/Project/blog2video/.claude/worktrees/heygen/ab-test-hyperframes/arm-b/.claude/skills/hyperframes/`
  (必读:`references/typography.md`、`references/transitions.md` + `references/transitions/catalog.md`、
  `references/css-patterns.md`(关键词高亮)、`references/motion-principles.md`)
- 结构模板(接线正确,可参考):`../../.claude/worktrees/heygen/ab-test-hyperframes/arm-b/video/index.html`
  ⚠️ 但那次渲染因旧版引擎失败 —— 本次必须通过下方 QA 关卡的快照目检,不许跳过。

## 合成规格

- 根合成:1080×1920,总时长 **40.6s**,fps 30
- 音频:`narration.mp3`(40.25s,**禁止任何响度处理**),`data-start="0" data-duration="40.25" data-track-index="10" data-volume="1"`
- index.html 直接放 `data-composition-id` div(**不要 `<template>`**);场景子合成在 `compositions/*.html`,
  用 `<template>` 包裹,**`<style>` 必须在 composition div 内部**,选择器用 `[data-composition-id='xxx']` 前缀
- 每个有时间的元素:`class="clip"` + `data-start` + `data-duration` + `data-track-index`
- 每个合成的 GSAP timeline:`{ paused: true }` 注册到 `window.__timelines["<id>"]`;GSAP 用
  `<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js">`
- 字体:用 `@font-face` 加载 `assets/fonts/` 下的本地文件(src 相对路径,如 `url('assets/fonts/X.ttf')`;
  子合成里用 `url('../assets/fonts/X.ttf')`)。禁止网络字体。

## 布局硬规则(上次实验就死在布局上,零容忍)

1. 安全区:内容上边距 ≥160px、左右 ≥72px;**y > 1420px 区域只属于字幕带**,场景内容不得进入
2. 场景内容容器:`width:100%; height:100%; padding: …; display:flex; flex-direction:column; box-sizing:border-box`
   —— 用 padding 推位置,**禁止给内容容器用 position:absolute + top**(absolute 只给装饰元素)
3. 先搭"hero frame"静态布局(全部元素就位的那一帧),确认无重叠无溢出,再加 `gsap.from()` 入场
4. 标题 ≥60px,正文 ≥30px(视频是手机上看的);中文行宽 ≤15 字;数字用 `font-variant-numeric: tabular-nums`
5. 内容文字禁止 `<br>`,用 max-width 自然换行(短显示型标题逐行排版除外)

## 故事板(三方向共用时间轴,视觉表达按各自 DESIGN.md)

**场景 1|HOOK|0 → 13.38(含 0.6s 出场重叠)**
| t | 事件 |
|---|---|
| 0.2 | 系列标签入场(「精读AI · LOOP ENGINEERING」之类,小字) |
| 0.5–1.6 | 主标题 kinetic 入场:`Loop Engineering`(英文展示字体)+「全网最全指南」(中文大字) |
| 3.3 | 「来了。」重音元素(全片 hero moment #1,允许弹性) |
| 5.0 / 6.8 / 9.6 | 三个凭据 chip 逐个入场:「连搞几个通宵」「全网一手材料读完」「浓缩成这一期」 |
| 11.2 | 「一次讲透」关键词签名高亮(各方向的招牌手法) |
| 全程 | 环境呼吸:scale 1.00→1.04 |

**场景 2|现状循环|12.78 → 29.44(0.6s 双侧重叠)**
| t | 事件 |
|---|---|
| 13.2 | 场景 kicker:「你现在的状态」 |
| 16.2 | 循环图节点①「想清楚要做什么」 |
| 17.8 / 20.4 | 箭头 stroke-draw(0.6–1.0s,顺叙事方向) |
| 18.6 / 21.0 | 节点②「写一段提示词」/ 节点③「看它输出」 |
| 24.0 | 节点④「不满意,改提示词」+ 回环箭头画回②,循环闭合 |
| 26.0 | **pattern interrupt**:整个循环图压暗到 25–30%(不许做退场动画,只压暗),大字宣言「有一群人,已经不这么做了」压上来 |

**场景 3|金句|28.84 → 40.6(终场)**
| t | 事件 |
|---|---|
| 29.3 | 出处 kicker:`BORIS CHERNY · Claude Code 负责人` |
| 31.0 | 金句行 1「我已经不给 Claude 写提示词了。」词级 stagger 入场(0.04–0.06s/词) |
| 35.9 | 金句行 2「我的工作,是写循环。」——「写循环」做全片最重的签名高亮(climax,hero moment #2) |
| 37.2 | 英文 mono 行 `My job is to write loops.` 打字机 + 光标 |
| 39.6 | 系列小章/end chip;40.1 起允许整体缓出(唯一允许退场动画的场景) |

**转场**:场景间 0.6s 重叠 + 根 timeline 转场 tween(风格按 DESIGN.md:D1 编辑部式 crossfade/纸面推移、
D2 利落 push/瞬切感、D3 大胆 wipe/贴纸感)。只用 CSS 级转场,不引入 shader 包。
根 index.html 的场景 clip 用 `style="position:absolute; inset:0; z-index:N"`(后场景 z 低于前场景,参考 arm-b 模板)。

## 底部字幕(整句上屏,9 条,根合成内实现)

每条一个 `class="clip"` div,track 5,z-index 高于场景;样式按 DESIGN.md 的字幕带规格。
位置:水平居中,**bottom: 340px**(即 y≈1480–1580 区域);max-width: 936px;字号 38–42px;行高 1.4;最多 2 行;
入场 0.2s 淡入(根 timeline)。文字必须与下表一字不差:

| start | end | text |
|---|---|---|
| 0 | 4.153 | Loop Engineering 全网最全指南，来了。 |
| 4.153 | 12.613 | 我连搞几个通宵，把全网关于 Loop Engineering 的一手材料全部读完，浓缩成今天这一期，一次讲透。 |
| 12.78 | 15.499 | 先说你大概率正处在的状态。 |
| 15.499 | 23.658 | 你现在用 AI 写代码，节奏是这样的：想清楚要做什么，写一段提示词，看它输出。 |
| 23.658 | 25.75 | 不满意，再改提示词。 |
| 25.75 | 28.679 | 但有一群人，已经不这么做了。 |
| 28.836 | 35.893 | Claude Code 的负责人 Boris Cherny，直接说过这么一句话：我已经不给 Claude 写提示词了。 |
| 35.893 | 37.089 | 我的工作，是写循环。 |
| 37.089 | 40.079 | My job is to write loops. |

## 动效守则(违反 = 返工)

1. 元素入场绑定口播时间(±300ms),重点内容绝不提前露出;列表/图解逐条 build,永不整屏上
2. 同一时刻只有一个焦点动画;环境呼吸(慢 zoom ≤5%)不算
3. 入场 300–400ms、power2/power3.out、y 偏移 16–32px + fade;scale 弹跳 ≤105%;
   bounce/elastic 只许出现在两个 hero moment(「来了。」和「写循环」)
4. 每场景至少 3 种不同 ease;同场景不重复同一入场模式
5. **除终场外禁止一切退场动画**(转场即退场);每个元素都要有入场动画
6. 关键词强调=信号(色块扫过/压暗兄弟元素/下划线 draw),不是重新入场
7. 画布上的文字只放关键词(≤12 字/次),整句只出现在字幕带
8. 暗背景禁全屏线性渐变(H.264 banding),用径向/局部光晕;只动 transform/opacity
9. 确定性:无 Date.now/Math.random/网络请求/repeat:-1;timeline 同步构建

## QA 关卡(按顺序,全部强制)

```bash
hyperframes lint                  # 0 error 才能继续
hyperframes validate              # 修掉所有对比度警告(在色板内调深浅,不发明新色)
hyperframes snapshot --at 2,6,11,14,18,24,27,31,36,39.5
```
然后**用 Read 逐张查看快照 PNG**,检查:① 样式是否真的生效(若出现左上角无样式裸文字=接线失败,回去修);
② 重叠/溢出/截断;③ 字幕带位置和场景内容是否互不侵犯;④ 是否有死黑帧。修完重拍快照,直到全部合格。

```bash
hyperframes render --workers 2    # 产出 MP4(确认输出落在 renders/ 或记录实际路径)
ffprobe -v error -show_entries format=duration -show_entries stream=codec_type <out.mp4>
ffmpeg -y -ss 3 -i <out.mp4> -frames:v 1 /tmp/<dir>_3s.png   # 另取 20s、37s 两帧
```
最后用 Read 查看三张成片帧,确认与快照一致、音轨存在、时长 ≈40.6s。

## 汇报格式

返回:最终 MP4 绝对路径、时长/音轨确认、lint/validate 结果、快照目检发现并修复的问题清单、
与 DESIGN.md 的偏差(如有)、渲染耗时。
