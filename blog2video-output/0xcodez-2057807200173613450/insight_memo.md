# Insight Memo: How to write a prompt the right way — the 4-layer structure

## title_zh
给模型加 CRITICAL 没用, 加工具才有用

## one_sentence_thesis
Prompt 失败的真正原因不是你不会措辞, 而是你把所有问题都当成措辞问题——而 Anthropic 工程师把 prompt 拆成的四层结构, 暴露出 99% 的人只在第二层反复改字。

## why_this_video_exists
大多数人对 prompt engineering 的理解停留在"换个说法"和"加 CRITICAL"。这篇文章给出了一套从 Anthropic 内部演讲、官方文档和应用 AI 工程师 debug 经验里提炼出来的判断框架——尤其是"instructions ≠ capability"这条认知, 以及"老补丁会变毒"这种只有看过模型迭代历史的工程师才会讲出来的实战洞察。一句"加 calculator 工具, 不加 CRITICAL"就够把一半的 prompt 加班时间省下来。

## judgment_lines

- "Prompt 不是一句话, 是一个四层系统; 99% 的人只活在第二层" — 来源: 文章开头明确说 "Amateurs write Layer 2 and stop. Pros build all four, in order."
- "给模型写 CRITICAL 加不上能力, 给它一个工具才加得上" — 来源: 客服 bot 算账单的故事——原 prompt 写了 "CRITICAL. Always calculate any prorated amounts correctly", 没用; 换成 calculator 工具, 每个 case 都过。
- "模型越聪明, 单边指令越变成陷阱" — 来源: $8 escalation 故事, prompt 只说了不 escalate 的成本 ($8 + 影响 metrics), 没说错答案的成本, 模型完美优化了你给的唯一目标。
- "去年的防御性指令, 今年会变成毒药" — 来源: "go check the URL" 故事——旧模型会幻觉, 加了 "never give wrong plan details, point them to the URL" 这条补丁; 新模型不幻觉了, 但仍然机械执行这条补丁, 把账户里有的正确答案藏起来不说。
- "把长文档放 prompt 顶部, 问题放底部, 同 prompt 同模型, 直接多 30%" — 来源: Anthropic long-context 官方指引, 是 prompt 工程里最便宜的一刀。

## evidence_map

- [具体数字] 长上下文任务中, 把 query 放在底部、长文档放顶部, 响应质量可提升 up to 30% — 来自 Anthropic long-context 官方文档
- [具体 bug 场景] 客服 bot 给客户算 prorated 账单时给模糊答复, prompt 中已经包含 "CRITICAL. Always calculate any prorated amounts correctly. Never give a vague answer", 无效; 给一个 calculator tool 后所有 test case 通过
- [具体 bug 场景] 客服 bot 拒绝 escalate 账单错误, 因为 prompt 写了 "avoid escalating unless absolutely necessary — it costs about $8 and counts against our metrics", 模型完美执行单边指令
- [具体 bug 场景] 客服 bot 明明账户数据里有答案, 却回复 "go check the website"——根因是历史 prompt 里残留的 "never give wrong plan details, point them to the URL", 旧模型幻觉时的补丁, 新模型逐字照做
- [具体数字] Anthropic 工程师演讲里展示的内部 eval suite 只有 5 个 test case——重点是覆盖面 (control / edge / boundary), 不是数量
- [具体事实] XML 标签是 Anthropic 第一推荐的 prompt 结构, 因为 Claude was specifically trained to recognize XML structure
- [具体事实] Anthropic 称 role prompting 为 "the most powerful way to use system prompts with Claude"; 推荐 role 放 system prompt, task 放 user turn
- [具体事实] Anthropic multishot 推荐 1-3 个 examples, 包在 `<examples>` 标签里
- [具体事实] Anthropic 有一条硬规则: "always have Claude output its thinking"——藏在 hidden scratchpad 里的推理等于没发生
- [具体事实] 调度 Agent 在硬约束规划问题上失败, 换成更大模型 + adaptive thinking 解决——这是 capability, 不是 prompt 文字能解决的
- [类型] 三类 eval test case: control (永远应该通过的, 是 canary), edge (历史 bug 的 regression test), boundary (该交给人类或拒答的边界)

## non_obvious_points

- "Instructions ≠ Capability" — 为什么这不显而易见: 直觉上 prompt = 指令, 越强调越可能照做。但模型的能力上限是固定的, 强调一件它做不到的事 (比如心算) 不会让它做到; 你需要给它一个工具来承担这件事。这条认知一旦理解, 整个 debug 思路从"重写句子"变成"判断 direction 问题还是 capability 问题"。
- "老补丁会变成毒药" — 为什么这不显而易见: 大多数人不会把 prompt 当代码资产维护, 不记录每条防御性指令的添加原因。但模型越升级越认真照做, 当年为绕过旧 bug 加的补丁, 在新模型上反而会让它做出更糟的行为——比如把账户里已经有的答案藏起来。这需要看过至少一次模型迁移翻车才意识到。
- "单边指令在更聪明的模型上反而更危险" — 为什么这不显而易见: 你以为升级了模型, 同一个 prompt 应该效果更好。但模型越聪明, 越会硬刚你给的单一目标。只说 "尽量别 escalate" 而不说 "答错的成本", 模型就只优化前者。这违反直觉——表面上看是模型变聪明了, 实际是你的 prompt 漏洞被放大了。

## tradeoffs_and_limits

- 四层结构有顺序代价——必须 parseable → direction → capability → verification 这个顺序走。跳层就废: 没有结构化的 prompt 上来加工具会更乱; 没有 eval 就改 prompt 等于盲改。代价是你不能"只补一层", 要补就要从最底层往上补。
- 加 tool 解决 capability 问题, 同时也意味着 prompt 生态扩到了代码、API 调用、reasoning budget 配置——比单纯改字成本高得多, 维护负担也更重。
- 写 eval suite 即使只有 5 个 case, 也是工程成本; 但作者明确说 "five test cases beat zero every time", 这条代价值得付。
- Version-controlling prompts (记录每条防御指令的添加原因) 在快节奏迭代环境里几乎没人做, 但不做就会被老补丁反噬——这是组织代价, 不是个人代价。

## what_to_leave_out

### 不该进入的素材

- 完整的 XML 标签清单 (`<instructions>` / `<context>` / `<data>` / `<examples>` / `<thinking>` / `<answer>` / `<output_format>`) ——不是核心 thesis, 不需要在视频里念一遍
- "role 放 system, task 放 user" 的具体代码格式——技术细节, 留给读原文
- multishot 1-3 个 examples 的精确数字——可以提一句, 不必展开
- "Stop the wall of text"、"Stop putting the question first" 等 6 条 anti-patterns 的完整罗列——挑 2-3 个最强的讲, 不要全念
- 调度 Agent 的 adaptive thinking 案例——和 calculator 故事重复, 选一个就够
- 文章结尾 "Pick one prompt you rely on. Run it through the four layers tonight." 这句教程式 CTA 不要照搬

### 应避免的叙事方向

- 不要把视频写成 "4 层教程"——这会变成 PPT 目录, 听众听完啥也记不住。要走"99% 的人活在第二层 → 真正卡你的是第三层 → 4 层只是导航"这条认知路径。
- 不要把 30% 那个数字作为全片回扣点。它是好钩子但不能撑起全片, 真正的 thesis 是 instructions ≠ capability。
- 不要列举所有 6 条 anti-pattern——挑 2-3 个最戳的讲, 比如 CRITICAL 堆叠、单边指令、老补丁。
- 不要用 "prompt 是艺术 / prompt 是科学" 这种泛泛对立——这篇文章给的是具体工程框架, 不要稀释成口号。
- 不要把 Anthropic 写成神坛——这是工程师 debug 出来的经验, 不是官方说教。语气该是 "他们踩坑后总结的", 不是 "他们指点你"。

## signature_line
你 prompt 失败时改的不是字, 是层——99% 的人活在第二层, 你升一层就赢一半的人。

## hot_keywords

- Claude Code — 文章背景之一 (Anthropic 应用 AI 工程师讲的就是 Claude 团队怎么 debug), 但不是核心概念, 可以在 Hook 里嵌一下
- Prompt Engineering — 全文核心概念, 但用法是被解构的: "prompt is not a sentence, it's a system" 是反 prompt engineering 民间套路的姿态
- Tool Use — 第三层 capability 的核心机制 (calculator 故事), 实质性出现
- Context Engineering — 没出现, 但 30% 那个长文档放顶的 trick 实质上属于 context engineering 范畴; 不要硬塞
- Eval — 第四层 verification 的核心, "5 个 test case" 故事直接关联

热词总评: 这篇是 prompt + tool + eval 三个热词的实战交叉, 没有 Agent / MCP / Skill 等显性热词, Hook 锚点应该用反常识事实 ("CRITICAL 没用") 或数字 (30%) 而不是热词堆砌。
