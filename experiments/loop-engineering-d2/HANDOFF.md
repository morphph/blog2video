# HANDOFF —— d2 模板化 + loop-engineering 全片(新会话照此执行)

> 状态 2026-06-14。已选定 **d2「终端霓影」**,封面场景 `scenes/scene-01/` 已渲、**用户验收通过**。
> **决策(用户拍板)**:不再手搓全部 24 个一次性场景。改为**先把 d2 模板化**(组件库 + 智能生成器),
> 用生成器产出 loop-engineering 的场景,既得到审阅整片,又直接沉淀成投产资产(Phase 2)。
> 所有续做信息都在磁盘,新会话读本文件即可接手,不依赖对话上下文。

## 环境(每条 shell 命令都要)

```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"   # Apple Silicon homebrew 路径;hyperframes 0.6.9x 装在全局 node@22;默认 node v20 会 OOM。export 后 node -v 应为 v22.x
cd /Users/yufanp/Desktop/Project/blog2video/experiments/loop-engineering-d2
```

## 已完成

- 项目搭好:`scenes-data.json`(25 段时间轴+本地字幕)、`briefs/scene-NN.json`(每场景独立 brief)、
  `SCENE-KIT.md`(d2 令牌 + 各类型布局手册 + 动效规则——**组件库的草稿源**)、`DESIGN.md`、`scaffold-scene.sh`、`full_audio.mp3`(1033.96s,复用旧 MiniMax)
- **scene-01 封面**:`scenes/scene-01/index.html` —— 已渲已验收,**黄金参考**(standalone mini-project 结构 + d2 质量基准)
- 逐场景渲染链路已验证:`hyperframes render scenes/scene-NN -o clips/scene-NN.mp4` 出静音 clip(~45s 段约 2 分钟)

## 不可推翻的技术决策(踩坑换来)

1. **逐场景渲,不渲整片**:>240s 合成超流式 encode 门槛 → 缓冲 encode → 8GB 必 OOM + 撞 #1348。每段静音 clip → concat → 一次性混音。
2. **每场景 = 独立 mini-project**(`scenes/scene-NN/index.html` + symlink assets + hyperframes.json + meta.json):
   `render -c` 找不到裸文件,`lint`/`snapshot` 只认 index.html。
3. **场景自包含,组件库生成时内联**:不要用 `<link>` 外链共享 CSS(HyperFrames 对外链内联无保证);kit 是真源,生成器把它内联进每个场景。
4. **OOM 防护**:渲染前缀 `NODE_OPTIONS="--max-old-space-size=5120"`;串行渲;只用 MiSans+JetBrains Mono(已在 assets/fonts)。
5. **静音 + 字幕烧场景内**(track 5,本地时间,文字照 brief 一字不差);音频最后统一混;**音频不做任何响度处理**(项目 NEVER 条款)。
6. **不做跨场景转场**(clip 独立 concat),靠强入场 + 收尾保持衔接(d2「利落瞬切」本就吃硬切)。

## 执行步骤

### Step 1 — 抽 d2 组件库(真源,供生成时内联)
从 `scenes/scene-01/index.html` + `SCENE-KIT.md` 提取,落成:
- `kit/d2-base.css` —— 令牌(色/字/字幕带) + 所有组件类(grid 点阵、topbar、终端窗口卡、corner-bracket 面板、chip、清单行、对比双栏、状态灯、块光标、酸性高亮 .hl)
- `kit/d2-motion.js` —— GSAP 助手:标准入场(power3/expo.out 系)、酸性高亮扫过、打字机、字幕淡入、环境呼吸;一个 `buildSceneTimeline(R, spec)` 约定
- `kit/components.md` —— 每个组件的 HTML 片段范例 + 何时用(给生成器看)
原则:场景仍自包含,生成器把 base.css/motion.js **内联**进每个 scene 的 `<style>`/`<script>`。

### Step 2 — 手工精做 6 个类型范本(+ 已有 cover = 7 类全覆盖)
每类型挑一个代表 slide,建 `scenes/scene-NN/`,内联组件库,逐帧 QA(lint→snapshot→Read contact-sheet→修):
- image → **slide 2**(早晨循环:节点流程/步骤列表)
- principle → **slide 5**(2023→2026 时间线,逐格点亮)
- comparison_cards → **slide 7**(CLAUDE CODE vs CODEX 双栏)
- checklist → **slide 17**(四条原则,编号清单逐条入场)
- quote → **slide 16**(终端卡金句 + token 倍数 1×/4×/15× count-up + 90.2%)
- summary → **slide 24**(收尾 + `$ /goal` 终端命令行动召唤)
内容取自 `blog2video-output/loop-engineering/slide_NN.html`(**只换皮不改数据**:数字/命令/术语照搬)。
时间轴/字幕用 `briefs/scene-NN.json`。这 7 个就是生成器的 few-shot 样板。

### Step 3 — 写 scene-generator.md(智能模板)
位置先放 `experiments/loop-engineering-d2/scene-generator.md`(Step 6 再移进 skill)。
输入:slide 类型 + `briefs/scene-NN.json`(时长/字幕/topbar 序号)+ 源 `slide_NN.html` 内容 + 组件库 + 同类型黄金范本。
输出:一个自包含 d2 场景 HTML(内联 kit、`data-composition-id='sNN'`、根 `data-duration`=brief.dataDuration、字幕烧入、动效绑口播)。
内嵌全部铁律(布局安全区、动效语法、自检关卡)。

### Step 4 — 生成剩余 ~17 个场景
对 scenes-data.json 里 scriptType 与已做范本同类、但还没建的 slide,用子 agent 跑 scene-generator(每批几个)。
每个产出后**必做 QA**:`hyperframes lint scenes/scene-NN` + `snapshot` + Read contact-sheet 看重叠/溢出/裸文字/字体/酸性色 → 修干净。CTA(25)是 5s 静音尾卡,无字幕。

剩余清单(已做:1,2,5,7,16,17,24): image 3,4,6,9,10,15,18,19,20 · principle 12,13 · comparison_cards 8,11,14 · checklist 21,22 · quote 23 · cta 25。

### Step 5 — 渲染 + concat + 混音 + 交付
```bash
for n in $(seq -w 1 25); do
  [ -f clips/scene-$n.mp4 ] || NODE_OPTIONS="--max-old-space-size=5120" hyperframes render scenes/scene-$n -o clips/scene-$n.mp4
done
# 校验每个 clip 时长 == brief.dataDuration(逐帧对齐前提)
printf "file 'clips/scene-%02d.mp4'\n" $(seq 1 25) > concat.txt
ffmpeg -y -f concat -safe 0 -i concat.txt -c copy renders/loop-engineering-d2-silent.mp4
ffmpeg -y -i renders/loop-engineering-d2-silent.mp4 -i full_audio.mp3 -map 0:v -map 1:a -c:v copy -c:a aac -shortest renders/loop-engineering-d2-FINAL.mp4
ffprobe -v error -show_entries format=duration -show_entries stream=codec_type,codec_name -of default=noprint_wrappers=1 renders/loop-engineering-d2-FINAL.mp4
```
预计 24 段渲染约 1-1.5 小时机器时间(后台串行)。交付 `renders/loop-engineering-d2-FINAL.mp4` 给用户审。**这是审阅样片,非投递。**

### Step 6 — Phase 2 投产集成(用户审过整片后)
- 把 `kit/` + `scene-generator.md` 移进 `.claude/skills/blog2video/`(新建 `design/d2-kit/` + `prompts/scene-generator.md`),替换 stage-5 `slide-html-generator.md`
- Stage-6 渲染改为「逐场景 hyperframes render → concat → 混音」;Remotion 保留为 fallback
- 复用现有 timing 合同(slide_map + minimax raw subtitles → 每场景 start/dur/subs,即 scenes-data.json 的生成逻辑)
- 更新 CLAUDE.md 架构段;投递流程不变(`*.html`/clips 本就在排除名单)

## 质量底线(三次踩坑)
- 布局:内容 padding 上≥160 左右72 下≥540;y>1420 只属字幕;flex+padding 撑满,禁内容容器 absolute+top
- 多 beat 场景(目前仅封面)记得 `tl.set(beatN,{opacity:1})` 揭示
- 字体:大标题 MiSans Heavy、标签 JetBrains Mono;酸性绿 #ccff4d 每帧在场;无紫/无藏青/无渐变 banding
- 字幕一字不差照 brief;每句 ≤1 个 .sub-k 关键词

## 用户待决(整片审过后)
- 渲染算力:8GB Mac 约 1-1.5 小时/支。换大内存机 / HeyGen cloud render / 接受后台慢渲。
- 单集时长:小红书数据 3-5 分钟互动 >2×,现单集 17 分钟——是否借 Episode Splitter 切短(纯编辑决策)。
