# HANDOFF —— loop-engineering 全片 d2 渲染(可在新会话无损续做)

> 状态截至 2026-06-14。用户已选定 **d2「终端霓影」** 方向,封面场景已渲出并**用户验收通过**。
> 剩余工作:建场景 2-25 → 逐场景渲染 → concat → 混入完整音频 → 交付审阅。
> **所有续做所需信息都在磁盘文件里**,新会话读本文件 + 下列文件即可接手,不依赖任何对话上下文。

## 环境(每条 shell 命令都要)

```bash
export PATH="/usr/local/opt/node@22/bin:$PATH"   # hyperframes 0.6.96 装在全局 node@22;默认 node v20 会 OOM
cd /Users/yufanp/Desktop/Project/blog2video/experiments/loop-engineering-d2
```

## 已完成

- 项目搭好:`scenes-data.json`(25 段时间轴 + 本地字幕)、`briefs/scene-NN.json`(每场景独立 brief)、
  `SCENE-KIT.md`(d2 令牌 + 各类型布局手册 + 动效规则)、`DESIGN.md`、`scaffold-scene.sh`、`full_audio.mp3`(1033.96s,复用旧 MiniMax)
- **scene-01 封面**:`scenes/scene-01/index.html` —— 已渲、已验收。**这是黄金参考,所有新场景照它的结构和质量来。**
- 渲染链路已跑通:`scenes/scene-01/` 是一个 mini-project(index.html + symlink assets + hyperframes.json + meta.json),
  `hyperframes render scenes/scene-01 -o clips/scene-01.mp4` 出**静音** clip,46-48s 用时约 2 分钟。

## 关键技术决策(别推翻,都是踩坑换来的)

1. **逐场景渲染,不渲整片**:整片 1034s 超过流式 encode 门槛(240s)→ 退回缓冲 encode → 8GB 机器必 OOM + 撞 #1348(>600s encode 被 kill)。
   每段 ≤87s,在安全区内。逐段渲成静音 clip,最后 concat + 一次性混音。
2. **每场景 = 独立 mini-project**:`scenes/scene-NN/index.html`。因为 `render -c` 只能渲 index.html 注册过的子合成,
   裸文件找不到;而 `lint`/`snapshot` 只认项目 index.html。所以每个场景自成一个项目。
3. **场景之间不做跨场景转场**(clip 独立 concat)。靠强入场 + 收尾保持衔接,d2 的「利落瞬切」本就吃硬切。
4. **OOM 防护**:渲染命令前缀 `NODE_OPTIONS="--max-old-space-size=5120"`;只用 MiSans + JetBrains Mono(已在 assets/fonts);
   一次只串行渲一个场景(别并发,会叠加内存)。
5. **静音 + 字幕烧在场景内**:场景里没有 `<audio>`;字幕用 brief 里的本地时间烧进每个场景(track 5)。音频最后统一混。

## 下一步(按顺序)

### A. 建场景 2-25(23 个)—— 用子 agent 批量做

每个场景一个子 agent(或一批),必读:
- `SCENE-KIT.md`(规范)
- `scenes/scene-01/index.html`(黄金参考,照它的 standalone 结构 + d2 质量)
- `briefs/scene-NN.json`(该场景的 type / dataDuration / topbarIndex / 本地字幕)
- `blog2video-output/loop-engineering/slide_NN.html`(内容源:标题/卡片/数据/术语,**只换皮不改数据**)
- 类型→布局对应见 SCENE-KIT.md §5 与 scenes-data.json 的 `scriptType`

子 agent 流程:`./scaffold-scene.sh NN` 建目录 → 写 `scenes/scene-NN/index.html`(standalone,
`data-composition-id='sNN'`,所有选择器加该前缀,字体路径 `assets/fonts/...`,根 `data-duration` = brief.dataDuration) →
`hyperframes lint scenes/scene-NN`(0 error)→ `hyperframes snapshot scenes/scene-NN --at <关键时刻>` →
**用 Read 逐张看 contact-sheet.jpg**(查:左上角无样式裸文字=接线错;重叠/溢出;内容侵入字幕带 y>1420;字体是否生效;酸性色每帧在场)→ 修到干净。
**子 agent 不要渲 mp4**,渲染由编排者统一做。

类型分布(scriptType):cover(已完成1) · image×10(2,3,4,6,9,10,15,18,19,20) · principle×3(5,12,13) ·
comparison_cards×4(7,8,11,14) · quote×2(16,23) · checklist×3(17,21,22) · summary(24) · cta(25)。
建议分 5-6 批并行,每批共享类型相近的场景。

### B. 逐场景渲染(编排者串行做)

```bash
for n in 02 03 ... 25; do
  NODE_OPTIONS="--max-old-space-size=5120" hyperframes render scenes/scene-$n -o clips/scene-$n.mp4
done
# 注意 cta(25)无字幕、5s 尾卡;每个 clip 静音,duration 必须 == brief.dataDuration(逐帧对齐 concat 的前提)
# 渲完抽帧 Read 抽查几个复杂场景(comparison/checklist)确认无重叠
```
预计 24 段 × ~2-3 分钟 = 约 1-1.5 小时机器时间(后台串行)。

### C. concat + 混音 + 交付

```bash
# 1) 按序 concat 所有静音 clip(同编码参数,逐帧对齐)
printf "file 'clips/scene-%02d.mp4'\n" $(seq 1 25) > concat.txt   # 确认 25 段都在
ffmpeg -y -f concat -safe 0 -i concat.txt -c copy renders/loop-engineering-d2-silent.mp4
# 2) 混入完整音频(原始,无响度处理 —— 项目 NEVER 条款)
ffmpeg -y -i renders/loop-engineering-d2-silent.mp4 -i full_audio.mp3 \
  -map 0:v -map 1:a -c:v copy -c:a aac -shortest renders/loop-engineering-d2-FINAL.mp4
# 3) 校验:时长≈1039.8s(音频 1034s + cta 尾卡 5s)、有 h264+aac、抽帧目检
ffprobe -v error -show_entries format=duration -show_entries stream=codec_type,codec_name -of default=noprint_wrappers=1 renders/loop-engineering-d2-FINAL.mp4
```
交付:`renders/loop-engineering-d2-FINAL.mp4` 给用户审。**这是审阅样片,不是投递**——满意后才进 Phase 2(把 d2 固化成 pipeline 的 scene-generator)。

## 验收/质量底线(来自三次踩坑)

- 布局:内容 padding 上≥160 左右72 下≥540;y>1420 只属字幕;flex+padding 撑满,禁内容容器 absolute+top
- 多 beat 场景(只有封面是)记得 `tl.set(beatN,{opacity:1})` 揭示——封面曾漏这句导致 B/C/D 空白
- 字体:大标题 MiSans Heavy、标签 JetBrains Mono;酸性绿 #ccff4d 每帧在场;无紫/无藏青/无渐变 banding
- 字幕文字一字不差照 brief;每句 ≤1 个 .sub-k 关键词

## 用户待答(下一步策略,见下)

- 渲染慢的根因是这台 8GB Mac + 低内存模式。投产前要决定:换大内存机器 / hyperframes cloud render / 接受后台 1-2 小时渲。
- 全片建完后,Phase 2 = 把 d2 做成 pipeline 的 scene-generator prompt + 复用组件,让以后的视频**自动**生成 d2 场景,不再手搓。
