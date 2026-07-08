
/* ---- scene timeline(bbox 逐字来自 assets/golden/founder-mode/steps.json)---- */
(function(){
  var R = "[data-composition-id='wb01'] ";
  var tl = WB.buildSceneTimeline(R, {
    duration: 20,
    start: [110, 40, 940, 176],                                   /* step1 bbox:标题区定点开机 */
    reveals: [
      { sel:'#ly1', at:0.4,  mode:'draw', d:1.0 },                /* 缘起:传统智慧是错的 */
      { sel:'#ly2', at:5.2,  mode:'draw', d:0.9 },                /* 诊断:那是「经理模式」 */
      { sel:'#ly3', at:10.4, mode:'draw', d:1.1 }                 /* 两种模式分岔 */
    ],
    shots: [
      { bbox:[110, 40, 940, 318],  at:4.0,  d:1.4, pad:120 },     /* cumulative step1-2 */
      { bbox:[150, 358, 1050, 570], at:8.8, d:1.6, pad:90 },      /* step3 分岔区 */
      { bbox:[110, 40, 1090, 888], at:14.2, d:1.8, pad:70 }       /* 拉远:目前画到哪了 */
    ],
    subs: [ ['#sub-1',0], ['#sub-2',4.2], ['#sub-3',8.8], ['#sub-4',14.0] ],
    custom: function(t, r){ WB.breath(t, r, 16.2, 3.8, 'in'); }   /* 静止尾段防死帧 */
  });
  WB.register('wb01', tl);
})();
