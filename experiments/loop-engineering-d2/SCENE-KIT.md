# SCENE-KIT —— loop-engineering 全片 d2「终端霓影」逐场景渲染规范

每个 slide = 一个**独立可单独渲染**的 standalone HTML composition(无 `<template>`、无 audio、字幕烧在场景内)。
渲染时逐个 `hyperframes render -c scenes/scene-NN.html` 出**静音 clip**,最后由编排者 concat + 混入完整音频。
**因此:场景之间不做跨场景转场**(每个 clip 独立)。每个场景靠**强入场 + 收尾保持可见**衔接,d2 的「利落瞬切」性格本就吃硬切。

## 0. 铁律(违反=返工)

1. **时长精确**:根 `data-duration` = scenes-data.json 里该场景的 `dur`,一秒不差(concat 靠它无缝对齐)。
2. **静音**:场景里**没有** `<audio>`。音频最后统一混。
3. **字幕烧在场景内**:用 scenes-data.json 该场景的 `subs`(已是**场景本地时间**),每条一个 `.sub` clip,track 5,
   按 §3 的字幕规范,入场 0.2s 淡入。**字幕文字一字不差**。
4. **画布文字=关键词**,整句只在底部字幕带。画布上别把字幕整句再写一遍(冗余,违反学习科学)。
5. 确定性:无 `Date.now`/`Math.random`/网络请求(GSAP 用 jsdelivr CDN 脚本可以)/`repeat:-1`(用有限次)。timeline 同步构建。
6. 安全区:内容上边距 ≥160px、左右 72px、**下方 ≥500px 留给字幕带**(字幕 bottom:340,内容 padding-bottom 540)。
   y>1420 区域只属于字幕,场景主内容不得进入。
7. 只动 `transform`/`opacity`/`color`/`backgroundColor`;暗底禁全屏线性渐变(H.264 banding),点阵/光晕用 radial。
8. **内存**:本机 8GB,字体只用 MiSans + JetBrains Mono(已在 assets/fonts)。**禁止引入新的大字体**。

## 1. Standalone 场景骨架(复制这个结构)

> `scene-NN.html` 是完整 HTML 文档。`data-composition-id` 用 `sNN`(如 `s07`)。所有作用域选择器都用 `[data-composition-id='sNN']` 前缀。

```html
<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>
  /* —— 字体(每个场景都要声明,编译器逐场景嵌入)—— */
  @font-face{font-family:'MiSans';src:url('../assets/fonts/MiSans-Regular.ttf') format('truetype');font-weight:400}
  @font-face{font-family:'MiSans';src:url('../assets/fonts/MiSans-Medium.ttf') format('truetype');font-weight:500}
  @font-face{font-family:'MiSans';src:url('../assets/fonts/MiSans-Demibold.ttf') format('truetype');font-weight:600}
  @font-face{font-family:'MiSans';src:url('../assets/fonts/MiSans-Heavy.ttf') format('truetype');font-weight:900}
  @font-face{font-family:'JetBrains Mono';src:url('../assets/fonts/JetBrainsMono-Regular.ttf') format('truetype');font-weight:400}
  @font-face{font-family:'JetBrains Mono';src:url('../assets/fonts/JetBrainsMono-Medium.ttf') format('truetype');font-weight:500}
  @font-face{font-family:'JetBrains Mono';src:url('../assets/fonts/JetBrainsMono-Bold.ttf') format('truetype');font-weight:700}
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:1080px;height:1920px;overflow:hidden;background:#121212;font-family:'MiSans',sans-serif;color:#edebe6}
  /* —— 字幕带(所有场景统一)—— */
  .sub{position:absolute;left:72px;right:72px;bottom:340px;z-index:30;display:flex;justify-content:center}
  .sub-inner{background:rgba(18,18,18,.6);border-top:1px solid #2a2a2c;max-width:936px;padding:16px 22px;
    font-weight:500;font-size:38px;line-height:1.4;color:#edebe6;text-align:center}
  .sub-k{color:#ccff4d}
  /* —— 作用域内容样式(用 sNN 前缀)—— */
  [data-composition-id='s07']{position:relative;width:1080px;height:1920px;background:#121212;overflow:hidden}
  [data-composition-id='s07'] .grid{position:absolute;inset:0;
    background-image:radial-gradient(circle,rgba(237,235,230,.9) 1px,rgba(237,235,230,0) 1.5px);
    background-size:56px 56px;background-position:28px 28px;opacity:.045;
    -webkit-mask-image:radial-gradient(ellipse 75% 62% at 50% 45%,#000 50%,rgba(0,0,0,0) 100%)}
  [data-composition-id='s07'] .content{width:100%;height:100%;padding:176px 72px 540px;
    display:flex;flex-direction:column;align-items:flex-start;box-sizing:border-box;transform-origin:50% 45%}
  /* …该场景其余样式… */
</style>
</head>
<body>
  <div id="root" data-composition-id="s07" data-start="0" data-duration="45.396" data-width="1080" data-height="1920">
    <div class="grid"></div>
    <div class="content">
      <!-- topbar / 标题 / 卡片… 见 §2 类型手册 -->
    </div>
    <!-- 字幕:每条 scenes-data 的 subs[i],data-start/duration 用本地时间 -->
    <div id="sub-1" class="clip sub" data-start="0" data-duration="3.2" data-track-index="5">
      <div class="sub-inner">还记得早上那个自动醒来的<span class="sub-k">定时任务</span>吗？</div>
    </div>
    <!-- …其余字幕… -->
  </div>
  <script>
  (function(){
    window.__timelines = window.__timelines || {};
    var R="[data-composition-id='s07'] ";
    var tl=gsap.timeline({paused:true});
    /* 内容入场(见 §4 动效语法)*/
    tl.from(R+'.grid',{opacity:0,duration:.5,ease:'power1.out'},0.02);
    /* …元素入场,绑定口播本地时间… */
    /* 字幕淡入(0.2s,在各自 data-start 处)*/
    [['#sub-1',0]/*,…*/].forEach(function(s){ tl.from(s[0],{opacity:0,duration:.2,ease:'power1.out'},s[1]); });
    /* 环境呼吸:整段 content 1.00→1.03~1.04(方向逐场景在 in/out 间交替)*/
    tl.to(R+'.content',{scale:1.035,duration:45.396,ease:'none'},0);
    window.__timelines['s07']=tl;
  })();
  </script>
</body>
</html>
```

`-c` 渲染单文件 standalone composition 已验证可行(见 scene-01)。

## 2. d2 视觉令牌(全片统一,出自 DESIGN.md)

- 背景 `#121212` 暖近黑 / 面板 `#1c1c1e` / 主文字 `#edebe6` / 次级 `#8a8a85` / keyline `#2a2a2c`
- **签名色 酸性黄绿 `#ccff4d`**:每一帧都要在场(页码、光标、关键词高亮、状态灯、强调线)
- 辅助(各 ≤10% 帧、每帧最多再来一种):电青 `#5fd3e8`(数据/链接)、信号珊瑚 `#ff6b5e`(警示/对立面)
- 字体:中文 MiSans(900 大标题 / 600 卡片标题 / 500 正文);英文·代码·标签·页码·时间码 = JetBrains Mono
- 禁:紫色、藏青 `#0d0d1a`、多色渐变、>8px 光晕、>8px 圆角、阴影(用 keyline+面板色分层)、弹性 ease

### 复用组件(每个场景按需取用)
- **点阵网格** `.grid`(见骨架,radial 点 + 椭圆遮罩,opacity .045)——几乎每个场景都铺底,保证「蓝图」氛围
- **topbar**:左 `精读AI · 模块名`(mono 25px #8a8a85)+ 右页码 `[NN/24]`(mono #ccff4d)。每个场景都有,建立「栏目感」
- **终端窗口卡**(quote/代码/金句用):面板 `#1c1c1e` + 1px `#2a2a2c`,顶栏三圆点(#ff6b5e/#ffbd2e/#27c93f 各 12px)+ mono 标题 `user@host:~`,`$` 提示符开头
- **corner-bracket 面板**(重点区/节点):L 形角标 `::before/::after` 用 2px #ccff4d 画左上+右下角
- **状态灯**:`●` 小圆点(#ccff4d 或珊瑚)+ mono 标签(`LOOP RUNNING`/`RECORDING`/`BREAK`)
- **块状光标** `.cursor`:#ccff4d 矩形,打字机/hero 收尾用;闪烁用 `steps(1)` 有限次 yoyo
- **酸性高亮**:关键词后置 `.hl-bar`(absolute inset:0 #ccff4d transform:scaleX(0) origin:left),`scaleX→1` 0.3s power4.inOut,
  文字同时 `color→#121212`(反色)。每屏 ≤1 处。
- **mono 编号** `01 / 02`:列表/步骤/卡片前缀,#ccff4d,letter-spacing .05em

## 3. 字幕规范(全片统一)

- 位置 `bottom:340px`、居中、max-width 936px、`#edebe6` 38px MiSans Medium、带 `rgba(18,18,18,.6)` + 1px `#2a2a2c` 上边线
- 每条独立 `.sub` clip(track 5),`data-start`/`data-duration` = scenes-data 本地时间;入场 0.2s 淡入
- 每句**最多 1 个关键词**用 `.sub-k`(#ccff4d)点出;两行封顶
- 文字一字不差照抄 scenes-data 的 `subs[i].text`(关键词 span 自行选最重要的 2-4 字包裹)

## 4. 动效语法(d2 性格:工程式利落)

- 入场:y 16–20px + fade,**0.25–0.35s**,`power3.out` / `expo.out`;每场景至少 3 种不同 ease,同场景不重复同一模式
- 元素入场**绑定口播本地时间**(±300ms 内出现);列表/卡片/节点逐条 build,**永不整屏一次性上**
- 打字机:中文按字、英文按字符,块状光标尾随,~28ms/字符(用 SplitText 或手动 stagger 字符 span)
- 关键词强调=信号:酸性块扫过 / 兄弟元素瞬降亮度 / 下方 2px 亮线 draw(200–300ms),不是重新入场
- 环境呼吸:整段 content `scale 1.00→1.03~1.04`,`ease:'none'`,duration=场景全长;奇数场景推近、偶数拉远交替
- **除场景最末元素可保持外,场景内不做退场动画**(没有跨场景转场需要退场);每个元素都要有入场
- 数字 count-up 1–3s ease-out 落停;`font-variant-numeric:tabular-nums`
- 弹性/回弹**禁用**;hero 重音(如金句关键词、章节大字)最多一拍放大,不弹

## 5. 各类型布局手册(内容取自对应 slide_N.html;在 d2 里重新排)

> 流程:读 `srcHtml`(旧暗色版)→ 提取标题/卡片/数据/数字/英文术语 → 按下面的 d2 范式重排 + 配 §4 动效 + 绑字幕时间。
> **保留原内容的信息层级和数据**(数字、命令、术语别改),只换视觉语言。

- **cover**(s1):topbar + `LOOP ENGINEERING`(mono 700 大)+ 中文大标题(MiSans 900)+ 「来了。」块光标 hero +
  Boris 金句**终端窗口卡**(`boris@claude-code:~`,`$ 我已经不给 Claude 写提示词了` / `我的工作,是写循环`(写循环酸性高亮))+ teaser。
- **image**(叙事/概念,10 个):多为「一段论述 + 几个要点/步骤」。用 **corner-bracket 面板 + mono 编号的步骤列表**,或
  **节点流程图**(节点=带角标的面板,箭头=#ccff4d 1.5px stroke-draw + 三角)。逐条随口播 build。关键术语酸性点出。
- **principle**(s5/s12/s13):一条核心原则 / 一条时间线。用**时间线**(年份 mono + 节点,如 2023→2026,当前格 #ccff4d)
  或**大原则陈述 + 支撑要点**。s5 有「2023 你写代码 / 2024 你提示 / 2025 你写循环 / 2026 你构建系统」时间线——做成横向/纵向 mono 时间轴,逐格点亮。
- **comparison_cards**(s7/s8/s11/s14):**双栏对比**,左 `CLAUDE CODE` 右 `CODEX`(或角色对比)。两个 corner-bracket 面板并排,
  各自 mono 标题 + 要点列表。逐栏 build。s14 是三角色(Planner/Generator/Evaluator)——三面板纵向堆叠或 1+2 布局。
- **checklist**(s17/s21/s22):**编号原则/警告清单**。每条 = mono 编号 `01` + 标题(MiSans 600)+ 一句说明(500 次级色)。
  逐条入场(stagger),当前条角标 #ccff4d 点亮。s22 三个警告可用珊瑚色信号灯强调「警告」属性。
- **quote**(s16/s23):**终端窗口卡**装金句,`$` 提示符 + 大字引用(MiSans 900),关键短语酸性高亮。出处 mono 小字。
  s16 还有数据(1× / 4× / 15× token,90.2%)——金句下方加一行 mono 数据条,数字 count-up。
- **summary**(s24):收尾 + 行动召唤。topbar 改 `精读AI · 收官`,中央一句行动指令做成**终端命令**:`$ claude` → `/goal …`,
  光标闪烁;底部 end chip `AI 世界很吵,精读一篇 · 我们下期再见`。
- **cta**(s25,5s,静音尾卡):纯 d2 end card——大 logo `精读AI`,副标 `LOOP ENGINEERING · 完`,酸性光标,无字幕。

## 6. 每个场景产出后自检(子 agent 必做)

```bash
export PATH="/usr/local/opt/node@22/bin:$PATH"
cd /Users/yufanp/Desktop/Project/blog2video/experiments/loop-engineering-d2
hyperframes lint -c scenes/scene-NN.html 2>&1 | tail -3      # 0 error
hyperframes snapshot -c scenes/scene-NN.html --at <场景内 3-5 个关键时刻,本地秒> 2>&1 | tail -3
# 用 Read 逐张看快照 PNG(在 scenes/.hyperframes 或项目 snapshots/ 下):
#   - 左上角有无无样式裸文字(=作用域选择器/接线错)
#   - 重叠/溢出/截断;内容是否侵入字幕带(y>1420)
#   - 字体是否生效(大标题=MiSans Heavy,标签=JetBrains Mono);酸性色是否每帧在场
# 修到干净为止。不要自己 render mp4(渲染由编排者统一做)。
```

汇报:每个场景文件路径、lint 结果、快照目检发现并修复的问题、与 srcHtml 的内容差异(应只换皮不改数据)。
