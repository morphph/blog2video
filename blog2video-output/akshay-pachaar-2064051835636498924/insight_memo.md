# Insight Memo: Agent Harness 应该自我修复（可观测性只是起点，真正的活在 trace 落屏之后）

> 来源背景：本文为 Comet ML / Opik 赞助内容（作者 Akshay Pachaar，标题「Your Agent Harness Should Repair Itself」）。memo 的重心放在可迁移的工程洞察上——产品名只作为洞察的载体出现，不做功能罗列、不写软广。

## title_zh
你的 Agent 出错后，最难的根本不是查 bug？

## one_sentence_thesis
Agent 可观测性的价值被严重高估了——因为它只回答「发生了什么」，而「为什么坏、怎么改、保证不再坏」这三件最耗人的事全是手工活，真正的瓶颈从来不在 trace 本身，而在 trace 落到你屏幕之后的那段路。

## why_this_video_exists
大多数人把「上了可观测性平台」当成 Agent 工程的终点，本文揭示了一个反直觉的结构性事实：观测只是把问题摆到你面前，调试循环（看 trace → 形成假设 → 手写补丁 → 祈祷没改坏别的 → 新模型来了从头再来一遍）才是真正吞噬工程时间的地方。它进一步给出一个可迁移的工程范式——把「失败的 trace 自动变成回归测试」「用大白话写断言代替数值指标」「在沙箱里测整张 agent 图而不是单次 prompt」——这套自闭合飞轮的思路，观众在普通「Agent 工具测评」里拿不到。

## judgment_lines
- "可观测性不是 Agent 工程的终点，而是工作量的起点" — 来源：平台自动跑完的部分（trace、span、延迟、token 成本）全在虚线左侧；虚线右侧「为什么坏/怎么修/保证不复发」全靠你的时间，而「production debugging 真正住在右侧」。
- "同一个模型，harness 不同结果天差地别——所以瓶颈不在模型能力，在模型周围那层脚手架" — 来源：文中引用 Cursor 公开的工程量，「同一模型上换个更好的 harness，结果好得多，而且这活儿永远干不完」。
- "调试循环之所以反复重开，是因为它没有被『记住』——每个失败修完就丢了，下个模型来了一切归零" — 来源：「新模型 ships 一批新失败模式，你把整个手工循环从头跑一遍」；harness 复杂度的增长比任何团队手工追踪修复的速度都快。
- "把失败 trace 自动沉淀成回归测试，才是让 harness『越用越硬』的真正机制" — 来源：每一个你调试过的失败 trace 自动变成一个新 test case，测试套件从真实生产失败里长出来，而不是有人提前写的合成场景；「每转一圈，harness 更难被打破」。
- "评测该回答的是『改这一处，整张 agent 图会怎样』，而不是『单次 prompt 输出变没变』" — 来源：多数 playground 是 prompt playground，改 system prompt 重跑一次 LLM call，回答了错的问题；生产问题是端到端整图的反应。

## evidence_map
- [对比/清单] 可观测性平台的能力边界被拆成四问：「发生了什么」→ 平台搞定；「为什么发生」→ 手工；「修复方案」→ 手工；「保证不再坏」→ 手工。这是全文最有说服力的结构化证据。
- [一手引用/事实] Cursor 公开过他们在 agent 外层 harness（prompts、tools、checks 包在裸模型外的那层）上投入了多少工程；同一模型换更好 harness 结果好得多，且这活儿永远干不完。
- [具体数字] 开源项目 Opik 在 GitHub 已超 19.3K stars。
- [具体数字/事实] 开箱支持 LangGraph、CrewAI 等 50+ 框架；内置 6 算法的 Agent Optimizer。
- [具体代码场景] Layer 1 只需单个装饰器 `@opik.track` 即可自动埋点每一次 LLM call / tool invocation / retrieval；每条 trace 记录当时生效的 agent 配置，保证之后能用同一失败输入复跑。
- [具体 bug 调试故事] Ollie 的完整修复路径：坏 trace → 定位根因 → 给出 diff → 你批准 → 用「原始失败 trace 里的完全相同输入」复跑 → 流式输出新 trace 做并排对比 → 把原始失败锁成回归用例。可直接被开发者理解的端到端 debug 闭环。
- [具体代码场景] Layer 3 用大白话断言替代数值指标：`suite.add_assertion("The response must include specific deal details, not just a count")`、`add_assertion("The response must never reveal unauthorized information")`，底层转成 LLM-as-a-judge 的 pass/fail。
- [具体对比] 提问示例「why did the final answer ignore the retrieved context?」——Ollie 无需代码访问即可走遍 span tree 给出根因；运行 `opik connect` 后升级为可读源码、定位具体行、提 diff（未经显式批准不改任何东西）的全代码修复模式。
- [事实] 三条命令自托管：`git clone https://github.com/comet-ml/opik` → `cd opik` → `./opik.sh`。
- [机制] 飞轮一圈：`@opik.track` 埋点 → 声明 `opik.Config` → 生产出故障 → Ollie 读 trace 读源码提 fix → 你批准 → 在 Sandbox 用原始失败输入复跑 → 通过 → 存为新 Blueprint → 环境指针晋升到 staging → 原始失败锁成回归测试 → 下一个失败进入同一循环。

## non_obvious_points
- 真正的瓶颈不是「看不见」，而是「看见之后的全部手工活」 — 为什么这不显而易见：行业把钱和注意力都砸在 trace/dashboard 这类「让你看见」的工具上，直觉上以为看清了就解决了大半；但作者指出虚线左侧（自动）和右侧（你的时间）才是真正的分界，价值其实集中在右侧那段没人自动化的路。
- 「失败的 trace 自动变成回归测试」是把一次性调试变成永久资产的关键转折 — 为什么这不显而易见：表面看这只是个测试套件的小功能，实际它改变了整个工作流的数学——测试集从真实生产失败里自动生长（而非提前人工写合成场景），所以系统才会「每转一圈更难被打破」，否则每次修复的知识都随手丢失、下个模型来了归零。
- 用「大白话断言」替代「标注数据集 + 数值指标 + 比浮点数」，是因为后者是研究员的思维方式，不是工程师对质量的思考方式 — 为什么这不显而易见：业界默认 eval 就该是数值化、可量化的「科学」做法，本文反过来指出这套对研究有效、却不匹配工程师判断「这个回答到底行不行」的真实方式。

## tradeoffs_and_limits
- 自动化修复回路里始终保留「人工批准」这一步——它既是安全闸（未经显式批准 Ollie 不改任何代码、不动 git），也意味着这个循环并非全自动、规模化时人是吞吐瓶颈 — 具体表现：「approve」是整条路径里唯一的手动步骤，每个文件读取/编辑都要你逐步批准。
- 关键评判环节依赖 LLM-as-a-judge：大白话断言底层转成 LLM 裁判，等于用一个模型去判另一个模型的输出对错，本身存在可靠性边界（文中未讨论裁判误判/成本） — 具体表现：`add_assertion` 写的是自然语言期望，pass/fail 由 LLM 判定。

## what_to_leave_out
**不该进入的素材：**
- 自托管三条命令、GitHub 链接、19.3K stars、6 算法 Optimizer 的精确清单——属产品落地细节，可一笔带过证明「开源/真实」，但不该占据叙事篇幅（太细节/偏宣传）。
- 「Blueprint」「环境指针晋升到 staging」「Config/Sandbox」等产品内部术语——观众不关心具体命名，只关心背后机制（自动复跑、自动晋升、自动沉淀回归）。
- LangGraph/CrewAI 等具体框架名——除非作为「生态成熟」的一笔证据，否则与核心 thesis 无关。

**应避免的叙事方向：**
- 不要写成 Opik 产品介绍或软广——它是赞助内容，必须诚实点出来源背景，但全片重心是「observability→remediation 的 gap」这个可迁移工程洞察，产品只是这个洞察的一个具体实现样本。
- 不要把全片框架建立在「19.3K stars / 50+ 框架」这类数字上——这些是次要佐证，不是论点。
- 不要当成教程来写（怎么装、怎么用 @opik.track）——观众要的是「为什么调试循环会反复重开、怎样才能让它自闭合」的认知，不是上手步骤。

## signature_line
你的可观测性工具能告诉你 Agent 出了什么事，但「为什么坏、怎么修、保证不再坏」这三件最耗命的活，至今还压在你一个人肩上——真正的瓶颈，从来都在 trace 落屏之后。

## hot_keywords
- Agent Harness — 全文核心概念，标题即「Your Agent Harness Should Repair Itself」，反复出现（prompts/tools/checks 包在裸模型外的那层），是 Hook 的首选锚点。
- Agent / AI Agent — 全文贯穿，生产环境 Agent 调试是整篇的问题场景。
- 可观测性 / Observability — 全文对立面概念，作者全程在论证「观测只是起点不是终点」，与 remediation 形成核心对比。
- LLM-as-a-judge — Layer 3 实质性出现（大白话断言底层转成 LLM 裁判），是可作为锚点的具体机制词。
- Cursor — 作为「harness 工程量很大」的一手论据出现（非核心，但有名气，可做 Hook 第二句的权威背书）。
- 注：Claude Code / MCP / Context Engineering / Codex / Skills / Subagent 等热词在本文均未实质出现，不硬塞。
