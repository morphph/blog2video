# scene-generator —— d2「终端霓影」单场景生成器(stage-5,智能模板)

> 给**子 agent** 的完整作业书。一个 agent 负责一个(或一小批)场景:把源 `slide_N.html` 的内容,
> 在 d2 视觉语言里重排成一个**自包含、可单独渲染的静音场景**,字幕烧入,动效绑口播。
> 子 agent 无共享上下文 —— 本文件 + kit + 同类型黄金范本 + 本场景 brief = 你需要的全部。
>
> **路径约定**(编排者派活时已把 `<OUTPUT_DIR>` 替换成实际值,如 `blog2video-output/loop-engineering`):
> - `OUT` = `<OUTPUT_DIR>`(逐视频工作区:slide 源 / briefs / 你要写的 src/scenes 都在这里)
> - `KIT` = `.claude/skills/blog2video/design/d2-kit`(组件库 + 字体 + 黄金范本,随 skill 走,只读)
> - `BUILD` = `.claude/skills/blog2video/scripts/build-scene.mjs`(内联打包 + scaffold,一步到位)

## 0. 环境(每条 shell 命令前缀)

```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"   # Apple Silicon;node -v 必须是 v22.x,否则渲染/快照 OOM
cd /Users/yufanp/Desktop/Project/blog2video
```

## 1. 输入(全在磁盘)

| 输入 | 路径 |
|---|---|
| 本场景 brief(时长/字幕本地时间/topbar 序号/源 slide 路径) | `OUT/briefs/scene-NN.json` |
| 源 slide(内容真源:标题/卡片/数字/命令/术语) | `brief.srcSlideHtml`(绝对路径,= `OUT/slide_N.html`) |
| 组件库:类定义 | `KIT/d2-base.css` |
| 组件库:动效助手 | `KIT/d2-motion.js` |
| 组件库:速查手册(组件→何时用 + 类型范式) | `KIT/components.md` |
| **同类型黄金范本**(照着学结构/动效节奏) | 见下表 |
| 设计令牌权威 | `KIT/DESIGN.md` |

### 同类型黄金范本(必读对应那一个,均在 `KIT/samples/`)

| 你的类型(brief.type) | 范本 | 范本说明 |
|---|---|---|
| cover | `KIT/samples/scene-01.html` | 多 beat 封面(已渲已验收;此份是内联后的成品,看结构/节奏即可) |
| image | `KIT/samples/scene-02.html` | kicker+标题 + 编号步骤清单(逐条 build,行内 code/cyan 标签) |
| principle | `KIT/samples/scene-05.html` | 第一性原理 + corner-bracket 概念 + 时间线逐格点亮(末格 .now+badge) |
| comparison_cards | `KIT/samples/scene-07.html` | 双栏(左 acid / 右 .alt cyan)逐栏 build + 底部 status |
| quote | `KIT/samples/scene-16.html` | 终端卡金句(coral 强调)+ stats count-up + win 大数字 |
| checklist | `KIT/samples/scene-17.html` | 4 原则编号清单(密集:画布只放关键词,长例子留字幕)+ warn 行 |
| summary | `KIT/samples/scene-24.html` | 收官(brand 改"收官")+ 终端命令 CTA + 酸性 sweep + endchip |

> 范本 `scene-02/05/07/16/17/24` 是**授权源形式**(含 `/*@@BASE@@*/`、`/*@@MOTION@@*/` marker),正是你要产出的格式;
> `scene-01` 是内联后的成品(cover 当初手搓),看它学结构,但你自己写的 src 仍用 marker 形式。

## 2. 输出契约

1. 写 **`OUT/src/scene-NN.html`** —— 完整 HTML 文档,但 kit 用 marker 占位:
   - `<style>` 内放 `/*@@BASE@@*/`(build 时替换成 d2-base.css 全文)+ 极少量本场景特有样式
   - 第一个 `<script>` 放 `/*@@MOTION@@*/`(build 时替换成 d2-motion.js 全文)
   - 第二个 `<script>` 写本场景 timeline
2. `node BUILD OUT NN` → 自动 scaffold(assets symlink + hyperframes.json + meta.json)并内联生成
   自包含 `OUT/scenes/scene-NN/index.html`。**不要**手动建场景目录,build 脚本一步到位。
3. 根元素:`<div id="root" class="stage" data-composition-id="sNN" data-start="0" data-duration="<brief.dataDuration 一字不差>" data-width="1080" data-height="1920">`

## 3. 铁律(违反 = 返工)

1. **时长精确**:根 `data-duration` = `brief.dataDuration`,一秒不差(concat 靠它对齐;已帧吸附,别再改)。
2. **静音**:场景里没有 `<audio>`。音频最后统一混。
3. **字幕烧入**:`brief.subtitles` 每条一个 `<div class="clip sub" data-start data-duration data-track-index="5">`,
   **用本地时间(brief 里的 localStart/localDuration)**,文字**一字不差**照 brief。每条 `<div class="sub-inner">` 里**最多 1 个 `.sub-k`**(酸性绿)点关键词。入场 0.2s 淡入。
   (build 脚本会自动把每条显示时长削 10ms 避免 track5 浮点重叠 —— 你照 brief 原值写即可。)
4. **画布 = 关键词**。整句只在底部字幕带。**别把字幕整句再抄到画布**(冗余,违反学习科学)。密集场景(>3 条要点/长例子)→ 画布只放标题/关键词/数据,详细例子留给字幕(见 scene-17)。
5. **确定性**:无 `Date.now`/`Math.random`/网络请求(GSAP 走 jsdelivr CDN 脚本 OK)/`repeat:-1`(用有限次)。timeline 同步构建。
6. **安全区**:`.content` padding 上≥160 / 左右72 / **下≥540**(字幕带 bottom:340)。内容底边不得越过 y≈1380。
   密集列表用 `.content.top`(236 起)或 `.content.tight`(208 起)。
7. **只动** `transform`/`opacity`/`color`/`backgroundColor`;暗底**禁全屏线性渐变**(H.264 banding),点阵/光晕用 radial。
8. **字体**:只用 MiSans + JetBrains Mono(已在 `KIT/assets/fonts`,build 时 symlink 进场景)。**font-family 写字面量** `'MiSans',sans-serif` / `'JetBrains Mono',monospace`,**不要写 `var(--sans)`/`var(--mono)`**(lint 会误报字体缺失)。**禁止引入新大字体**。
9. **禁 emoji**:源 slide 里的 🚗🌙📄✓ 等一律删掉或换成 mono 符号(`→`/`›`/`●`/`✓` 里只有前三个安全;不确定就用文字)。没有 emoji 字体,会渲成豆腐块。
10. **颜色纪律**:签名色酸性绿 `#ccff4d` **每一帧都在场**(页码/光标/编号/高亮其一)。除签名色外,**任意一帧最多再出现一种**辅助色(电青 `#5fd3e8` 数据/链接 · 信号珊瑚 `#ff6b5e` 警示/对立面)。终端卡顶栏三圆点(珊瑚/琥珀/绿)是公认 chrome 例外,不计入。
11. **禁**:紫色、藏青 `#0d0d1a`、多色渐变、>8px 圆角、阴影、弹性/回弹 ease。

## 4. 场景骨架(复制,填空)

```html
<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>
/*@@BASE@@*/
/* —— scene-NN 特有(能用 kit 类就别新写;新写也要加 [data-composition-id='sNN'] 前缀)—— */
</style>
</head>
<body>
  <div id="root" class="stage" data-composition-id="sNN" data-start="0" data-duration="<dataDuration>" data-width="1080" data-height="1920">
    <div class="grid"></div>
    <div class="topbar">
      <div class="brand">精读AI · LOOP ENGINEERING<span class="b-cur"></span></div>
      <div class="idx"><brief.topbarIndex></div>
    </div>
    <div class="content top"><!-- 或 .content / .content.tight —— 见类型范式 + 密度 -->
      <!-- 用 kit 组件拼内容,见 components.md §组件速查 + §类型范式 -->
    </div>
    <!-- 字幕:brief.subtitles 逐条 -->
    <div id="sub-1" class="clip sub" data-start="0" data-duration="<localDuration>" data-track-index="5"><div class="sub-inner">整句照抄,<span class="sub-k">关键词</span></div></div>
    <!-- … -->
  </div>
  <script>
  /*@@MOTION@@*/
  </script>
  <script>
  (function(){
    var R="[data-composition-id='sNN'] ";
    var tl=gsap.timeline({paused:true});
    tl.from(R+'.grid',{opacity:0,duration:.5,ease:'power1.out'},.02);
    tl.from(R+'.topbar',{y:-16,opacity:0,duration:.3,ease:'power2.out'},.2);
    /* …元素入场,绑字幕本地时间,见 §5… */
    D2.subs(tl, [['#sub-1',0]/*,…*/].map(function(s){return [R+s[0],s[1]];}));
    D2.breath(tl, R+'.content', <dataDuration>, '<奇数场景 in / 偶数 out>');
    window.__timelines = window.__timelines || {};
    window.__timelines['sNN'] = tl;   /* ← 必须显式注册,key=composition-id;别只用 D2.register(lint 看不到) */
  })();
  </script>
</body>
</html>
```

## 5. 动效(D2 助手 API + 节奏)

低阶助手(`R` 是 `"[data-composition-id='sNN'] "`,所有 sel 传 `R+'.xxx'`):
- `D2.enter(tl, sel, at, {x?,y?,d?,ease?})` —— 单元素入场(默认 y:18+fade,0.32s,power3.out)。**注意:enter 只认 x/y/d/ease,不透传 scale/opacity。**
- `D2.stagger(tl, sel, at, {x?,y?,d?,ease?,step?})` —— 一组逐条 build(默认 step 0.14)
- `D2.sweep(tl, R, '.hl', at)` —— 酸性块扫过 + 文字反色(每屏 ≤1 次,留给金句/章节大字)
- `D2.countUp(tl, R+'#id', at, from, to, dur, {prefix?,suffix?,decimals?})` —— 数字滚动(tabular-nums)
- `D2.blink(tl, sel, at, times)` —— 块光标有限次闪
- `D2.subs(tl, [[sel,localStart],...])` —— 字幕 0.2s 淡入
- `D2.breath(tl, R+'.content', dur, 'in'|'out')` —— 整段呼吸;**奇数场景 'in' / 偶数 'out'**

节奏铁律:
- **每个元素入场绑口播本地时间**(在对应 brief.subtitle 的 localStart ±300ms 出现)。列表/卡片/节点逐条 build,**永不整屏一次性上**。
- 至少 3 种不同 ease;同场景不重复同一模式。入场 y 16–20px,0.25–0.35s,power3.out/expo.out。
- 除场景最末元素可保留外,**场景内不做退场**(无跨场景转场);每个元素都要有入场。
- 长 hold(>8s 无新元素)靠 breath + 字幕维持,可在中途补一个次级揭示(标签/数据行)。

### ⚠️ 两个最容易踩的坑(范本踩过)

**A. 入场选择器必须唯一。** 若 `D2.enter(R+'.kicker', .4)` 而页面有两个 `.kicker`(如又有个 `class="kicker tlh"`),
两个都会在 0.4 入场。**给每个要单独控制入场的元素一个独有类**(如顶部用 `.k-top`),再分别 enter。

**B. 同一卡片里"晚到"的子元素 = 给它自己的延迟 from。** 想让整张卡 8.5s 入场、卡内某行/某组标签 18s 才出现:
先 `D2.enter(R+'.card', 8.5)`(整卡含子元素淡入),再对晚到子元素 `D2.enter(R+'.card .late', 18)`。
GSAP `.from` 的 immediateRender 会在 t=0 就把 `.late` 设成 opacity:0,于是它一直藏到 18s 才显 —— 即使父卡 8.5s 已显。
(scene-02 的 cyan 标签、scene-17 的 en3/params 都是这么做的。)

## 6. 类型范式(content 里怎么拼 —— 详见 components.md §类型范式)

> 流程:读 `srcSlideHtml` → 提取标题/卡片/数据/数字/英文术语 → 按 d2 范式重排 → 配动效 → 绑字幕时间。
> **保留原内容的信息层级和数据**(数字、命令、术语**别改**),只换视觉语言。删 emoji。
> brief.type 是编排者给的类型;若你读 srcSlide 后强烈认为类型该换(如标着 image 实为对比),在汇报里说明,但默认按 brief.type 选范本。

- **image**:`.kicker` + `.h1` + `.rows`(`.row` 编号逐条,`.code` 点术语,可加 cyan `.tag` 数据标签)。叙事密集 → `.content.top`。范本 s2。
- **principle**:`.kicker` + `.h2/.h1` + `.bracket`(核心原则/比喻) + `.tl`(时间线逐格点亮,末格 `.now`+`.badge`)。范本 s5。
- **comparison_cards**:`.kicker`(模块 N/5) + `.h1` + 可选痛点 lead + `.cols`(左 `.col` acid / 右 `.col.alt` cyan)逐栏 build + 可选底部 `.status`。`code`/`.tag` 行内强调。范本 s7。
- **checklist**:`.kicker` + `.h1` + `.rows`(编号逐条;警告条 `.row.warn` 珊瑚)。**条目多必用 `.content.tight` 且画布只放关键词,长例子留字幕**。范本 s17。
- **quote**:`.term` 终端卡装金句(`$` 提示符 + 大字 `.term-l2` + 关键短语强调 + `.term-src` 出处),下方可接 `.stats`/`.win` 数据(`D2.countUp`)。范本 s16。
- **summary**:`.kicker` + `.h1.xl` + `.term`(行动写成 `$ /goal …` 命令,光标 `D2.blink`)+ `.endchip` 标语;topbar brand 可改"精读AI · 收官"。范本 s24。
- **cta**(末场景,5s 静音尾卡,**无字幕**):纯 end card —— 大 logo `精读AI`(MiSans 900)+ 副标 `<系列名> · 完`(mono)+ 酸性 `.cur` 光标(blink)。无 topbar 页码亦可。源 slide 可能不存在(brief.srcSlideHtml 指向不存在的 slide_N.html),按本约定纯手写即可。

## 7. 自检关卡(产出后**必做**,修到干净)

```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
cd /Users/yufanp/Desktop/Project/blog2video
node .claude/skills/blog2video/scripts/build-scene.mjs OUT NN
hyperframes lint OUT/scenes/scene-NN 2>&1 | grep -E "✗|error\(s\)"    # 必须 0 error
NODE_OPTIONS="--max-old-space-size=5120" hyperframes snapshot OUT/scenes/scene-NN --at <场景内 5-6 个关键时刻,本地秒> --describe false
```
(把上面的 `OUT` 换成编排者给你的实际工作区路径,如 `blog2video-output/loop-engineering`。)
然后用 **Read 工具看 `OUT/scenes/scene-NN/snapshots/contact-sheet.jpg`**,逐格检查:
- [ ] 左上角无无样式裸文字(=选择器/接线错);无重叠/溢出/截断
- [ ] 内容**未侵入字幕带**(底边 < y≈1380);列表全部可见且不被切
- [ ] 字体生效(大标题 MiSans Heavy、标签/编号/命令 JetBrains Mono);**酸性绿每帧在场**;辅助色每帧 ≤1 种
- [ ] 元素入场节奏对齐字幕(该出现时出现,没有提前/整屏一次上);晚到子元素确实藏到点
- [ ] 字幕一字不差照 brief;每句 ≤1 个 `.sub-k`
- [ ] 内容数据与 srcSlide 一致(数字/命令/术语没改),emoji 已删

**lint 0 error 容许的 warning**(已知良性,不用管):`timeline_track_too_dense`(字幕本来就密)、`gsap_timeline_not_registered`(对 motion.js 库脚本的误报,场景脚本已显式注册)、`overlapping_gsap_tweens` 的 `__unresolved__`(R 是 JS 变量,linter 解析不了,实为不同元素)、`scoped_css_missing_wrapper`/`font_family_without_font_face`(若你没引入 var()/裸 sNN 选择器就不会出)。

## 8. 汇报(交回编排者)

每个场景报:文件路径、lint 结果(error 数)、快照目检发现并修复的问题清单、与 srcSlide 的内容差异(应只换皮不改数据 + 删 emoji)、用到的辅助色、以及(若有)对 brief.type 的异议。**不要自己 render mp4**(渲染由编排者统一串行做,见 stage-6)。
