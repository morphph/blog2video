# Insight Memo: Dynamic Workflows in Claude Code

## title_zh
Claude 现在自己写 Harness——每个任务一份

## one_sentence_thesis
Claude Code 的"harness"过去是 Anthropic 工程师写好的固定脚手架，dynamic workflows 之后它变成了一份运行时 JavaScript 文件——Claude 自己在每个任务开始之前临时拼一个只属于这个任务的工作流出来，因为单一上下文窗口跑长任务一定会"懒、偏袒自己、跑题"，没法靠 prompt 救。

## why_this_video_exists
过去四期 Harness 视频（Tw93、Improvement Loop、Addy、Mike Piccolo）都把"harness"讲成一个静态的、被工程师设计好的东西——讨论的是它由哪些零件组成、谁来组装、怎么换零件。Thariq 这篇是 Anthropic 官方第一次把 harness 这个概念从"engineer-time artifact"推到"runtime artifact"：harness 本身变成 LLM 输出的产物，每个 prompt 都可能伴生一份临时 harness。观众如果只看过前四期会以为 harness 的设计空间已经讲完了，这一期是补上"还有一层"。

## judgment_lines
- "Harness 不再是工程师写的，是 Claude 自己写的" — 来源：dynamic workflows 是 Claude Code 用 ultracode/workflow 触发词时由 Claude 生成的 JS 文件，里面调用 spawn subagent / 选模型 / 选 worktree 这些原语
- "单一上下文窗口跑长任务，必然会出现 3 种系统性失败，不是 prompt 写得好就能救" — 来源：Anthropic 明确命名 agentic laziness（50 项任务做 20 项就声称完成）、self-preferential bias（让自己验证自己）、goal drift（compaction 之后 don't-do-X 约束丢失）
- "Static workflow 必须照顾所有 edge case，所以它一定是平均水平的 harness；dynamic 才能针对单一任务定制" — 来源：Thariq 把 Claude Agent SDK / claude -p 写的静态 workflow 直接判定为"一定更通用"，Opus 4.8 智能度让 per-task 定制变成可行选项
- "Bun 从 Zig 改写到 Rust 是 dynamic workflow 干的，不是工程师手写脚本干的" — 来源：原文明确提到 Bun 重写靠 workflows，Jarred 有 X 线程
- "Workflow 用更多 token 是代价，不是 bug——你换来的是从根本上绕过单窗口的失败模式" — 来源：Thariq 自己在开篇就警告 dynamic workflows often use more tokens

## evidence_map
- [具体事实] Bun 用 dynamic workflows 从 Zig 重写成了 Rust（Jarred Sumner X 线程为证）
- [具体失败模式 / 命名概念] Agentic laziness — Claude 做完 50 项 security review 里的 20 项就声称完成
- [具体失败模式 / 命名概念] Self-preferential bias — Claude 倾向于偏爱自己生成的结果，尤其在让它对自己打分的时候
- [具体失败模式 / 命名概念] Goal drift — 长对话经过 compaction 之后，"don't do X" 这类边界约束最先丢
- [具体机制] 6 种 workflow pattern 命名清单：classify-and-act / fan-out-and-synthesize / adversarial verification / generate-and-filter / tournament / loop-until-done
- [具体机制] Workflow JS 文件可决定每个 subagent 跑哪个模型（Sonnet 还是 Opus）、跑在哪个 worktree、是否隔离
- [具体机制] 中断之后 resume session 可以从断点续跑
- [具体触发] 触发词 "ultracode" 强制 Claude Code 创建 workflow
- [具体使用] Anthropic 自己的 /deep-research skill 就是用 dynamic workflows 实现的：fan-out web search → 抓源 → adversarial verify → cited report
- [具体使用] Anthropic 自己用 dynamic workflow 做的另外几个产品：Research、security analysis、agent teams、Code Review
- [具体反直觉] 排序 1000+ 行不要一次塞 prompt，而是 pairwise-comparison tournament（比较判断比绝对打分更可靠）
- [具体安全模式] Triage workflow 的 quarantine 模式：读不可信内容的 agent 不允许做高权限操作
- [具体保存路径] `~/.claude/workflows` 目录；或通过 skill 分发（把 JS 放进 skill 文件夹，在 SKILL.MD 里引用）
- [具体配额机制] Token budget 可以 prompt 限定，比如 "use 10k tokens"
- [具体协同] /loop 用于周期性跑；/goal 用于硬性完成要求
- [作者身份] Thariq Shihipar + Sid Bidasaria 都是 Anthropic Claude Code 的 MTS

## non_obvious_points
- "Static workflow 一定更通用 = 一定更平均" — 为什么这不显而易见：人们听到"static workflow"会觉得它是"专门写好的"所以会很专业，但 Thariq 反过来说，正因为它要被复用，它必须照顾所有 edge case，反而成为平均水平；dynamic workflow 因为只为这一个 prompt 服务，可以放弃通用性换深度。这是反直觉的"专用 vs 通用"翻转。
- "三个失败模式不是模型变笨，是单窗口结构本身的产物" — 为什么这不显而易见：agentic laziness、self-preferential bias、goal drift 听起来像是模型能力问题，但 Anthropic 把它们归因到"plan 和 execute 共用一个 context window"这个架构选择上——多 agent / 多 context window 是结构性解药，不是 prompt 调优能搞定的。
- "Workflow 是把 harness 的设计权从工程师转给 LLM" — 为什么这不显而易见：过去几年所有 harness 讨论都默认 harness 是工程师的设计产物（Mike Piccolo 的 workers / Addy 的 ratchet / Tw93 的 12 模块），dynamic workflows 是第一次把 harness 本身变成 LLM 的 output。harness 进入了被 LLM 编写的范畴，这是定义层面的迁移。

## tradeoffs_and_limits
- [代价：Token 消耗显著上涨] Thariq 在文章开头和"When not to use"两处都警告——dynamic workflow 比单 agent 跑同一任务用更多 token，不是每个任务都值得。"大多数常规编码任务不需要 5 个 reviewer 组成的 panel"。
- [适用边界：不是所有任务都该用] 文章自己说 workflows 是新东西，最佳实践还在演化。对普通编码任务，开 workflow 是 over-engineering。

## what_to_leave_out
**不该进入的素材：**
- 8 个 example prompt 的逐条枚举（讲 2-3 个最有代表性的即可，不要播报式念列表）
- /loop 和 /goal 的具体配合细节（视频里点一下就够，不必展开）
- "ultracode" 触发词的细节（用于"它怎么用"一笔，不必单独成段）
- workflow 保存到 `~/.claude/workflows` 的路径（细节，跳过）
- Sid Bidasaria 的署名（只在 Hook 提到 Thariq + Anthropic 即可）

**应避免的叙事方向：**
- 不要把全片框架建在"6 种 pattern"上做 PPT 式枚举——这会让视频沦为说明书翻译。改成"先讲为什么需要 dynamic workflow，再讲它解决了什么具体失败模式，pattern 作为顺手的语言介绍"。
- 不要重复前 4 期 harness 视频的"harness 是什么"开头——观众已经听过 4 遍 Agent = Model + Harness 了，这期一开场就要假定观众已经知道 harness 是个什么东西，直接进入"现在 harness 自己变了"。
- 不要把 hook 放在"Bun 用 workflow 重写"这一个数字上——这是好的支撑事实但不是钩子主线；钩子应该建立在"Claude 现在自己写 harness"这个角色翻转上。
- 不要照搬 Mike Piccolo 视频的开场套路（LangChain → CrewAI → SDK 重写循环）。
- 不要把 dynamic vs static workflow 讲成纯工具对比——重点是"通用 vs 专用"的翻转。

## signature_line
过去 harness 是工程师写好的脚手架，现在每个任务都有自己临时拼一个。

## hot_keywords
- Claude Code — 全文核心载体，标题就有，所有讨论都发生在 Claude Code 内
- Subagent — 文章核心机制，dynamic workflow 的本质就是协调 subagents
- Skills — workflow 可以打包成 skill 分发，与 Skills 生态打通
- Agent Harness — 标题"a harness for every task"直接命中
- /goal 模式 — 与 workflow 配合使用，原文反复提及
- /loop — 与 workflow 配合做周期性任务

（无热词缺失，这一篇热词命中度极高）
