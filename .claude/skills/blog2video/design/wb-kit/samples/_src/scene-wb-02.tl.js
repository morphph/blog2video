
/* ---- scene timeline(bbox 逐字来自 assets/golden/founder-mode/steps.json)---- */
(function(){
  var R = "[data-composition-id='wb02'] ";
  var tl = WB.buildSceneTimeline(R, {
    duration: 26,
    start: [150, 358, 1050, 570],                                  /* 承接:镜头停在分岔区 */
    preset: ['#ly1', '#ly2', '#ly3'],                              /* 上一场景已画的层 */
    reveals: [
      { sel:'#ly4', at:2.4,  mode:'draw', d:1.2 },                 /* manager mode:黑箱→翻车(12 元素,擦长一点) */
      { sel:'#ly5', at:10.3, mode:'draw', d:1.1 },                 /* founder mode:打破封装 */
      { sel:'#ly6', at:15.9, mode:'pop' },                         /* 结论块:更复杂 but 更好用 */
      { sel:'#ly7', at:20.8, mode:'pop' }                          /* punchline:像 Jobs,而非 Sculley */
    ],
    shots: [
      { bbox:[110, 448, 370, 402], at:0.8,  d:1.5, pad:110 },      /* step4 左侧深挖 */
      { bbox:[720, 448, 400, 298], at:8.6,  d:1.6, pad:110 },      /* step5 右侧深挖 */
      { bbox:[715, 448, 415, 382], at:14.6, d:1.2, pad:100 },      /* step5+6 合景 */
      { home:true, bbox:[30, -40, 1250, 1090], at:18.6, d:2.0, pad:60 }  /* recap:canvas.bbox 全景 */
    ],
    subs: [ ['#sub-1',0], ['#sub-2',2.4], ['#sub-3',8.6], ['#sub-4',14.6], ['#sub-5',18.6], ['#sub-6',22.0] ],
    custom: function(t, r){ WB.breath(t, r, 21.4, 4.6, 'in'); }
  });
  WB.register('wb02', tl);
})();
