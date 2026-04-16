# Insight Memo: Claude Code Session Management & 1M Context

## title_zh
你的AI编程效率，输在上下文管理上？

## one_sentence_thesis
Claude Code 的产出质量不取决于模型能力本身，而取决于你在每个对话转折点如何管理上下文窗口——rewind、compact、subagent 这些"不自然"的操作才是高手和新手的分水岭。

## why_this_video_exists
这篇内容来自 Claude Code 团队内部与大量用户对话后提炼的操作经验，揭示了一个大多数用户忽视的机制：上下文不是越多越好，100万 token 的窗口反而让"上下文腐烂"问题更隐蔽——模型在最需要聪明的时刻（compaction）恰恰处于最笨的状态。

## judgment_lines
- 上下文窗口从来不是"越大越安全"，1M token 让你能做更长的任务，但也让 context rot 更隐蔽、更致命 — 来源：原文指出 context rot 是 attention 被分散到更多 token 上导致性能下降，且 compaction 发生在模型"最不聪明"的时刻
- Rewind 是比纠错更优的操作，因为纠错会把失败尝试留在上下文中继续污染后续推理 — 来源：原文示例"that didn't work, try X instead"会保留失败路径的工具输出，而 rewind 直接丢弃，上下文更干净
- Compact 和 /clear 的核心区别不是"自动 vs 手动"，而是"谁来决定什么重要"——一个信任模型的判断力，一个信任你自己的判断力 — 来源：原文明确对比 compact 是 lossy、trusting Claude to decide what mattered，而 /clear 是 you decided was relevant
- Bad compact 的根因不是摘要能力差，而是模型无法预测你接下来要做什么 — 来源：原文举例 autocompact 在 debugging 后触发，丢掉了用户下一步需要的 bar.ts 警告信息
- Subagent 的本质是一种上下文隔离机制，判断标准是"我需要过程还是只需要结论" — 来源：原文的 mental test: will I need this tool output again, or just the conclusion?

## evidence_map
- [具体事实] Claude Code 上下文窗口为 100 万 token，包含系统提示、对话历史、所有工具调用及其输出、所有已读文件
- [具体机制] Context rot 的定义：模型性能随上下文增长而下降，因为 attention 被分散到更多 token 上，旧的无关内容开始干扰当前任务
- [具体操作] 每个对话转折点有 5 种选择：Continue、Rewind（双击 Esc）、/clear、Compact、Subagent
- [具体场景/bug] Bad compact 示例：长时间 debugging 后 autocompact 触发，摘要聚焦于调试内容，用户下一条消息要求修 bar.ts 的警告，但该警告已被摘要丢弃
- [具体操作] Compact 可以带指令引导：/compact focus on the auth refactor, drop the test debugging
- [具体机制] Compaction 发生时模型处于"最不聪明"状态，因为此时上下文最长、context rot 最严重
- [具体操作] Rewind 示例：Claude 读了 5 个文件后尝试方案 A 失败，rewind 到文件读取之后重新提示"Don't use approach A, the foo module doesn't expose that — go straight to B"
- [具体功能] "Summarize from here"功能：让 Claude 总结学到的经验并创建交接消息，相当于未来的自己给过去的自己写信

## non_obvious_points
- Compaction 发生在模型最笨的时刻：上下文越长 → context rot 越严重 → 模型判断力越差 → 而 compaction 恰恰在上下文最长时触发，意味着最关键的摘要决策由最差状态的模型完成 — 为什么这不显而易见：直觉认为"让 AI 自动总结"是安全的，但没考虑到总结质量本身受 context rot 影响，形成恶性循环
- 纠错（correction）比 rewind 更贵且更差：直觉是"告诉 AI 哪里错了让它改"，但这把失败路径的所有工具输出都保留在上下文中，不仅浪费 token，还让模型用更多注意力处理已知无用的信息 — 为什么这不显而易见：在日常对话中"指出错误让对方改"是最自然的反应，但在有限上下文窗口中，删除比修正更高效
- 1M context 的真正价值不是"不用管理上下文了"，而是"给你更多主动管理的时间窗口"——原文说"you have more time to /compact proactively" — 为什么这不显而易见：大窗口的直觉卖点是"不用担心上下文限制"，但实际上它让你有余裕在模型还聪明的时候主动 compact，而不是被动等 autocompact 在最差时刻触发

## tradeoffs_and_limits
- [1M 上下文的双刃剑] 更大的窗口让 context rot 更隐蔽：你可能在 60 万 token 时就已经性能下降但不自觉，因为没有触碰硬限制，不会收到任何警告 — 具体表现：用户可能在长 session 中感觉"AI 变笨了"但不知道原因，也没有强制的 compaction 提醒
- [Compact 的有损性] 模型决定什么重要，意味着它可能丢掉你未表达但下一步需要的信息 — 具体表现：bad compact 场景中，模型无法预测用户意图转变，尤其是跨任务切换时
- [Rewind 的认知成本] 需要用户自己判断"回退到哪个点"、"带上什么新信息"，这要求对对话结构有清晰认知 — 具体表现：对新手来说，识别最佳回退点本身就是一个非平凡的决策

## what_to_leave_out
**不该进入的素材：**
- 1M context 的技术实现细节（attention 机制的底层原理）——观众不需要理解 transformer 架构
- Claude Code 的具体安装、配置、pricing——这不是教程视频
- "summarize from here"功能的详细操作步骤——太细节，且不是核心认知
- 原文最后"over time we expect Claude will help you handle this itself"——这是 roadmap 愿景，不是当下可操作的认知

**应避免的叙事方向：**
- 不要把这讲成"Claude Code 使用技巧合集"——这不是 tips & tricks，核心是一套上下文管理的思维模型
- 不要过度强调 1M context 的"大"——重点不是数字本身，而是大窗口带来的新的管理挑战
- 不要把 5 种操作平行罗列——它们之间有决策树关系（什么时候用哪个），不是并列清单
- 不要用"AI 工具使用教程"的框架——应该是"一个反直觉的认知：给你更多空间反而需要更多纪律"

## signature_line
100 万 token 的上下文窗口不是让你不用管理上下文——而是让你终于有时间在模型还聪明的时候，主动管理它。
