# d2 组件库手册 (components.md)

> 给 **scene-generator** 看的速查表。配 `d2-base.css`(类定义)+ `d2-motion.js`(动效)。
> 原则:**场景自包含** —— 生成器把 `d2-base.css` 全文贴进 `<style>`、`d2-motion.js` 全文贴进第一个 `<script>`,再写场景内容 + timeline。组件类不加 sNN 作用域(单 composition 渲染不串扰);GSAP 用 `R="[data-composition-id='sNN'] "` 前缀定位。

## 场景骨架(复制)

```html
<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>
/* ↓↓↓ 这里整段内联 kit/d2-base.css ↓↓↓ */
/* ↑↑↑ 内联结束 ↑↑↑ */
/* —— 本场景特有的极少量样式(能用 kit 就别新写)—— */
</style>
</head>
<body>
  <div id="root" class="stage" data-composition-id="sNN" data-start="0" data-duration="<brief.dataDuration>" data-width="1080" data-height="1920">
    <div class="grid"></div>
    <div class="topbar">
      <div class="brand">精读AI · LOOP ENGINEERING<span class="b-cur"></span></div>
      <div class="idx"><brief.topbarIndex,如 [05/24]></div>
    </div>

    <div class="content"><!-- 或 .content top / .content tight,见下 -->
      <!-- 组件按类型拼装,见 §类型范式 -->
    </div>

    <!-- 字幕:brief.subtitles 每条一个,本地时间,一字不差 -->
    <div id="sub-1" class="clip sub" data-start="0" data-duration="<localDuration>" data-track-index="5">
      <div class="sub-inner">整句照抄,<span class="sub-k">关键词</span>点酸性绿</div>
    </div>
    <!-- … -->
  </div>

  <script>
  /* ↓↓↓ 这里整段内联 kit/d2-motion.js ↓↓↓ */
  /* ↑↑↑ 内联结束 ↑↑↑ */
  </script>
  <script>
  (function(){
    var R="[data-composition-id='sNN'] ";
    var tl = D2.buildSceneTimeline(R, {
      duration: <brief.dataDuration>,
      breath: '<奇数场景 in / 偶数 out>',
      staggers: [ {sel:'.row', at:3.2, step:2.6} ],
      sweeps:   [ {sel:'.hl', at:35.9} ],
      counts:   [ {el:'#tk1 .num', at:14.0, from:0, to:15, suffix:'×'} ],
      subs:     [ ['#sub-1',0], ['#sub-2',4.46] /* … */ ]
    });
    D2.register('sNN', tl);
  })();
  </script>
</body>
</html>
```

> 复杂编排(多 beat、手控每个元素)可不用 `buildSceneTimeline`,直接 `var tl=gsap.timeline({paused:true})` + `D2.enter/stagger/sweep/...` 低阶助手手写,最后 `D2.register('sNN',tl)`。封面 scene-01 即手写范式。

---

## 组件速查(类名 → 何时用)

| 组件 | 类 | 何时用 |
|---|---|---|
| 蓝图点阵 | `.grid` | 每个场景铺底(已在骨架) |
| topbar | `.topbar` `.idx` `.b-cur` | 每个场景顶栏(已在骨架) |
| 章节小标签 | `.kicker`(内 `.acc` 点酸性) | image/principle 开场的 `STATUS QUO ·` 式 mono 标签 |
| 大标题 | `.h1`(`.xl` 更大,`.em` 酸性词) / `.h2` | 每屏 1 个核心标题 |
| 引导句 | `.lead`(`.dim` 次级 / `.em` 酸性) | 标题下一句论述 |
| 酸性高亮 | `.hl > .bar + .tx` | 全屏 ≤1 处的金句/重音词,配 `D2.sweep` |
| chip | `.chip > .ci + .ct` | 封面三连「连搞通宵/读完/讲透」式短卡 |
| 编号清单 | `.rows > .row > .n + .rb(.rt + .rd)` | checklist / image 步骤列表;`.row.warn` 珊瑚警告,`.row.now` 酸性当前条 |
| 流程箭头 | `.flowarrow > .a` | 纵向步骤之间 `↓ 回到 02` |
| 终端窗口卡 | `.term > .term-bar(.d×3 + .t) + .term-body` | quote/金句/代码;`.term-l1 .p`=`$` 提示符,`.term-l2`=大字引用,`.term-en` 电青英文,`.term-src` 出处 |
| corner-bracket | `.bracket`(::before/::after 角标) | 节点流程图的节点、重点面板 |
| 状态灯 | `.status > .dot + 文本`(`.alert` 珊瑚) | `● LOOP RUNNING` 氛围标 |
| 块光标 | `.cur`(`.sm` 小) | 打字机/hero 收尾,配 `D2.blink` |
| 双栏对比 | `.cols > .col(.ch + .it(.nm + .ds))` | comparison_cards;右栏 `.col.alt` 电青;`code`/`.tag` 行内强调 |
| 时间线 | `.tl > .tl-row(.yr + .wt)`;`.tl-row.now`(+ `.badge`) | principle 年份时间轴,当前格点亮 |
| 数据条 | `.stats > .stat(.num + .lab)`;`.stat.key` 酸性 / `.stat.cyan` 电青 | quote 的 1×/4×/15× token 等,配 `D2.countUp` |
| 大数字赢 | `.win > .num + .lab` | +90.2% 这类单个高光数字 |
| end chip | `.endchip > .dot + .lab` | summary/cta 收尾标语 |

---

## 安全区 & 密度(铁律)

- `.content` 默认垂直居中,padding `300 / 72 / 540`。内容多用 `.content.top`(从 236px 起排),极密用 `.content.tight`(208px 起)。
- **内容底边不得越过 y≈1380**(下方留给字幕带 bottom:340)。4 条以上带说明的清单 → 用 `.content.top` + 收紧 `.rd` 行数。
- 画布上**只放关键词**,整句只在字幕带;别把字幕整句再抄到画布。
- 每帧酸性绿 `#ccff4d` 必在场(页码/光标/编号/高亮其一)。辅助色每帧最多再来一种(电青或珊瑚)。

## 动效绑定(口播本地时间)

- 每个元素入场绑 brief 字幕的 `localStart`(±300ms 内出现)。列表/卡片逐条 `D2.stagger`,**永不整屏一次性上**。
- 酸性扫过只给金句/章节大字,每屏 ≤1 次。数字用 `D2.countUp`(tabular-nums)。
- 呼吸:奇数场景 `breath:'in'`,偶数 `'out'`,交替。
- 除场景最末元素可保留外,场景内不做退场(无跨场景转场)。

## 类型范式(content 里怎么拼)

- **image**:`.kicker` + `.h1` + (`.lead` 或) `.rows`(步骤/要点逐条 build,`code` 点术语)。叙事密集时 `.content.top`。
- **principle**:`.kicker` + `.h1` + `.lead`(核心原则) + `.tl`(时间线逐格点亮,末格 `.now`)。
- **comparison_cards**:`.kicker`(模块 N/5) + `.h1` + 可选 `.lead` 痛点 + `.cols`(左主右 `.alt`)逐栏 build + 可选底部 `.status`/`.endchip` 补充。
- **checklist**:`.kicker` + `.h1` + `.rows`(`.row` 编号逐条,警告条 `.row.warn`)。条目多必 `.content.tight` 并精简 `.rd`。
- **quote**:`.term` 装金句(`$` + 大字 + 酸性高亮短语 + `.term-en` + `.term-src`),下方可接 `.stats`/`.win` 数据(count-up)。
- **summary**:`.kicker`(收官) + `.h1` + `.term`(把行动写成 `$ /goal …` 命令,光标闪) + `.endchip` 标语。
- **cta**(5s 静音尾卡):大 logo `精读AI` + 副标 `LOOP ENGINEERING · 完` + `.cur` 酸性光标。无 topbar 页码也可,无字幕。
