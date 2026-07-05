# Insight Memo: 和 Fable 协作，瓶颈从"模型会不会"变成"你说没说清"

## title_zh
模型太强，反而卡在你这一环？

## one_sentence_thesis
当模型强到 Fable 这个程度，作品质量的天花板不再是模型能力，而是你能不能把自己的"未知"讲清楚——你和 Claude 之间真正的落差，是你脑中的地图和真实地形之间那条你从没标出来的缝。

## why_this_video_exists
大多数关于 AI 编程的内容都在教"怎么写更好的 prompt"，默认瓶颈在措辞。这篇来自 Anthropic 做 Claude Code 的 Thariq 的一手实践，翻转了这个前提：真正的瓶颈不是措辞技巧，而是"发现自己不知道什么"这件事本身——而且它把这个模糊的直觉拆成了一个可操作的 2×2 象限，配上一整套按"实现前/中/后"排布的具体技法。观众能拿到的，不是又一份 prompt 模板，而是一套"如何把隐藏未知逼出水面"的诊断方法论，以及一个把 Claude Code 当老师用来编辑发布视频的真实案例。

## judgment_lines
- "太具体和太模糊会用两种相反的方式害你" — 来源：太具体，Claude 会照做指令、该转向时也不转向；太模糊，Claude 会退回到行业最佳实践、而那可能根本不适合你的任务。不处理未知，你两头都输。
- "顶尖的 agentic coder 不是没有未知，而是默认有未知并为它留出余地" — 来源：作者观察 Boris、Jarred 这类高手，他们对代码库和模型行为极其同步、未知相对少，但同样会"假设存在未知"；把未知减到最少、并为其规划，本身就是 agentic coding 的核心技能。
- "光提前规划救不了你，因为未知会埋在实现深处" — 来源：无论计划做得多足，实现过程中总有 unknown unknowns 潜伏；agent 可能在写代码时撞到一个边界情况，被迫改道，甚至发现整个问题该换一种解法。
- "发现未知是一项可以练的技能，而练它的方式恰恰是和 Claude 一起工作" — 来源：Claude 能极快搜代码库和互联网、平均知识面比你广、失败后迭代也更快，所以它能帮你比自己更快地把未知挖出来。
- "最便宜的时刻发现未知，等于省下最贵的返工" — 来源：每一次 explainer、头脑风暴、访谈、原型、参考，都是在"改起来还便宜"的阶段把"你原本不知道的东西"先暴露出来。

## evidence_map
- [类型: 具体案例] Fable 的发布视频完全由 Claude Code 编辑完成——这是作者自己完全不擅长的新领域，他靠"让 Claude 教他未知"完成了整个视频。
- [类型: 具体 debug/工作流场景] 视频里要剪掉口头语"um"和长停顿，作者不确定 Whisper 这类转录够不够准、也不确定能否用 ffmpeg 精确切除，于是先让 Claude 解释 Whisper 转录原理和 ffmpeg 可行性。
- [类型: 具体工作流场景] 作者想要一个 UI 与自己说话的词语同步，不确定能否做到，就让 Claude 用 Remotion + 一份转录先做一个原型视频验证可行性。
- [类型: 具体 debug 心理场景] 视频画面偏"闷"（muted），作者知道这是调色（color grading）问题，但根本不懂调色；第一次想让 Claude 出几个变体来选，却意识到自己连"好的调色长什么样"都不知道——于是改为让 Claude 先教他调色，把未知先补上。
- [类型: 具体框架] "未知"的 2×2 象限：Known Knowns（在你 prompt 里的东西）/ Known Unknowns（你知道自己还没搞清的）/ Unknown Knowns（显然到你不会写下来、但看到就认得——"I'll know it when I see it"）/ Unknown Unknowns（你压根没考虑过的、"你不知道这条路上会有的坑"）。
- [类型: 一手引用/prompt 原话] "blindspot pass" + "unknown unknowns"——作者刻意用这两个字面词让 Claude 找出他的盲区，例句："我要加一个新的 auth provider，但我对这个代码库的 auth 模块一无所知，能不能做个 blindspot pass 帮我找出相关的 unknown unknowns。"
- [类型: 一手引用/prompt 原话] 访谈技法："Interview me one question at a time about anything ambiguous, prioritize questions where my answer would change the architecture."（一次只问一个，优先问那些"我的回答会改变架构"的问题。）
- [类型: 一手引用/prompt 原话] 实现笔记技法："Keep an implementation-notes.md file. If you hit an edge case that forces you to deviate from the plan, pick the conservative option, log it under 'Deviations', and keep going."（撞到边界就选保守方案、记到 Deviations、继续走。）
- [类型: 具体规则] Quiz 技法：让 Claude 在给足上下文后就这次改动出题考自己，"只有考满分我才 merge"（I only merge after I pass the quiz perfectly）。
- [类型: 具体机制] References 技法：最好的参考不是图或文档，而是源代码；把 Fable 指向某个文件夹让它读实现，哪怕是不同语言。Claude Design 也是这么工作的——你指给它一个你喜欢的网站模块，它读底层代码而非截图，从而拿到远比截图丰富的结构细节。
- [类型: 具体媒介偏好] HTML artifact 是作者可视化/表达未知的默认首选，几乎所有情况下都用它。
- [类型: 反馈回路] "what you learn becomes the map for next time"——你这次学到的东西，会变成下次的地图。

## non_obvious_points
- 失败是对称的双向陷阱 — 为什么这不显而易见：直觉上"写得更详细"总是更安全，人们默认失败来自"说得不够清楚"。但作者指出过度具体会锁死 Claude、让它在该转向时不转向，和过度模糊一样有害；真正的病根不是"具体/模糊"这个刻度，而是"有没有为未知留出空间"。
- 高手的优势不在"未知少"，而在"预设有未知" — 为什么这不显而易见：外行看 Boris、Jarred 会以为他们赢在什么都懂、未知趋近于零；但作者点破他们同样"assume unknowns"、并主动为未知规划——真正可迁移的技能是这个态度，而不是那份已经内化的领域知识。
- "Unknown Knowns"（明知却从没写下）往往是最贵的一类未知 — 为什么这不显而易见：人们最怕的是"完全没想到的坑"（unknown unknowns），但作者强调那些"显然到你不会写下来、看到才认得"的隐性标准如果拖到实现阶段才浮现，代价极高——因为一点点 spec 变动就能导致代码天差地别的实现，且 agent 很难回退之前的改动；所以要在原型阶段就把它们逼出来。

## tradeoffs_and_limits
- 这套方法把认知负担压回到人身上，而不是让"更强的模型"替你省事 — 具体表现：模型越强，你反而要花更多时间定义未知、写实现计划、做 blindspot pass、通过 quiz 才敢 merge；它不是"一句话出活"的捷径，而是一套需要你持续投入判断力的迭代流程（before/during/after 都要做），对只想甩给 AI 的人来说反而更累。
- 技法是"工具箱"而非"清单" — 具体表现：作者明确说自己"不是每次都用每一种技法"（I don't use every technique each time），什么时候用哪个要靠直觉判断——所以照搬全套反而是误用，价值在于按情境挑选。

## what_to_leave_out
1. 不该进入的素材：
   - ffmpeg / Whisper / Remotion / 调色的具体技术操作步骤——这些是案例的佐料，用来证明"让 Claude 教你未知"有效，不要展开成教程，观众不关心怎么装 ffmpeg。
   - 每一条 prompt 例句的逐字罗列——挑 2~3 条最能体现"逼出未知"的即可（blindspot pass、interview me、implementation-notes、quiz），全列会变成 prompt 词典。
   - "You can watch a more in-depth explanation here"这类站内链接指引，与核心 thesis 无关。
2. 应避免的叙事方向：
   - 不要写成"7 个让 Claude 更听话的 prompt 技巧"清单体——那会把核心 thesis（瓶颈是你的未知、不是措辞）降级成又一份模板，恰恰背叛作者的观点。
   - 不要把全片框架建立在"Fable 有多强"这个卖点上——原文的立场是"模型已经够强，问题回到了你身上"，如果一味吹模型，会和 thesis 打架。
   - 不要把它讲成"AI 会取代程序员"或"以后不用懂技术"——作者的案例恰恰相反：他要主动去补齐调色等未知、要考过 quiz 才敢 merge，人的判断力被强化而非取消。

## signature_line
以前的问题是"模型会不会做"，现在的问题是"你有没有说清你不知道自己不知道的那部分"——最贵的 bug，藏在你从来没写下来的那句话里。

## hot_keywords
- Claude Code — 实质出现：发布视频"完全由 Claude Code 编辑"，是压轴案例的主角；也是保留 implementation-notes.md、做 quiz 的执行主体。可作 Hook 锚点。
- Agent / Agentic Coding — 核心语境："reducing and planning for your unknowns is the skill of agentic coding"，Claude 作为 agent 撞到边界会改道，是全文行为主体。
- Context（工程语境） — 实质出现：反复强调"给 Claude 你起点的 context"、"disclose your experience"、当 thought partner；虽未用"Context Engineering"原词，但概念在场，可作次锚点。
- Skills — 一笔带过：开篇把"prompts and skills and context"并列为"地图"的组成部分，仅提及、非核心，不建议硬塞。
- Prototype / HTML artifact — 高频实质概念：原型和 HTML artifact 是作者暴露未知的默认媒介；虽非 2026 热搜词，但对开发者受众有强锚定力。
- 说明：MCP、Codex、Computer Use、Subagent、/goal 模式等热词在原文中均未出现，不要硬塞。真正能当搜索锚点的是 Claude Code 与 agentic coding。
