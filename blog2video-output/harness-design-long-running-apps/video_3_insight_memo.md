# Insight Memo: Video 3 — 新模型一出，你的Agent架构该砍哪些？

## one_sentence_thesis
Agent系统里每个组件都是对当前模型能力不足的补偿假设——模型一升级，这些假设就可能过期，不主动验证和精简的人，会被自己搭建的复杂度拖死。

## audience_problem
他们以为Agent架构搭好了就是资产，模型越强只需要往上加更多组件就行；但实际上，模型能力一跃升，昨天的核心架构组件今天可能变成纯粹的性能累赘——不是"加了没用"，而是"加了反而更慢更贵"。

## why_this_video_exists
这条视频提供了一个来自Anthropic内部的真实案例：他们自己花几周搭建的Sprint分解机制，在Opus 4.6发布后被证明完全多余。更关键的是，他们第一次尝试激进砍组件直接失败了——这个"怎么砍"的方法论（一次只移除一个，逐个验证），以及"什么时候该砍什么时候该留"的判断框架（评估器是否必要取决于任务是否超出模型原生能力边界），是外部开发者几乎拿不到的一手经验。

## what_this_video_is_not
- 本视频不会讲三Agent架构的具体搭建方法（Video 2已详细覆盖，这里只引用结论）
- 本视频不会讲前端设计评估和GAN灵感的细节（Video 1的主题，与本视频迭代哲学无关）
- 本视频不会讲DAW应用的功能展示或音乐制作效果（那是产品demo，不是架构迭代的洞察）

## judgment_lines
- "你的Agent架构不是资产，是一组待验证的假设清单" — 来源：原文明确指出"every component in a harness encodes an assumption about what the model can't do on its own, and those assumptions are worth stress testing"，Sprint分解就是一个被证伪的假设
- "先激进砍全部，是最符合直觉但最错误的精简方式" — 来源：作者第一次尝试radical simplification直接失败，而且"it also became difficult to tell which pieces of the harness design were actually load-bearing"，改为一次移除一个组件后才成功
- "评估器该不该留，取决于任务在模型能力边界的哪一侧" — 来源：Opus 4.5时评估器在每个Sprint都抓到真实问题，Opus 4.6时模型原生能力外移，简单任务不再需要评估器，但"for the parts of the build that were still at the edge of the generator's capabilities, the evaluator continued to give real lift"
- "Harness的设计空间在移动，不是在缩小" — 来源：原文结论"the space of interesting harness combinations doesn't shrink as models improve. Instead, it moves"，旧组件拆掉的同时新组件（如AI feature building prompting）被加入
- "成本下降38%不是因为做少了，是因为不再为模型已经会的事付管理税" — 来源：200美元降到124美元，Sprint分解和每轮QA的协调开销被砍掉，但最终产出（DAW应用）复杂度不低于之前的游戏编辑器

## evidence_map
- [具体数字] Opus 4.5三Agent Harness：6小时、200美元；Opus 4.6简化Harness：3小时50分钟、124.70美元——成本降低38%
- [具体数字] DAW应用构建者（Build Round 1）连续编程2小时7分钟，无需Sprint分解中断
- [具体数字] DAW应用详细成本拆分：Planner 4.7分钟/$0.46，Build第一轮2小时7分钟/$71.08，QA第一轮8.8分钟/$3.24，Build第二轮1小时2分钟/$36.89，QA第二轮6.8分钟/$3.09，Build第三轮10.9分钟/$5.88，QA第三轮9.6分钟/$4.06
- [具体事实] Opus 4.5存在严重的"上下文焦虑"（context anxiety）：接近上下文窗口极限时会提前收尾，compaction不够，必须用context resets；Opus 4.6从官方发布说明就指出改善了长上下文处理能力
- [具体事实] 第一次尝试激进精简（radically cut back + creative new ideas）直接失败，无法复现原始性能，且无法判断哪些组件是load-bearing的
- [具体事实] 砍掉Sprint后，评估器从每Sprint一轮QA变为最后统一QA，但在DAW项目中仍然跑了3轮Build+QA循环，说明评估器在复杂任务上仍有价值
- [一手引用] QA Agent第一轮反馈："several core DAW features are display-only without interactive depth: clips can't be dragged/moved on the timeline, there are no instrument UI panels (synth knobs, drum pads), and no visual effect editors"——证明即使Opus 4.6，复杂任务中评估器仍能抓到generator遗漏的功能缺口
- [具体事实] 简化过程中同时添加了新组件：针对AI feature building的prompting tuning，让generator能正确构建app内置的AI agent工具调用

## non_obvious_points
- "砍组件的正确方法不是做减法，是做实验" — 为什么这不显而易见：直觉上精简就是"去掉不需要的"，但作者的经验表明，你在移除之前无法判断一个组件是否load-bearing。一次砍多个会导致无法归因失败原因。这本质上是一个科学实验的控制变量问题，但大多数工程师不会用实验思维来对待架构精简。
- "模型升级后，最先该砍的往往是你最引以为豪的设计" — 为什么这不显而易见：Sprint分解机制是原始Harness的核心架构创新，是解决context anxiety的关键设计。直觉上核心组件最不该被砍。但恰恰是模型能力提升最直接消除的那个假设（模型不能长时间保持连贯），导致核心组件最先变得多余。
- "评估器的价值不是固定的——同一个评估器在不同任务上可以同时是'必要的'和'多余的'" — 为什么这不显而易见：大多数人把"要不要评估器"当成一个二元决策，但原文揭示它是一个随任务难度和模型能力边界动态变化的连续判断。DAW项目中，简单功能不需要评估器，但"clips can't be dragged"这类复杂交互问题仍然被评估器捕获。

## tradeoffs_and_limits
- [精简有下限，不是越简单越好] — 具体表现：作者尝试激进精简后发现无法复现原始性能。Planner不能砍（没有Planner时generator会under-scope，产出的应用功能更少）。评估器在复杂任务上仍然必要。精简的目标不是最小化组件数，而是让每个保留的组件都对应一个仍然成立的假设。
- [逐个验证精简的方法成本很高] — 具体表现：每次移除一个组件都需要完整跑一次harness来验证效果（每次运行数小时、上百美元），对于资源有限的团队，这种实验式精简本身就是一项重大投入。
- [模型升级带来的收益不均匀] — 具体表现：DAW应用中QA仍然跑了3轮，说明即使Opus 4.6在长任务连贯性上有质的飞跃，在功能完备性（不stub features、不遗漏交互细节）上仍有明显不足。不同能力维度的提升速度不同，不能假设一次升级解决所有问题。

## what_to_leave_out
- 前端设计评估的四个维度和荷兰美术馆案例（Video 1内容，与本视频Harness迭代主题无关）
- 三Agent架构的具体搭建细节（Planner/Generator/Evaluator的prompt设计、Sprint合约谈判机制）（Video 2已覆盖，本视频只需引用"之前有Sprint制"作为对比起点）
- Retro Game Maker的功能对比和截图细节（Video 2的素材，本视频只需引用"200美元版本"作为成本基线）
- DAW应用的音乐制作功能展示（属于产品demo，观众不关心DAW做出来的歌好不好听，关心的是架构精简的方法论）
- Appendix中Planner生成的完整spec示例（太细节，与迭代哲学无关）

## memorable_examples
- "Sprint分解一夜变废" — Opus 4.5时必须把任务拆成Sprint才能保持连贯，精心设计的Sprint合约谈判机制是核心架构。换成Opus 4.6后，构建Agent连续编程2小时7分钟完全不需要Sprint分解。你花几周设计的核心机制，一次模型升级就变成了多余的管理税。 — 适合用在：视频开头hook后的第一个冲击点，用来建立"每个组件都是假设"的核心论点
- "先激进砍全部然后翻车" — 作者第一反应也是大刀阔斧精简，结果直接失败，而且搞不清哪些组件才是真正有用的。改为一次只拆一个组件、跑完整测试对比效果后，才找到了正确的精简路径。 — 适合用在：中间段讲"怎么砍"的方法论，用翻车故事建立可信度，然后引出控制变量的正确做法
- "QA说你的DAW核心功能都是假的" — Opus 4.6构建者连续编程2小时造出的DAW看着很炫，但评估器一测：timeline上的clip不能拖动、没有合成器旋钮、没有EQ曲线——"These aren't edge cases, they're the core interactions that make a DAW usable"。证明即使模型进步了，评估器在复杂任务上仍然不能砍。 — 适合用在：讲完"该砍的砍"之后的转折——"但不是什么都能砍"，用来平衡观点，避免观众走向"模型越强Agent越没用"的极端

## slide_spine
- **Slide 1 (cover)**: "新模型一出，你的Agent架构该砍哪些？" — 口播方向：你花几周精心搭建的Agent系统，新模型一发布可能有一半组件是多余的。Anthropic自己就干了这事——Opus 4.6出来后，直接砍掉了他们的核心架构组件。
- **Slide 2 (principle)**: "每个组件都是一个能力假设" — 口播方向：讲Sprint分解为什么存在（补偿Opus 4.5的上下文焦虑），为什么Opus 4.6出来后这个假设不再成立（连续编程2小时7分钟），引出核心原则：你的架构不是资产，是一组待验证的假设清单。
- **Slide 3 (comparison_cards)**: "精简前 vs 精简后" — 口播方向：用数据对比——Sprint制+每轮QA的6小时200美元 vs 单次构建+最后QA的3小时50分124美元。展示DAW应用的详细成本拆分，让观众看到"管理税"消失后的效率提升。
- **Slide 4 (checklist)**: "怎么砍：系统性精简四步法" — 口播方向：先讲激进砍全部失败的教训，再讲正确方法：列出每个组件对应的假设、一次只移除一个、完整测试验证、不变差就砍掉。强调这是做实验不是做减法。
- **Slide 5 (principle)**: "设计空间在移动，不是在缩小" — 口播方向：评估器在简单任务上可以砍，在复杂任务上仍然必要（QA抓到的DAW功能缺口）。同时新组件被加入（AI feature prompting）。结论：不是"模型越强Agent越没用"，而是旧脚手架拆了，新的更高的楼需要新脚手架。
- **Slide 6 (summary)**: 压缩结论 + 行动指南 — 口播方向：回扣核心——今天需要的脚手架，明天可能变成瓶颈。给出具体行动：列出你系统中每个组件，写上它补偿了模型的什么不足，下次模型升级时逐个测试。

## ending_action
打开你正在用的Agent系统，列出所有自定义组件（任务分解、上下文管理、QA循环等），在每个旁边写上一句话："它补偿了模型的____不足"。下次你用的模型发布新版本时，从这个清单开始，逐个关闭测试。

## signature_line
今天的核心架构，可能是明天的管理税——每次模型升级，都该拿你的Agent系统开一次刀。
