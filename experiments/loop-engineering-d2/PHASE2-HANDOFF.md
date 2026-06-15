# PHASE 2 HANDOFF —— d2 投产集成(新会话照此执行)

> 状态 2026-06-15。**Phase 1 全部完成,用户已审过整片并拍板「正式接入」。**
> Phase 1 产物:d2 组件库 + 智能生成器 + 全 25 场景 + 渲染链路,已渲出审阅样片
> `renders/loop-engineering-d2-FINAL.mp4`(17m20s,用户验收通过)。
> 本文件是 Phase 2 的唯一入口,所有续做信息在磁盘,不依赖对话上下文。

## 环境(每条 shell 命令前缀)

```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"   # Apple Silicon;node -v 必须 v22.x,否则渲染 OOM
cd /Users/yufanp/Desktop/Project/blog2video
```

## Phase 1 已产出(可直接搬进 skill 的资产)

| 资产 | 路径 | 作用 |
|---|---|---|
| 组件库 base.css | `experiments/loop-engineering-d2/kit/d2-base.css` | d2 令牌 + 全部组件类 |
| 组件库 motion.js | `kit/d2-motion.js` | `D2` GSAP 助手 + `buildSceneTimeline` |
| 组件库手册 | `kit/components.md` | 组件速查 + 类型范式(给生成器看) |
| **场景生成器** | `experiments/loop-engineering-d2/scene-generator.md` | 单场景智能模板(铁律/D2 API/类型范式/QA 关卡/踩坑) |
| 内联打包器 | `build.mjs` | 把 kit 内联进 `src/scene-NN.html` → 自包含 `scenes/scene-NN/index.html`;自动削 10ms 字幕防 track5 浮点重叠 |
| 串行渲染 | `render-all.sh` | 逐场景渲静音 clip(跳过已渲),进度写 log |
| 拼接混音 | `finalize.sh` | concat → 静音整片 → 混音(不 -shortest,保 CTA 尾卡)→ ffprobe 核验 |
| 7 类黄金范本 | `src/scene-01,02,05,07,16,17,24.html` | image/principle/comparison/quote/checklist/summary/cover few-shot |
| 时间轴+字幕 | `scenes-data.json` + `briefs/scene-NN.json` | 每场景 start/dur/本地字幕(**这次是手搓的,Phase 2 要脚本化,见下**) |

## 不可推翻的技术决策(Phase 1 踩坑换来,Phase 2 必须保留)

1. **逐场景渲,不渲整片**:>240s 合成超流式 encode → 8GB 必 OOM(+#1348)。每段静音 clip → concat → 一次混音。
2. **每场景 = 独立 mini-project**(`scenes/scene-NN/index.html` + assets symlink + hyperframes.json + meta.json)。授权源放 `src/scene-NN.html`(含 `/*@@BASE@@*/`、`/*@@MOTION@@*/` marker),**不能**和 index.html 同目录(否则 hyperframes 当成第二个 root composition 报错)。
3. **场景自包含,kit 生成时内联**:不用 `<link>` 外链。build.mjs 负责内联。
4. **OOM 防护**:渲染前缀 `NODE_OPTIONS="--max-old-space-size=5120"`;**串行**渲(并发叠内存);只用 MiSans+JetBrains Mono。
5. **lint 0 error 的约定**(违反会 lint 报错):font-family 写**字面量**(不写 `var(--mono/--sans)`);kit/场景注释里**不能出现** `<script>`/`<style>` 字样或裸 `[data-composition-id='sNN']`(会被解析成假标签/假作用域);timeline **显式** `window.__timelines['sNN']=tl`(别只用 D2.register)。
6. **颜色纪律**:酸性绿 `#ccff4d` 每帧在场;每帧最多再 1 种辅助色(cyan 数据/coral 警示);终端三圆点是例外。
7. **画布=关键词**,整句只在字幕带;密集场景用 `.content.tight` + 关键词上画布、长例子留字幕。
8. **禁 emoji**(无 emoji 字体会渲成豆腐块);源 slide 的 emoji 一律删/换 mono 符号 `→ › ●`。
9. **字幕入场坑**:入场选择器必须唯一(广义类选择器会误伤同类元素);卡内晚到子元素靠各自延迟 `.from`(immediateRender)隐藏到点;`D2.sweep`/`D2.enter` 对 opacity:0 元素要先显式揭示(sweep 不负责显隐,enter 对已 opacity:0 元素会 0→0)。

## ⚠️ 一个已知缺陷 + 修法(Phase 2 顺手修)

**音视频漂移 ~0.5s(片尾最大)。** 每个 clip 被 hyperframes 渲成 `ceil(dur×30)` 帧(每段 +0~1 帧),累加到片尾视觉比口播慢约 0.5s。
**修法(在时间轴脚本里做,见下一节 Step 1):把每个场景边界吸附到帧**:
`start_frame = round(start_sec×30)`,`dur = (next_start_frame − start_frame)/30`。这样所有 dur 都是 1/30 的整数倍,
逐 clip 的 ceil 取整不再累加,拼出来的整片与口播时间轴误差恒定 ≤1 帧(不漂移)。Phase 1 的 scenes-data.json 没吸附,所以漂了。

## Phase 2 执行步骤

### Step 1 —— 把「手搓 scenes-data.json」脚本化(投产关键,这次缺的就是它)

写 `.claude/skills/blog2video/scripts/build-scenes-data.mjs`(或 .py)。输入(均在 `blog2video-output/<slug>/`):
- `video_N_audio_slide_map.json` —— `[{slideNumber, charStart, charEnd}]`,slide↔narration 字符区间
- `video_N_audio_subtitles.json` —— 细粒度字幕行(带 ms 时间 + 字符偏移;Phase 1 briefs 的字幕粒度来自这里,**不是** raw_subtitles 的 96 段粗块)
- `video_N_audio_minimax_raw_subtitles.json` —— MiniMax 粗段 `[{text,time_begin(ms),time_end(ms),text_begin,text_end}]`,用作 char→time 的锚
- `slide_N.html` —— 每页源内容(类型从 `video_N_config.json` 或 slide 类名推断)
- `full_audio` 时长(末场景 dur 收尾用)

输出:`scenes-data.json`(每场景 `{n,scriptType,start,dur,subs:[{text,localStart,localDuration}]}`)+ `briefs/scene-NN.json`(生成器输入格式,见现有 briefs)。
逻辑:slide 的 charRange → 经 raw_subtitles 的 (text_begin/end↔time_begin/end) 线性映射成 time 区间 → 场景 start/dur;
该区间内的细字幕行重定基到本地时间;**场景边界吸附到帧(见上)**;CTA(末尾)补一个 5s 静音尾卡场景,无字幕。
> 校验:对 loop-engineering 跑一遍,产出应与现有 `experiments/loop-engineering-d2/scenes-data.json` 基本一致(除帧吸附带来的毫秒级差)。

### Step 2 —— 把 kit + 生成器搬进 skill

- `cp -r experiments/loop-engineering-d2/kit  .claude/skills/blog2video/design/d2-kit`
- `cp experiments/loop-engineering-d2/scene-generator.md  .claude/skills/blog2video/prompts/scene-generator.md`(把里面相对路径从 `experiments/loop-engineering-d2/...` 改成 skill 内/输出目录的实际路径)
- `cp experiments/loop-engineering-d2/build.mjs .claude/skills/blog2video/scripts/build-scene.mjs`(路径参数化:输出到 `blog2video-output/<slug>/scenes/`)
- 黄金范本 7 个 src 也带过去做 few-shot(放 `design/d2-kit/samples/`)。
- **替换 stage-5**:`prompts/slide-html-generator.md` 改为调用 `scene-generator.md`(每页 = 一个 d2 场景);旧的留作 fallback 或删。
  注意 stage-5 现在的产物是「自包含 HTML slide 截图」,新产物是「自包含 d2 场景(带时间轴+烧字幕,逐场景渲 mp4)」——下游 render 阶段同步改(Step 3)。

### Step 3 —— Stage-6 渲染改为「逐场景 hyperframes render → concat → 混音」

- 把 `render-all.sh` + `finalize.sh` 的逻辑做进 stage-6(可保留为 skill 脚本 `scripts/render-d2.sh`,参数化 slug)。
- 渲染产物落 `blog2video-output/<slug>/clips/` 与 `renders/`;**Remotion 链路保留为 fallback**(`blog2video-remotion/` 不动)。
- 混音用项目原始 `*_audio.mp3`,**不做任何响度处理**(CLAUDE.md NEVER 条款)。不 `-shortest`(保 CTA 静音尾卡)。
- 帧吸附(Step 1)做了之后,漂移自动消失。

### Step 4 —— 文档

- 更新 `CLAUDE.md` 架构段:stage-5 = d2 场景生成器(替换 slide-html),stage-6 = hyperframes 逐场景渲+concat+混音(Remotion fallback);新增 `scripts/build-scenes-data.mjs` 说明。
- **投递流程不变**:`*.html`、`clips/`、`*_audio.mp3` 等本就在 Post-Render Delivery 排除名单;确认 `scenes/`、`renders/silent` 也排除,只传 `video_N.mp4`(=最终混音片)+ 封面 + script + vtt + source_blog + meta.json。
- 交付仍走 rclone 到 gdrive(本片是审阅样片,**没投递过**;投产后第一支才正式投)。

### Step 5 —— 端到端验证

跑一次完整 `/blog2video`(或从 loop-engineering 现有产物起,走新 d2 path 重生成一支),确认:25 场景 lint 0 error、逐帧 QA、渲染无 OOM、整片音视频不漂移、投递文件清单正确。

## 用户待决(Phase 2 可先按默认推进,但要提醒用户)

1. **渲染算力**:Phase 1 实测 8GB 串行 ~42 min/支(17min 片)。默认沿用本地串行;若投产量大,考虑大内存机 / HeyGen cloud render。
2. **单集时长**:本片 17min,小红书数据偏好 3–5min。是否在 stage-3 用 Episode Splitter 切短(纯编辑决策,不影响 d2 渲染管线)。

## 一句话给新会话
读本文件 → 先做 Step 1(时间轴脚本,含帧吸附修漂移)→ Step 2/3 搬资产改 stage-5/6 → Step 4 文档 → Step 5 端到端验证。Phase 1 的 kit/生成器/范本/渲染脚本都现成,Phase 2 主要是「搬进 skill + 补时间轴脚本 + 改两个 stage + 修漂移」。
