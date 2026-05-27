# Insight Memo: OpenAI Codex 25 小时长程任务实验

## title_zh
Codex 单次跑了 25 小时, 没崩

## one_sentence_thesis
Agent 能力的下一个维度不是"更聪明"，而是"能撑多久不崩"——OpenAI 用一次 25 小时 / 3 万行代码 / 1300 万 token 的连续会话证明，单次执行的时间长度本身已经成为模型可以被对比的新指标。

## why_this_video_exists
这条视频提供了一个大多数观众还没意识到的认知转移：**模型能力的对比维度正在从"一次推理多准"转向"连续工作多久不崩"**。OpenAI 给出了一个具体可对照的基准——25 小时单 session，3 万行代码，1300 万 token，最终产出一个 Figma 级别的设计工具。这不是抽象的"agentic 趋势"，是一组可被引用的硬数字。

另外，原文给出的"四文件分工"（Prompt / Plan / Implement / Documentation）比此前我们讲过的任何 markdown 文件分类都更精确——四个文件分别对应"目标 / 路线图 / 操作规程 / 状态日志"，每个文件有不同的反漂移作用。这是新信息，不是 Hayduk 的 PLAN/EXPERIMENTS 三文件方案的重复。

## judgment_lines

- "Agent 不是变聪明了，是能撑得更久了" — 来源：原文明确指出 "agentic coding is increasingly about time horizon, not just one-shot intelligence"，把模型能力的对比维度从 one-shot 推理转向了 time horizon。
- "25 小时单 session 跑通，意味着'单次连续工作时长'第一次成了模型可对标的硬指标" — 来源：单次会话 25 小时 / 30k LOC / 13M token / 产出 Figma 级设计工具，这组数字之前没有任何公开 benchmark 给到过。
- "Prompt.md 不是 prompt，是防止架构漂移的合同" — 来源：原文把 Prompt.md 定位为"establishing the project target and preventing architectural drift"，即用来在 25 小时执行中持续锚定目标，不是用来一次性下指令。
- "Write-and-hope 是长程任务的头号杀手——必须每个里程碑跑一次 lint / typecheck / test / build" — 来源：原文明确点名 "rather than write-and-hope approaches"，并要求每个 milestone 后强制跑四项验证，失败必须先修复再继续。
- "长程任务能稳定，靠的是把状态外置成文件，而不是塞在 context 里" — 来源：原文 "externalizes state across repositories and files"，Documentation.md 持续记录决策和状态，让 agent 不依赖 context 记忆。

## evidence_map

- [具体数字] 单次会话持续 25 小时，无人工干预
- [具体数字] 产出约 30,000 行代码
- [具体数字] 消耗 1300 万 token（13M tokens）
- [具体型号] 使用 GPT-5.3-Codex，reasoning 设为 "Extra High"
- [具体产品] 实际产出一个 Figma 级设计工具，覆盖 canvas 编辑（frames/groups/shapes/text/images/buttons/charts）、实时协作（presence + cursor 同步）、Inspector、图层管理、对齐吸附、history 快照与恢复、timeline replay 带分支、prototype 导航模式、评论线程、JSON / React+Tailwind 导出
- [一手引用] "agentic coding is increasingly about time horizon, not just one-shot intelligence"
- [具体方法] 四文件分工：Prompt.md（规格 + 交付物，防架构漂移） / Plan.md（milestone + 验收条件 + 验证命令） / Implement.md（操作规程，要求 scoped diff + 持续验证） / Documentation.md（状态追踪 + 决策日志）
- [具体方法] 每个 milestone 强制执行四项验证：lint / typecheck / test / build，失败必须先修
- [具体机制] agent loop 七步：plan → code edit → run tools (tests/build/lint) → observe → repair → update docs → repeat
- [一手引用] "rather than write-and-hope approaches"——直接把"写完就提交"命名为反模式
- [一手引用] "externalizes state across repositories and files"——状态外置是长程稳定的关键
- [GPT-5.3-Codex 改进方向] multi-step execution（plan → implement → validate → repair）+ mid-flight steering（不需要重置整次运行就能调整方向）

## non_obvious_points

- **time horizon 是一个可以被独立对标的模型能力维度** — 为什么这不显而易见：行业讨论模型升级，默认对比的是"一次推理多准"或"benchmark 分数多少"。原文把"单次能连续工作多久不漂移"提到了和 intelligence 平级的位置——这意味着以后讨论"GPT-5.3 比 GPT-5.2 强多少"，可能不再问 MMLU 分，而是问"能不能跑满 25 小时"。
- **四文件不是四份文档，是四种反漂移机制** — 为什么这不显而易见：表面看是"用 markdown 给 agent 喂指令"，但每个文件对应的是不同的失败模式：Prompt.md 防"目标漂移"，Plan.md 防"跳过验证赶进度"，Implement.md 防"动作越界改了不该改的"，Documentation.md 防"状态丢失重复工作"。把它们当成一种东西就会失效。
- **Mid-flight steering 这个能力比"更长"更重要** — 为什么这不显而易见：观众听到 25 小时会下意识想"那中间出错怎么办，岂不是整个废了"。但原文提到的关键改进是"mid-flight steering without resetting entire runs"——长程任务真正的护栏不是"一次跑对"，而是"跑错了能就地纠偏不重启"。这才是 25 小时能成立的前提。

## tradeoffs_and_limits

- **成本不可忽略** — 具体表现：1300 万 token 单次会话，按 GPT-5.3-Codex Extra High 的定价，这次实验的 API 成本不是"实验性玩一下"的量级。长程任务的可行性目前仍然带着明显的经济门槛。
- **对前期规格的要求极高** — 具体表现：原文反复强调 "Specifications were provided through structured markdown files rather than a single monolithic prompt"。能跑 25 小时不漂移的前提是上游花了大量功夫写清楚 Prompt.md / Plan.md。如果规格本身模糊，时间越长漂移越严重。
- **这是一次"实验性"会话，不是生产 SOP** — 具体表现：原文措辞是 "experimental"，没有给出失败率、重试次数、或多次跑同样任务的稳定性数据。25 小时是一次成功的样本，不是统计意义上的"现在 Codex 都能跑 25 小时"。

## what_to_leave_out

**不该进入的素材：**
- 设计工具完整功能清单的逐项展开（canvas / inspector / 图层 / history / prototype / 评论 / 导出……）—— 列举完整 feature list 是 OpenAI 的炫技，对观众的认知增量很低。可以提"做了一个 Figma 级的设计工具"作为震撼锚点，但不要展开每个 feature。
- 文末 "Getting Started" 部分推荐的官方文档链接——和 thesis 无关。
- "agent loop 七步循环"的逐步展开——这一点 OpenAI Repair Loop / Improvement Loop 视频已经讲过 agentic loop = 成功公式，再讲一遍是重复。

**应避免的叙事方向：**
- ❌ 不要把全片框架建立在"harness > model"上——这是 Tw93 和 Improvement Loop 已经反复讲过的角度。
- ❌ 不要把 Prompt.md / Plan.md / Implement.md / Documentation.md 讲成"Agent 需要 markdown 文件"——Hayduk 视频已经从 PLAN.md / EXPERIMENTS.md 的角度讲过这个一般性主张。这条视频如果要讲四文件，必须聚焦在"四个文件对应四种不同反漂移机制"这个 OpenAI 独有的更细分类上。
- ❌ 不要把 thesis 写成"Agent 死循环怎么办 / 需要停止条件"——Hayduk /goal 视频的核心。
- ❌ 不要当成 Codex 产品介绍来写——这条视频的价值是从这次实验里抽出"time horizon 是新维度"这个判断，不是给 Codex 打广告。
- ❌ 不要把全片框架只建立在"25 小时"这一个数字上——单数字框架容易让观众觉得"这是噱头"。要用 25h / 30k LOC / 13M token / Figma 级产品这一组数字交叉锚定，再升级到"time horizon = 新能力维度"的判断。

## signature_line

"以前我们问模型有多聪明，现在开始问它能撑多久。"

备选：
- "25 小时不崩，比 SOTA 多 10 分更难。"
- "Agent 的新维度不是 IQ，是续航。"

## hot_keywords

- **Codex** — 全文核心产品，标题即出现
- **GPT-5.3-Codex** — 明确点名的模型版本（"Extra High" reasoning），这是观众想知道"具体什么模型能做到"时的关键锚点
- **Agent Harness** — 原文用 "agent loop" 表述（plan / edit / run / observe / repair / doc / repeat 七步），实质就是 harness 概念，可以在脚本里桥接
- **Long-horizon tasks** — 原文标题词 "Long Horizon Tasks"，是本文最核心的新名词，建议作为 Hook 第二句的关键术语锚点

---

## 自检结果（8 点）

1. ✅ title_zh "Codex 单次跑了 25 小时, 没崩"（13 字，含震撼数字 25 小时 + 反常识"没崩"）
2. ✅ one_sentence_thesis 是判断句——"Agent 能力的下一个维度不是更聪明，而是能撑多久不崩"，有明确立场和翻转
3. ✅ 5 条 judgment_lines 每条都映射到 evidence_map 中具体证据（time-horizon 引用 / 25h 数字组 / Prompt.md 引用 / write-and-hope 引用 / state externalization 引用）
4. ✅ 3 条 non-obvious 都需要读完原文才能意识到：time-horizon 作为对标维度、四文件 = 四种反漂移、mid-flight steering 比"更长"更关键
5. ✅ tradeoffs 给出 3 条：token 成本、对前期规格依赖、单次实验非统计 SOP
6. ✅ evidence_map 含具体数字 5+：25 小时 / 30k LOC / 13M token / 7 步 loop / 4 项验证命令；具体事实充足
7. ✅ what_to_leave_out 同时含"不该进入的素材"（feature list / Getting Started / loop 七步）和"应避免的叙事方向"（避开 harness>model / markdown 一般论 / 死循环 / 产品介绍 / 单数字噱头）
8. ✅ hot_keywords 完成，标注 4 个实质出现的热词：Codex / GPT-5.3-Codex / Agent Harness (via agent loop) / Long-horizon tasks
