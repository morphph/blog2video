# Insight Memo: How modern browsers work

## title_zh
你以为浏览器是一个程序？它其实是几十个进程

## one_sentence_thesis
浏览器之所以被设计成几十个互不信任的沙箱进程、还把同一段 JS 偷偷升级成机器码，不是工程师炫技，而是因为它本质上已经是一个跑在你操作系统之上的迷你操作系统——为了在「执行陌生人代码」这件极度危险的事上既快又安全。

## why_this_video_exists
大多数人（包括很多前端）把浏览器当黑盒：输进 HTML/CSS/JS，吐出页面。这个视频让观众看到黑盒里那些「背着你偷偷做」的动作——为什么打开一个标签页任务管理器里多出五六个进程、为什么某个网页崩了别的标签页还活着、为什么 CSS 动画有的丝滑有的卡成幻灯片、为什么同一段循环跑久了会莫名其妙变快。这些是「原来浏览器在背后干了这件事」的认知，不是 API 文档能给的。

## judgment_lines
- 浏览器不是一个进程，是一群互不信任的沙箱进程——每个网站被单独关进自己的牢房 — 来源：Chrome 一个 browser 主进程 + 每个站点一个 renderer 进程 + GPU 进程 + 网络进程；连页面里跨域的 iframe（如 evil.com）都被强制踢到独立进程（OOPIF）
- 渲染进程默认是「罪犯」，连读你硬盘上一个文件都不被允许 — 来源：renderer 被 OS 级沙箱（Windows job object、Linux seccomp/namespace）锁死，要读文件/开摄像头必须向 browser 进程申请、由它审批
- 这套「把每个网站单独关进进程」的偏执设计，是 2018 年 Spectre 幽灵漏洞逼出来的 — 来源：Spectre 证明恶意 JS 能利用 CPU 推测执行偷读同进程内存（比如你的网银），唯一可靠解法就是干脆不让两个网站共享进程
- 动画卡不卡，取决于你改的是哪个 CSS 属性——改 transform/opacity 几乎免费，改 height/宽度就要全页重排重绘 — 来源：渲染流水线 DOM→样式→布局→绘制→合成；transform/opacity 只动 compositor 线程（GPU），不触发 layout，能在主线程卡死时照样跑 60 帧
- 同一段 JS 跑着跑着会被浏览器「偷偷升级」成机器码，越热的代码越快 — 来源：V8 四级 JIT 分层 Ignition 解释器→Sparkplug→Maglev→TurboFan，被调用上百万次的函数最终被编译成高度优化的机器码

## evidence_map
- [机制+架构] 多进程拆分：一个 Browser 主进程管 UI 和协调，每个标签页/站点一个 Renderer 进程（跑 Blink + V8），外加独立的 GPU 进程、网络进程、工具进程、扩展进程——打开任务管理器（Chrome Shift+Esc）能逐个看到
- [机制] 站点隔离（Site Isolation）+ OOPIF：同一个标签页内，主文档和跨站 iframe 可能由不同进程渲染；一个标签页可能背后跑着 N 个进程，靠 IPC（Chrome 的 Mojo）协同
- [数字] 截至 2024 年，99% 的 Chrome 桌面用户默认开启站点隔离；代价是多用 10–13%（部分场景 10–20%）系统资源
- [事件+因果] Spectre（2018 公开）：恶意 JS 借 CPU 推测执行旁路读取本不该读的内存——直接催生了 Chrome 67 默认开启严格站点隔离，Firefox 也跟进 Project Fission
- [机制] 沙箱执行：renderer「能算能渲染，但碰不到系统」——开文件、开摄像头、开麦克风都被拦，必须经 browser 进程审批（所以麦克风权限弹窗是浏览器 UI 弹的，不是网页弹的）
- [机制+性能] 合成线程独立于主线程：transform/opacity 动画只在 compositor 线程跑，主线程（JS）卡死也能 60 帧丝滑；改 height/background-color 则每帧触发重排或重绘，主线程跟不上就卡（jank）
- [机制] V8 四级 JIT：Ignition 字节码解释器（2016）→ Sparkplug 基线 JIT（2021）→ Maglev 中间层（2023）→ TurboFan 顶级优化编译器；越热的代码爬得越高
- [数字+对比] Maglev 生成代码比 Sparkplug 慢约 20 倍，但比 TurboFan 快 10–100 倍，专门补「温热但没烫到值得 TurboFan」的代码段
- [机制] 去优化（deopt）：JS 是动态类型，V8 在「这个变量一直是整数」的假设下优化；一旦假设被打破（变量突然变字符串），优化代码作废，回退到低优化版本
- [机制] 预加载扫描器（preload scanner）：主 HTML 解析器被 CSS / 同步 JS 卡住时，预扫描器在后台继续偷读后面的 markup，提前并行下载图片/脚本/样式表——全自动、开发者无感
- [机制] `<script>` 默认阻塞解析：遇到脚本必须停下解析、先执行完才继续（因为脚本可能 document.write 改结构），这就是大脚本塞 head 拖慢渲染的原因；async/defer 可解
- [对比] 引擎分化：Firefox 的 Stylo（Rust，多线程并行算 CSS，用满多核）vs Blink/WebKit 单线程算样式；Firefox WebRender 直接在 GPU 上画矢量，Chrome 仍多在 CPU 光栅化再传 GPU

## non_obvious_points
- 浏览器其实是一个「迷你操作系统」——它自己在管理进程、线程、内存、沙箱权限和调度 — 为什么不显而易见：我们日常把浏览器当成一个「应用」，但它内部做的事（进程隔离、权限审批、内存回收、任务调度）正是操作系统的本职工作，它是跑在 OS 之上的第二层 OS
- 浏览器对你打开的每一个网页都默认「不信任」，把它当潜在攻击者关进牢房 — 为什么不显而易见：直觉上网页只是内容；但浏览器把「执行任意陌生人的代码」视为高危行为，渲染进程默认零信任、零系统权限，安全模型是「假设它已经被攻陷，那它也只能在沙箱里折腾」
- 你的 CSS 动画流不流畅，本质是「这帧能不能绕开主线程」的问题，而不是 GPU 强不强 — 为什么不显而易见：大家以为卡顿是机器性能问题，实际是你选的 CSS 属性决定了走「廉价的合成通道」还是「昂贵的重排级联」；同样一个动画，改 transform 和改 top 性能可能差几个数量级

## tradeoffs_and_limits
- 多进程 + 站点隔离的安全是用内存换的：每个 renderer 都加载自己一份 V8 引擎、独立地址空间，进程越多内存开销越大——这正是 Chrome「吃内存」恶名的来源（站点隔离本身就多吃 10–13%）。所以低端设备（如 Android）反而要把网络、UI 等服务合并回少数进程来省开销，Firefox 也用「8 个内容进程的池子」而非每标签页一个进程来折中。
- JIT 的代价是「预热」：刚加载的代码先被解释执行（慢），跑热了才逐级升级成机器码；而且动态类型让 V8 可能猜错类型触发 deopt，代码越「类型不可预测」峰值性能越难维持。

## what_to_leave_out
1. 不该进入视频的素材：
   - 网络加载那一整章（DNS/TLS/HTTP2/HTTP3/Early Hints/Speculation Rules）——太多缩写、太工具化，留预加载扫描器一个钩子足够，其余砍掉
   - 模块加载与 import maps 细节（依赖图拓扑排序、bare specifier 映射、循环依赖）——纯前端工程细节，对非工程师零冲击
   - 引擎逐条对比表（V8 vs SpiderMonkey vs JSC 的 tier 名字、GC 名字、CALayer/WebRender 的逐项罗列）——典型「面试八股」，做成表格观众秒退
   - 开发者工具（DevTools/Web Inspector）、垃圾回收的代际/增量/并发细节、Turboshaft/Turbolev 等内部 IR 重构——太深，超出「聪明非工程师」的认知收益
   - View Transitions API 的浏览器版本号支持情况——纯查表信息
2. 应避免的叙事方向：
   - 不要写成「浏览器的 10 个子系统」目录式罗列——那会变成枯燥的章节朗读，必须做减法、只选最有冲击力的 3 个左右子系统串成一条「浏览器是个迷你 OS」的主线
   - 不要当成前端性能优化八股或面试题讲（「记住 transform 比 top 快」式背诵）——要讲清背后的「为什么」（合成线程绕开主线程），让观众获得心智模型而非口诀
   - 不要堆砌缩写和版本号（HTTP/3、Chrome M117、Firefox 108+）——观众要的是「啊原来如此」的震撼，不是 changelog

## signature_line
你每打开一个网页，浏览器都默认它是个潜在罪犯——单独关进一个进程、剥夺它读硬盘的权利、还要它跑得飞快。浏览器不是一个程序，它是一座监狱。

## hot_keywords
本文是浏览器底层原理，非 AI 话题，**无明显 AI 热词**。但自带强技术钩子，照实标注观众脑内有响声的硬词：浏览器、进程/多进程、沙箱（sandbox）、站点隔离（Site Isolation）、Spectre 幽灵漏洞、V8、JIT、机器码、GPU、渲染/渲染流水线、合成线程（compositor）、重排（reflow/layout）、transform 动画、Chrome/Chromium、Blink、Firefox、Safari。其中「Spectre」「沙箱」「几十个进程」是反直觉冲击点；「迷你操作系统」是可记忆的概括钩子。
