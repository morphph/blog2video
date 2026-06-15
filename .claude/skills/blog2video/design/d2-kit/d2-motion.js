/* ============================================================================
   d2-motion.js —— GSAP 动效助手(全片统一性格:工程式利落)
   内联进每个场景的 script 块(GSAP 3.14 先于本段加载)。
   全局命名空间 window.D2。所有动画只动 transform / opacity / color / backgroundColor。
   禁:弹性/回弹 ease、repeat:-1、Date.now/Math.random。timeline 同步构建。

   两种用法:
   1) 低阶助手:在自写 timeline 里调 D2.enter(tl,sel,at,opts) 等(精修范本用,控制最细)。
   2) 高阶约定:D2.buildSceneTimeline(R, spec) 一把声明式建好(生成器默认用)。
   ============================================================================ */
(function(){
  var ACID='#ccff4d', BG='#121212';

  var D2 = {
    /* 标准入场:y 抬升 16–20px + fade,0.25–0.35s。opts:{y,x,d,ease,from(=true)} */
    enter:function(tl, sel, at, opts){
      opts = opts || {};
      var v = { opacity:0, duration:opts.d||0.32, ease:opts.ease||'power3.out' };
      v.y = (opts.y!=null) ? opts.y : 18;
      if(opts.x!=null) v.x = opts.x;
      tl.from(sel, v, at);
      return tl;
    },

    /* 一组元素逐条 build(stagger);永不整屏一次性上 */
    stagger:function(tl, sel, at, opts){
      opts = opts || {};
      var v = { opacity:0, duration:opts.d||0.3, ease:opts.ease||'power3.out', stagger:opts.step||0.14 };
      v.y = (opts.y!=null) ? opts.y : 18;
      if(opts.x!=null) v.x = opts.x;
      tl.from(sel, v, at);
      return tl;
    },

    /* 酸性高亮:.hl 块从左扫过(scaleX 0→1)+ 文字反色为 #121212。sel 指向 .hl 容器 */
    sweep:function(tl, R, sel, at){
      tl.to(R+sel+' .bar', { scaleX:1, duration:0.32, ease:'power4.inOut' }, at);
      tl.to(R+sel+' .tx',  { color:BG, duration:0.12, ease:'power1.inOut' }, at+0.16);
      return tl;
    },

    /* 下方 2px 亮线 draw(关键词强调的轻量版)。sel 指向一个 .underline 元素(transform-origin:left) */
    underline:function(tl, sel, at){
      tl.fromTo(sel, { scaleX:0 }, { scaleX:1, duration:0.28, ease:'power3.out' }, at);
      return tl;
    },

    /* 块状光标有限次闪烁 */
    blink:function(tl, sel, at, times){
      tl.to(sel, { opacity:0, duration:0.42, ease:'steps(1)', repeat:(times||5), yoyo:true }, at);
      return tl;
    },

    /* 打字机:对已拆成 char span 的集合做极短 stagger 显形(~28ms/字符)。
       用法:把文字拆成 <span class='ch'>x</span>,传 sel='.line .ch' */
    type:function(tl, sel, at, perChar){
      tl.from(sel, { opacity:0, duration:0.01, ease:'none', stagger:(perChar||0.028) }, at);
      return tl;
    },

    /* 数字 count-up:1–3s ease-out 落停。el 是真实 DOM 选择器(单个),整数或保留 decimals 位 */
    countUp:function(tl, el, at, from, to, dur, opts){
      opts = opts || {};
      var node = (typeof el==='string') ? document.querySelector(el) : el;
      if(!node) return tl;
      var prefix = opts.prefix||'', suffix = opts.suffix||'', dec = opts.decimals||0;
      var proxy = { v: from };
      tl.to(proxy, {
        v: to, duration: dur||1.4, ease: opts.ease||'power2.out',
        onUpdate: function(){ node.textContent = prefix + proxy.v.toFixed(dec) + suffix; }
      }, at);
      return tl;
    },

    /* 字幕淡入:list = [[id, localStart], ...](0.2s) */
    subs:function(tl, list){
      list.forEach(function(s){ tl.from(s[0], { opacity:0, duration:0.2, ease:'power1.out' }, s[1]); });
      return tl;
    },

    /* 环境呼吸:整段 content scale。dir:'in'(1→1.035 推近)/'out'(1.035→1 拉远)。dur=场景全长 */
    breath:function(tl, sel, dur, dir){
      if(dir==='out') tl.fromTo(sel, { scale:1.035 }, { scale:1.0, duration:dur, ease:'none' }, 0);
      else            tl.fromTo(sel, { scale:1.0 }, { scale:1.035, duration:dur, ease:'none' }, 0);
      return tl;
    },

    /* 揭示一个初始 opacity:0 的层(多 beat 场景切换用) */
    reveal:function(tl, sel, at){ tl.set(sel, { opacity:1 }, at); return tl; },

    /* ---- 高阶约定:声明式建整条 timeline ----
       spec = {
         duration: 场景全长(=brief.dataDuration),
         breath: 'in' | 'out',                     // content 呼吸方向(奇数 in/偶数 out)
         grid: true,                                // 是否 fade 入点阵 + topbar
         enters: [ {sel, at, x?, y?, d?, ease?} ],  // 单元素入场
         staggers:[ {sel, at, step?, x?, y?, d?, ease?} ],
         sweeps:  [ {sel, at} ],                    // .hl 酸性扫过(sel 含 R 之后的 .xxx)
         counts:  [ {el, at, from, to, dur?, prefix?, suffix?, decimals?} ],
         blinks:  [ {sel, at, times?} ],
         subs:    [ [id, localStart], ... ],
         custom:  function(tl, R){...}              // 兜底自定义
       }
       约定:所有 sel 都是「R 之后的子选择器」(如 '.h1'),helper 自动拼 R 前缀。
       content 选择器固定 '.content'。 */
    buildSceneTimeline:function(R, spec){
      window.__timelines = window.__timelines || {};
      var tl = gsap.timeline({ paused:true });
      if(spec.grid !== false){
        tl.from(R+'.grid',   { opacity:0, duration:0.5, ease:'power1.out' }, 0.02);
        tl.from(R+'.topbar', { y:-16, opacity:0, duration:0.3, ease:'power2.out' }, 0.2);
      }
      (spec.enters||[]).forEach(function(e){ D2.enter(tl, R+e.sel, e.at, e); });
      (spec.staggers||[]).forEach(function(s){ D2.stagger(tl, R+s.sel, s.at, s); });
      (spec.sweeps||[]).forEach(function(s){ D2.sweep(tl, R, s.sel, s.at); });
      (spec.counts||[]).forEach(function(c){ D2.countUp(tl, R+c.el, c.at, c.from, c.to, c.dur, c); });
      (spec.blinks||[]).forEach(function(b){ D2.blink(tl, R+b.sel, b.at, b.times); });
      if(spec.custom) spec.custom(tl, R);
      if(spec.subs) D2.subs(tl, spec.subs.map(function(s){ return [R+s[0], s[1]]; }));
      D2.breath(tl, R+'.content', spec.duration, spec.breath||'in');
      return tl;
    },

    /* 注册到全局,供 hyperframes 驱动 */
    register:function(id, tl){ window.__timelines = window.__timelines || {}; window.__timelines[id] = tl; }
  };

  window.D2 = D2;
})();
