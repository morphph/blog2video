# Insight Memo: OpenAI Cookbook — Iterative Repair Loops with Codex

## title_zh
Agent 不是改了，是差距变小

## one_sentence_thesis
Iterative Repair Loop 的真正可交付物不是"Agent 又跑了一轮"，而是一个被三相契约（Review/Repair/Validate）严格隔离、并以 validation delta 收敛为唯一成功信号的可终止闭环——绝大多数 Agent 循环失败，不是因为模型不行，而是因为这三件事被混在了一起、且没人定义"什么时候算够"。

## why_this_video_exists
市面上几乎所有"Agent 自循环"内容都在讲"让 Agent 自己反思、自己修复"，把焦点放在"Agent 又做了一次动作"上。这篇 cookbook 提供了两个被普遍忽略的机制级认知：
1. **三相纯度**——Review 阶段禁止编辑、Repair 阶段禁止评估、Validation 阶段禁止修复。这个"互不越位"的约束不是工程洁癖，而是结构化 JSON 在阶段之间能流动的前提。一旦 Review 顺手改一刀，下一轮就拿不到干净的 delta。
2. **delta 收敛才是成功信号**——不是"Agent 做了多少 edit"、不是"跑了几轮"，而是"剩余偏差是否在每轮变小"。这把"Agent 看起来很努力"和"Agent 真的在收敛"区分开了——很多看似在工作的 Agent 实际上在原地踏步，只是没人量过。

观众看完应该带走的不是"哦原来可以让 Agent 自己修文档"，而是"我之前写的所有 Agent 循环，可能根本没有定义什么叫做'更接近完成'"。

## judgment_lines
- "三相不能混——Review 一旦顺手改一刀，整个闭环就塌了" — 来源：原文明确写出 Review Phase "returns structured findings **without editing files**"；Repair 阶段才"applies focused edits"；Validation 阶段只"runs checks and reports remaining issues"。三个动词被刻意隔离，是为了让阶段之间能交换 machine-readable JSON。
- "成功信号是 delta 在变小，不是 Agent 在干活" — 来源：原文 Key Insight 原话——"The important signal is not that Codex made edits. The important signal is that the remaining validation delta gets smaller as the loop runs." 这是从"动作计数"到"差距收敛"的视角翻转。
- "Agent 循环的瓶颈不是循环本身，是停止条件" — 来源：Production Considerations 把"clear stop conditions"列在第一位，并给出三种合法停止：passing validation / max attempts / delta plateauing。绝大多数手搓 Agent loop 缺的不是循环结构，是这三个 OR 之一被显式写出来。
- "结构化 JSON 是契约，不是日志" — 来源：每个阶段都返回 schema 化输出（findings + severity / change summary + paths / execution status + remaining deltas），下一阶段直接消费。这意味着 Repair 不需要"读懂" Review 的散文，它消费的是一份合同。

## evidence_map
- [类型: 具体数字/收敛曲线] 三 notebook 样本 × 三轮迭代：第 1 轮 1 通过 / 2 未过；第 2 轮第二个通过 / 最难的一个范围收窄；第 3 轮全部通过。这是一条干净的单调收敛曲线，不是"突然全好"。
- [类型: 一手引用] "The important signal is not that Codex made edits. The important signal is that the remaining validation delta gets smaller as the loop runs."
- [类型: 结构化契约] 三阶段各自的 schema：Review 输出 findings(issue type, severity)；Repair 输出 change summary + updated artifact paths；Validation 输出 execution status + remaining deltas。
- [类型: 阶段纯度规则] Review "without editing files"；Repair "applies focused edits to copied artifacts"；Validation "runs relevant checks and reports remaining issues"。三个动词刻意单一，禁止越界。
- [类型: 具体停止条件] passing validation / max attempts reached / delta plateauing——三个 OR 中的任意一个触发即终止。
- [类型: 三类验证检查] API Modernization（核对当前模型名和调用模式）、Setup Reproducibility（在干净环境能跑起来）、Artifact Integrity（教学流不被破坏）——后者特别说明 validator 不只看"能跑"，还看"还像不像教程"。
- [类型: 业务规则前置] 在开始 repair 之前必须先定义合同：preferred models / modernization targets / reader experience / self-containment——validator 才有判据。

## non_obvious_points
- **三相纯度不是工程洁癖，是 delta 可测的前提** — 为什么这不显而易见：直觉上，"既然 Review 发现了问题，顺手改了不是更快吗？"但一旦 Review 越权，Validation 阶段就无法拿到一个"未经改动的差距快照"，下一轮的 delta 就不可比较，收敛信号被污染。三相分离的真正理由不是分工，而是测量。
- **Agent 循环最大的失败模式不是逻辑错，是不会停** — 为什么这不显而易见：大多数人把注意力放在"Agent 怎么修得更好"，但实战里把人逼疯的是"它一直在改、看起来在工作、但永远不告诉你够了"。原文把 stop conditions 列在 Production Considerations 第一条，是因为这是最常被忽略的一环；delta plateauing（差距不再缩小）作为合法停止理由，等于承认"打不下去了"也是一种结论。
- **结构化 JSON 把 Agent 之间的协作从"读散文"降到"签合同"** — 为什么这不显而易见：当 Review 输出自然语言报告、Repair 自己去读，整条链就退化成"小作文接龙"，错误会在解释偏差中累积。改成 schema 之后，下游阶段不再"理解"上游，它只是消费一份字段固定的合同——这才是循环能稳定运行多轮的底座。

## tradeoffs_and_limits
- **结构化交换有前置成本** — 具体表现：业务规则、三个 schema、三种停止条件都要在循环开始前显式定义。对一次性任务这个开销不划算；它的回报来自被多轮放大的稳定性。
- **没有停止条件的循环就是无限循环** — 具体表现：原文把 stop conditions 放在生产清单第一位，反过来说就是——没有明确的 pass / max attempts / plateau，这个模式只会让 Agent 烧更多 token 而不会自动停下。
- **Validator 本身可能是错的** — 具体表现：整个闭环假定 Validation 输出可信。如果验证规则本身写错（比如把"应该用 Responses API"写成旧的 Chat Completions），Agent 会朝错误方向收敛，而且因为 delta 在变小，看起来一切正常。这是闭环模式的根本盲点：validator 没有 validator。

## what_to_leave_out

**不该进入的素材：**
- Codex CLI 通过 npm 安装、OpenAI API key 配置、`data/docs/` 文件夹、Python 依赖——纯 setup，跟核心机制无关。
- 三 notebook 样本的具体内容是什么、修了哪一行代码——是 demo 细节，不是机制。
- "Generalization Beyond Documentation" 列出的四类应用场景（regulatory / code modernization / protocol / support）——可以一句话点到"这个模式不止用于文档"，但不要展开成清单，会稀释 thesis。
- Human review checkpoints、audit trails——是生产化补充，不是机制主轴。

**应避免的叙事方向：**
- 不要把视频框成"Codex 又能做新事了"——这是产品叙事，不是机制叙事。
- 不要把核心放在"goal mode / 自主 Agent 是未来"上——5/15 已经发过 Codex /goal 视频（Hayduk），并因为重叠主动跳过了官方 /goal cookbook。这条视频的差异化只在三相契约 + delta 收敛上。
- 不要写成"如何搭建你自己的 repair loop"教程——观众要的是认知翻转（"原来我之前没在测 delta"），不是操作步骤。
- 不要把"convergence in 3 iterations"当成全片唯一记忆点——3 这个数字是样本结果，不是论点；论点是"单调收敛"本身。
- validator 可能错这个点要 acknowledge（在 tradeoffs 段），但不要让它喧宾夺主——那是 Tw93 那条视频的中心，这条视频不重复别人的中心。

## signature_line
判断 Agent 在不在工作，不是看它改了多少，是看下一轮的差距有没有变小——而能这么测量的前提，是 Review、Repair、Validation 三个动作没有互相帮忙。
