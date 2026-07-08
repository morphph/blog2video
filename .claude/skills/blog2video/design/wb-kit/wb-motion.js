/* ============================================================================
   wb-motion.js —— GSAP 镜头/揭示助手(白板讲解线,全片统一性格:镜头从容、揭示克制)
   内联进每个场景的 script 块(GSAP 3.14 先于本段加载)。全局命名空间 window.WB。
   只动 transform / opacity / clip-path。禁:弹性 ease、repeat:-1、Date.now/Math.random。
   timeline 同步构建(hyperframes 逐帧 seek,一切必须是时间的纯函数)。

   坐标约定:一切 bbox = steps.json 的 [x,y,w,h](viewBox 单位)。
   .canvas 按 SS 倍 viewBox 尺寸布局(supersample 防 <img> 放大糊),SS 从
   canvas 元素 data-ss 读(默认 2)——场景作者只用原始 bbox 思考,不碰 SS。
   ============================================================================ */
(function(){
  var STAGE_W = 1920, STAGE_H = 1080;

  function canvasEl(R){ return document.querySelector(R + '.canvas'); }
  function ssOf(R){ var el = canvasEl(R); return el ? (parseFloat(el.getAttribute('data-ss')) || 2) : 2; }

  var WB = {
    /* 纯计算:把 bbox([x,y,w,h],viewBox 单位)取景到舞台中央。
       opts:{pad(=80 屏幕px), maxScale(=1,css scale 上限——1 即"永不上采样"),
             safeBottom(=200 屏幕px,给字幕带留的底部安全区;取景在 1920×(1080-safeBottom) 内居中,
                        目标内容永不被字幕遮挡。整片无字幕的场景可显式传 0)}
       返回 {scale,x,y}(直接喂给 gsap 的 transform)。 */
    fit: function(R, bbox, opts){
      opts = opts || {};
      var ss = ssOf(R);
      var pad = (opts.pad != null) ? opts.pad : 80;
      var safeH = STAGE_H - ((opts.safeBottom != null) ? opts.safeBottom : 200);
      var bx = bbox[0]*ss, by = bbox[1]*ss, bw = bbox[2]*ss, bh = bbox[3]*ss;
      var s = Math.min((STAGE_W - 2*pad)/bw, (safeH - 2*pad)/bh);
      s = Math.min(s, (opts.maxScale != null) ? opts.maxScale : 1);
      return { scale: s,
               x: (STAGE_W - bw*s)/2 - bx*s,
               y: (safeH - bh*s)/2 - by*s };
    },

    /* 镜头移动:平移/缩放 .canvas 到 bbox。1.2–1.8s power2.inOut,像人推画布。
       opts:{d(=1.4), ease(='power2.inOut'), pad, maxScale} */
    camera: function(tl, R, bbox, at, opts){
      opts = opts || {};
      var v = WB.fit(R, bbox, opts);
      tl.to(R+'.canvas', { scale:v.scale, x:v.x, y:v.y,
        duration:(opts.d != null) ? opts.d : 1.4, ease:opts.ease || 'power2.inOut' }, at);
      return tl;
    },

    /* 镜头定位(无动画,仅场景开头定起点用) */
    setCamera: function(tl, R, bbox, at, opts){
      var v = WB.fit(R, bbox, opts);
      tl.set(R+'.canvas', { scale:v.scale, x:v.x, y:v.y }, at || 0);
      return tl;
    },

    /* 缩回全景(recap 段)。bbox 取 steps.json canvas.bbox;不传则量整个 .canvas。 */
    home: function(tl, R, at, opts){
      opts = opts || {};
      var bbox = opts.bbox;
      if(!bbox){
        var el = canvasEl(R), ss = ssOf(R);
        bbox = [0, 0, el.offsetWidth/ss, el.offsetHeight/ss];
      }
      return WB.camera(tl, R, bbox, at, Object.assign({ d:(opts.d != null) ? opts.d : 1.8 }, opts));
    },

    /* 揭示一层。mode:
       'draw'(默认) clip-path 左→右擦出 0.8s,像正在画;
       'pop'  0.35s 轻弹入(结论/强调块);
       'fade' 0.5s 淡入(底图/氛围层)。
       opts:{d, mode} */
    revealLayer: function(tl, sel, at, opts){
      opts = opts || {};
      var mode = opts.mode || 'draw';
      if(mode === 'draw'){
        tl.set(sel, { opacity:1, clipPath:'inset(0% 100% 0% 0%)' }, at);
        tl.to(sel, { clipPath:'inset(0% 0% 0% 0%)', duration:opts.d || 0.8, ease:'power2.inOut' }, at);
      } else if(mode === 'pop'){
        tl.fromTo(sel, { opacity:0, scale:0.965 },
          { opacity:1, scale:1, duration:opts.d || 0.35, ease:'power3.out' }, at);
      } else {
        tl.fromTo(sel, { opacity:0 }, { opacity:1, duration:opts.d || 0.5, ease:'power1.out' }, at);
      }
      return tl;
    },

    /* 场景起始已显层(承接上一场景的进度):t=0 直接置显。sels = 选择器数组。 */
    preset: function(tl, sels, at){
      sels.forEach(function(sel){ tl.set(sel, { opacity:1 }, at || 0); });
      return tl;
    },

    /* 长驻镜头微呼吸(防死帧):≤1.02 的极缓漂移,dur = 停留时长。
       作用在 .viewport(镜头动 .canvas、呼吸动 .viewport,互不冲突)。
       dir:'in'(1→1.015)/'out'(1.015→1)。 */
    breath: function(tl, R, at, dur, dir){
      if(dir === 'out') tl.fromTo(R+'.viewport', { scale:1.015 }, { scale:1, duration:dur, ease:'none' }, at);
      else              tl.fromTo(R+'.viewport', { scale:1 }, { scale:1.015, duration:dur, ease:'none' }, at);
      return tl;
    },

    /* 字幕淡入:list = [[id, localStart], ...](0.2s,与 d2 同约定) */
    subs: function(tl, list){
      list.forEach(function(s){ tl.from(s[0], { opacity:0, duration:0.2, ease:'power1.out' }, s[1]); });
      return tl;
    },

    /* ---- 高阶约定:声明式建整条 timeline ----
       spec = {
         duration: 场景全长(=data-duration,尾帧对齐用),
         start:   bbox | null,                    // 开场镜头定位(setCamera)
         preset:  ['#ly1', ...],                  // 起始已显层
         reveals: [ {sel, at, mode?, d?} ],
         shots:   [ {bbox, at, d?, ease?, pad?} | {home:true, at, d?} ],
         subs:    [ [id, localStart], ... ],
         custom:  function(tl, R){...}
       }
       sel/id 均为完整选择器(R 已知时也可只写 '#lyN',层 id 全片唯一)。 */
    buildSceneTimeline: function(R, spec){
      var tl = gsap.timeline({ paused:true });
      if(spec.start) WB.setCamera(tl, R, spec.start, 0, spec);
      if(spec.preset) WB.preset(tl, spec.preset, 0);
      (spec.reveals||[]).forEach(function(r){ WB.revealLayer(tl, r.sel, r.at, r); });
      (spec.shots||[]).forEach(function(s){
        if(s.home) WB.home(tl, R, s.at, s);
        else WB.camera(tl, R, s.bbox, s.at, s);
      });
      if(spec.custom) spec.custom(tl, R);
      if(spec.subs) WB.subs(tl, spec.subs);
      /* 尾帧对齐:确保 timeline 总长 = 场景声明时长(hyperframes 按 data-duration 渲) */
      if(spec.duration) tl.set({}, {}, spec.duration);
      return tl;
    },

    /* 注册到全局,供 hyperframes 驱动 */
    register: function(id, tl){ window.__timelines = window.__timelines || {}; window.__timelines[id] = tl; }
  };

  window.WB = WB;
})();
