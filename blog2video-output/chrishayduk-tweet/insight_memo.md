# Insight Memo: Using Codex /goal Effectively

## title_zh
让 Codex 自己跑 3 天，靠的不是模型

## one_sentence_thesis
Codex 的 /goal 模式之所以能让 Agent 连续工作几天，关键不是模型能力变强了，而是因为它本质上是一个"动作—打分—判断—继续"的循环，循环能不能跑下去完全取决于你有没有把"何时停"定义清楚。

## why_this_video_exists
大多数关于 Agent 的内容讲的是"模型能做什么"。这篇博客讲的是一个反过来的视角：当你想让 Agent 自己跑几小时甚至几天时，瓶颈不在模型，而在三件事——目标是不是可量化、反馈循环跑得快不快、有没有外部文件给它做"记忆"。作者是 OpenAI 内部做生命科学（蛋白质结构搜索）的 FDE，他给出的例子不是 toy demo，而是真实跑过的科研级 workflow（NeurIPS→ICML 转换、蛋白质结构架构搜索），所以"为什么这样做"这一层有第一手证据。

## judgment_lines

- "Goal 模式的失败模式不是模型不够聪明，而是你没告诉它什么时候算完成" — 来源：模糊目标下模型出现两种相反但同源的故障：要么几分钟就放弃，要么永不停止地乱改
- "把质性目标变成量化目标的办法不是写得更精确，而是把它拆成一份 checklist" — 来源：ICML 200+ 条格式规则被提取成 checklist.md，模型对"单条规则是否完成"的判断能力 > 对"整体目标是否完成"的判断能力
- "Agent 能长跑几天的前提，是你愿意牺牲单次评估的真实性来换取循环速度" — 来源：作者用 NanoFold 小数据集 + 小模型，把单次评估从"几天"压缩到"几分钟"
- "Codex 自带的 compaction 不够用——长任务里 Agent 的连贯性靠的是文件系统，不是上下文窗口" — 来源：作者强制要求模型读写 PLAN.md / EXPERIMENTS.md / EXPERIMENT_NOTES.md 三个外部 markdown 文件
- "EXPERIMENTS.md 比 PLAN.md 重要——因为 Agent 真正需要的不是'下一步做什么'，而是'之前哪些尝试失败了，为什么'" — 来源：作者明确说三个文件中 EXPERIMENTS.md 最重要，用来让人和 Agent 双方都能回看历史尝试

## evidence_map

- [具体事实] /goal 命令已经在 Codex app 中可用，使用方式是 prompt 以 /goal 开头，会触发 Codex 进入"执行—打分—判断—继续/终止"的循环
- [具体 bug 场景] 模糊目标"make my code better"导致两种相反的故障模式：(a) 模型工作几分钟后早早放弃；(b) 模型永不停止，盲目乱改试图满足无法满足的目标
- [对比数据] 好目标 vs 坏目标的精确对照——坏："make my code better"；好："reduce the runtime of the code contained in `specific_file` by 20% without causing any regressions in existing unit tests and integration tests"（明确的量化目标 + 明确的约束）
- [具体数字] ICML 格式规则被提取成 checklist.md，包含 **超过 200 条** 格式和风格规则
- [具体事实] 完成判断的形式是 "I have completed the goal when I have checked off all 200 out of 200 rules" —— Agent 对"单条规则完成与否"的推理能力，强于对"整体目标完成与否"的推理能力
- [工程细节] 作者要求模型在完成每一条时就 check off 该条目，让状态持久化到文件系统，同时方便人类目视监控进度
- [具体数字 + 真实案例] 蛋白质结构架构搜索：用 NanoFold（小但 well-sampled 的数据集）替代完整训练集，单次评估时间从 **天** 级压缩到 **分钟** 级
- [一手引用] "With goal mode, you can get GPT-5.5 to run continuously for multiple days at a time. Even with the great compaction capabilities built into Codex, it is really hard for the model to maintain a coherent thread over such a long timescale."
- [具体机制] 三个 markdown 文件的明确分工：PLAN.md = 高层计划（可由人类预先 seed）；EXPERIMENTS.md = 已完成实验的策展清单（标题 + 简述 + 结果）；EXPERIMENT_NOTES.md = 按时间顺序的草稿/思考流，用于审计 Agent 的思路
- [真实截图] EXPERIMENTS.md 的真实条目 E15：从 step 6000 的 checkpoint 续训到 9000，simplex_aux_weight 从 1.0 ramp 到 0.5，决策规则明确写出（"keep if it improves E12 best val_lddt_ca=0.3472 or improves final lDDT"），结果 val_lddt_ca=0.3556 at step 9000，被标记为新基线 —— 显示真实科研级实验记录的颗粒度
- [真实截图] ICML checklist 的真实条目：PDF only、main body 限 8 页（不含 reference/appendix）、final 版可多 1 页、文件 ≤ 10 MB、仅 Type-1 字体、避免 Type-3、US letter 等，每条都标注了原 LaTeX 文件中的行号范围

## non_obvious_points

- **"模型在'整体目标是否达成'上的判断力，比在'单条规则是否达成'上的判断力差得多"** — 为什么这不显而易见：直觉会认为"目标越大、越抽象，模型越擅长"，因为大模型常被描绘成全局理解者；但作者发现现实正相反——把一个大目标拆成 200 条 checklist，每条单独再模糊，整体判断质量反而暴涨。这暗示 Agent 的瓶颈是"终止判断"而非"内容生成"。
- **"反馈循环的速度比反馈的真实性更重要（在一定阈值内）"** — 为什么这不显而易见：科研直觉会反对——"你用小模型小数据集做出来的结论，怎么能迁移到 production？"作者的回应是：在架构搜索这个特定阶段，方向性信号已经足够，循环速度的回报远大于评估保真度损失。这是一种工程上的"故意降保真"。
- **"Compaction（上下文压缩）不是长任务的解，文件系统才是"** — 为什么这不显而易见：Codex 自己内置的 compaction 被广泛宣传为长上下文方案，但作者直接说"即使有 great compaction，几天的任务里模型也维持不了 coherence"。真正能让 Agent 跑几天的，是把状态外置到 markdown 文件里——这是把 Agent 的"记忆"从模型内部搬到文件系统的架构选择。

## tradeoffs_and_limits

- **量化目标的设定本身是有成本的** — 具体表现：把 NeurIPS 论文转 ICML 格式这种"看似简单"的任务，作者要先让 Codex 把 ICML 的 LaTeX 规则文件预处理成 200+ 条 checklist。也就是说，/goal 不是"输入一句指令就跑"，而是"为了让它能跑几天，你要先花时间把判定标准物化下来"。前期投入换长尾自动化。
- **降保真反馈循环有适用边界** — 具体表现：作者用 NanoFold 做架构搜索 OK，但这隐含假设是"小数据集上有效的架构方向，能迁移到大数据集"。当这个假设不成立时（例如某些 scaling-sensitive 的优化），快速循环反而会引导 Agent 走向错误方向。文章没明说这一点，但这是这种方法论的隐含风险。
- **PLAN/EXPERIMENTS/NOTES 三件套是工作流外置，不是模型升级** — 具体表现：它要求使用者去定义文件结构、写明每个文件的语义边界、并在 prompt 里强制 Agent 遵守。这不是模型自带能力，是使用者自己搭的脚手架。换言之，今天用 /goal 跑长任务的人，本质上是在用 prompt 编排一个简单的工作记忆系统。

## what_to_leave_out

**不该进入视频的素材：**
- ICML checklist 截图中的具体条目（PDF only、8 页限制、Type-1 字体等）—— 太细节，对非学术读者无意义，只需要保留"200+ 条"这个数字本身
- EXPERIMENTS.md 截图里的具体数值（val_lddt_ca=0.3556、step 9000 等）—— 太专业，对非 ML 读者是噪声；可以用"真实科研级实验记录"这种概括方式带过
- "Models have gotten so good over the past ~6 months that many of us have gotten lazy as prompters" 这种感慨型铺垫——和核心机制无关
- 结尾的 "Now go run some loops!" 这种行动召唤——不符合中文技术内容的语感

**应避免的叙事方向：**
- 不要把视频框架建立在"/goal 是新功能"上——它是入口，不是论点。重点是"为什么这三件事决定它能不能跑"。
- 不要写成"Codex 使用教程"——这篇文章本身不是 step-by-step 操作指南，是经验提炼。视频应该保留"提炼"的密度，而不是降级成 how-to。
- 不要把"checklist"讲成"prompt 工程小技巧"——这会矮化它。它的本质是"把判定权从模型搬到外部，让循环可以闭合"，是认知架构选择。
- 不要平均用力讲三件事——它们重要性不同，作者明确说 EXPERIMENTS.md 比 PLAN.md 重要。视频应该保留这种不均衡的判断。
- 不要使用"AI 的下一个浪潮"、"Agent 革命"这类宏大叙事——文章本身非常工程化、克制，视频也应保持这种克制感。

## signature_line
Agent 能跑几天，不是因为模型记得住，而是因为你让它把记忆写在硬盘上。
