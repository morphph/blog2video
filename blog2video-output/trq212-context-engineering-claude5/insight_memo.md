# Insight Memo: Claude 5 世代的上下文工程新规则（删掉 80% 系统提示词之后）

> 原文：Thariq Shihipar（Anthropic 技术团队成员），2026-07-24
> 载体：Claude 官方博客 + X 帖（外部语境：X 帖约 430 万浏览 / 1.5 万赞，是当期讨论度极高的一篇——但中文圈基本只转播了「80%」这一个数字）

## title_zh

**官方删了 80% 提示词，效果没变差**

- 备选（观众代入更强，供 Script Writer 二选一）：**你的 CLAUDE.md 越写越长，其实在帮倒忙**

## one_sentence_thesis

对 Claude 5 这一代模型来说，写进 system prompt / CLAUDE.md / Skill 里的规则已经从「保险」变成了「负担」——因为它们逼模型先花判断力去裁决一堆自相矛盾的约束，再去干活；所以官方删掉 80% 不是精简，是拆掉了一层已经过期的对冲，评测才会没有可测量的损失。

## why_this_video_exists

「删了 80%」这个数字满天飞，但绝大多数人拿不到它背后的因果链，而这条因果链恰好是可迁移的：

1. **删的是冲突，不是信息。** 原文点名了内部 transcript 里的真实病症：system prompt、skill、用户请求在同一次请求里同时说「leave documentation as appropriate」和「DO NOT add comments」。模型不是不懂，是必须先想清楚这堆冲突再动手——规则真正吃掉的不是 token，是判断力预算。
2. **一条教科书级最佳实践被官方反转了。** 「给工具用法举例子」曾经是 tool usage 的 number one rule，现在被判定为把新模型锁死在特定探索空间里的做法。这在任何中文提示工程教程里都还是正面建议。
3. **对本频道受众是直接可操作的。** 目标观众手里正维护着一份越写越长的 CLAUDE.md，这篇给了官方级别的取舍判据：留 gotchas，删「看文件系统就知道」的东西，长内容拆成能被按需加载的树。

## judgment_lines

- **「上下文工程的最佳实践是有保质期的——它绑定的是模型版本，不是绝对真理」** — 来源：老 system prompt 里「默认不写注释 / 绝不写多段 docstring / 一行封顶」这条，原文明说是为弱模型买的保险，且当时就知道会有一部分场景被写错，"we had to accept this tradeoff"。模型换代后，这张保单本身变成了错误来源。
- **「规则的成本不是上下文长度，是模型的判断力」** — 来源：内部 transcript 中同一请求里出现相互冲突的文档指令；原文原话是 Claude "must think more carefully about these overlapping and conflicting messages before deciding what to do"。这也解释了为什么删掉 80% 反而不掉分。
- **「举例子从第一守则变成了副作用，替代它的不是空白，是接口设计」** — 来源：原文明确说 examples "actually constrains them to a certain exploration space"；给出的正确姿势是让参数本身表达意图——Todo 工具把 status 定义成 `pending` / `in_progress` / `completed` 三个枚举值，枚举本身就在提示用法，再配一句「同时只保留一个 in_progress」定义期望行为。
- **「删规则 ≠ 不给指引，而是把绝对命令换成相对锚点」** — 来源：删掉「一行注释封顶」之后，新 system prompt 并没有留白，而是换成了一句 "Write code that reads like the surrounding code: match its comment density, naming, and idiom."——指令还在，只是从「我替你决定」变成了「你去看现场决定」。
- **「文档的价值和信息的可发现性成反比」** — 来源：官方对 CLAUDE.md 的建议是保持轻量、大部分 token 花在 codebase 里的 gotchas 上（例如「所有类型都堆在一个文件里」这种反直觉约定），并明确要求避免写 Claude 看文件系统或看仓库就能知道的「显而易见的事」。

## evidence_map

- [具体数字] Claude Code 的 system prompt 被删掉 **超过 80%**，适用模型精确点名为 **Claude Opus 5 和 Claude Fable 5**，结果是 **"no measurable loss on our coding evaluations"**（内部编码评测无可测量损失）。
- [一手引用·旧] 被删掉的老 system prompt 原文：*"In code: default to writing no comments. Never write multi-paragraph docstrings or multi-line comment blocks — one short line max. Don't create planning, decision, or analysis documents unless the user asks for them — work from conversation context, not intermediate files."*
- [一手引用·新] 取而代之的一句话：*"Write code that reads like the surrounding code: match its comment density, naming, and idiom."*（一整段绝对禁令 → 一句相对锚点）
- [具体冲突场景] 读自家内部使用 transcript 时发现，单次请求里同时存在 "leave documentation as appropriate" 和 "DO NOT add comments" —— 冲突来自 system prompt / skills / 用户请求三方打架。这是全文唯一一个「可以被开发者直接对号入座」的具体病例。
- [具体机制] Todo 工具的 status 枚举 `pending` / `in_progress` / `completed`，加上「保持同时只有一项 in_progress」的约束 —— 用接口形状代替用法示例。
- [具体机制] verification 和 code review 从 system prompt 里搬出来，各自变成可被 Claude 按需调用的 skill（progressive disclosure 的具体落地）。
- [具体机制] 部分工具改为 **deferred loading**：agent 必须先用 **ToolSearch** 查到完整定义才能调用（Task 系工具即属此类）。效果是「工具可以更多，但不用时不占上下文」。
- [具体事实] 记忆机制换代：过去鼓励用 `#` 热键把内容写进 CLAUDE.md 当记忆；现在 Claude 自动保存与当前工作和用户相关的记忆。
- [具体事实] spec 的形态被扩宽：不再只是 markdown 计划文件，可以是 **HTML artifact**、**一套详细的测试套件**、**另一个 codebase 里待移植的函数**，也可以是 **rubric**（用来让 Claude 校验你在某个领域的品味，例如「什么是好的 API 设计」，并据此拉起 verifier agent 去验证）。
- [具体建议·可直接引用] 引用文件时优先给代码形态的高保真材料：**一个 HTML mockup 通常比一段设计描述或一张截图产出更好的结果**。
- [具体事实·旧模型行为] 早期模型有时需要重复指令，且更倾向听 context 末尾而非开头的指令 —— 这才是当年「system prompt 里写一遍、tool description 里再写一遍」的成因；现在重复被删掉，用法只留在 tool description 里。
- [具体产品] 新命令 `claude doctor`（Claude Code 内为 `/doctor`），用途是帮用户给自己的 skills 和 CLAUDE.md「rightsize」；同时官方也提到了面向 Fable 的 field guide。
- [结构性事实] 全文以 6 组 Then → Now 对照组织：规则→判断力、举例→设计接口、全塞前面→渐进式披露、重复自己→精简工具描述、CLAUDE.md 当记忆→自动记忆、简单 spec→丰富引用。
- [外部传播数据·非原文] X 帖约 430 万浏览、1.5 万赞；作者身份为 Anthropic member of technical staff —— 说明这是官方口径而非社区经验帖。

## non_obvious_points

- **被删掉的东西真正在消耗的是模型的「决策带宽」，不是上下文窗口。** — 为什么这不显而易见：所有人优化 CLAUDE.md 的直觉都是「太长了会吃 token / 会稀释注意力」，是个容量问题。原文只用一句话带过真正的机制——模型必须先裁决相互冲突的指令，才能开始干活。理解了这一点，「删掉 80% 而评测不掉分」才不再是魔术：删掉的是冲突和过期对冲，信息量本来就没多少。
- **老规则从来就不是「对的」，它是官方明知有代价还是买下的保险；而你可能正在继承别人过期的保单。** — 为什么这不显而易见：要读到 "we had to accept this tradeoff" 这半句才能反应过来——「默认不写注释」当年就已经会在一部分场景里写错，只是相对于弱模型乱写注释的损失更划算。今天从教程、别人的仓库、老版本官方文档里抄来的规则，抄的往往正是这类为上一代模型定制的对冲。
- **「更多工具」和「更少上下文」可以同时成立——办法是把工具藏起来。** — 为什么这不显而易见：直觉上工具越多，工具定义占的上下文越多，两者是正相关的死结。deferred loading + ToolSearch 把「加载」从默认变成按需检索，于是能力上限和上下文成本被解耦。同一招原样适用于 CLAUDE.md 和长 Skill：不是写得更少，是拆成一棵能在正确时刻被加载的树。

## tradeoffs_and_limits

- **「80%」被三重限定，直接外推会退化。** — 具体表现：这个数字的适用域是「Claude Code 自己的 system prompt」×「Claude Opus 5 / Fable 5 这一代模型」×「Anthropic 自己的编码类评测」。原文同时说明，对更老的模型来说，没有这些护栏时 Claude 写出的注释 "would be incorrect in many cases"。也就是说：删护栏是模型条件性的，跑在旧模型或非 Claude 5 世代上照删，就是把当年花代价换来的正确性丢掉。
- **官方自己保留了例外，但没给判定标准。** — 具体表现：对 Skills 的建议是 "Avoid making them overconstrained, **except in highly important areas**"。什么算 "highly important area"，文章没有给任何判据。也就是「删到哪一层」这个最难的决定，最后还是由你自己承担风险。
- **"no measurable loss" 是「没测出损失」，不等于「没有损失」。** — 具体表现：评测只覆盖它覆盖的东西（这里是 coding evaluations）。约束被删掉后在评测之外的行为（写作口吻、文档偏好、破坏性操作边界）没有对应数据支撑。
- **自动记忆用「省事」换掉了「可见和可控」。** — 具体表现：过去 `#` 热键写进 CLAUDE.md，存了什么是一份你能读、能改、能 review 的明文；现在由 Claude 自动决定哪些记忆值得保存。

## what_to_leave_out

**一、不该进入视频的素材**

- Fable field guide、作者上一篇 prompting 文章的引流链接 —— 对中文观众是无效外链，且会稀释信息密度。
- References 章节里 `@` mention 的语法/操作细节 —— 太产品操作层，属于文档而不是认知。
- 「system prompt 强绑产品上下文，Claude Code 用户基本不用改它」这一段 —— 对不自建 agent harness 的观众没有抓手；如果要用，只值得留半句作为「四层里哪层轮不到你改」的分层背景。
- rubrics + verifier agents 那条如果展开，会牵出「评估 / 裁判 agent」这个独立话题，撑不下也收不住 —— 一笔带过即可，不要展开。
- 6 组 Then → Now 不要逐条平铺 —— 其中「重复自己 → 精简工具描述」「CLAUDE.md 当记忆 → 自动记忆」两条信息量最低，可以合并或牺牲。

**二、应避免的叙事方向**

- **不要把全片建立在「80%」这个数字上，更不要滑向「提示词无用论」。** 原文的论点是删冲突和过期对冲，不是删信息；误读会导致观众直接清空 CLAUDE.md，这是这条视频最大的实际风险。
- **不要写成「CLAUDE.md 怎么写」的教程体 / 清单体。** 这篇的价值在上游一层：为什么你抄来的那些规则会过期。清单是结论，不是这条视频的主体。
- **不要暗示「模型变强了，所以上下文工程不重要了」。** 原文恰恰相反：它在说上下文工程更重要，只是形状从「写规则」变成了「设计接口、拆加载时机、给高保真引用」。
- **不要做 Claude vs 其他模型的对比战。** 原文里完全没有这条线，硬加就是编造。
- **不要把 `/doctor` 当主线或落点。** 它是文末的工具提示，不是论点；用它收尾会把一个认知型内容降级成产品公告。

## signature_line

**「上下文工程的关键，不是把你知道的都写进去，而是把模型自己能判断的那部分删掉。」**

备选：

- 「为弱模型写的规则，会在强模型身上变成 bug。」
- 「你以为 CLAUDE.md 在指导模型，其实它在替模型做那些模型比你更该做的决定。」

## hot_keywords

- **Claude Code** — 全文主语，80% 删除就发生在它的 system prompt 上；也是 `/doctor` 的载体。核心概念。
- **Context Engineering** — 标题概念，全文用它与 prompt engineering 做对照定义：prompt 是单次的、可以很具体；context 要跨大量请求通用，所以没法那么具体。核心概念。
- **CLAUDE.md** — 独立成章的可操作对象（保持轻量 / 大部分 token 给 gotchas / 别写显而易见的 / 用渐进式披露拆树）。对本频道受众而言，这是命中率最高的锚点。
- **Skills** — 独立成章，同时是 progressive disclosure 的主要载体（verification、code review 被搬进 skill）。核心概念。
- **Claude Opus 5 / Claude Fable 5** — 被精确点名的适用模型，是「80%」这个数字的限定条件，不能省略。
- **Agent Harness** — 实质性出现：如果你在自建 agent harness，system prompt 就是最值得花时间的地方。
- **Subagent** — 只以 verifier agents 的形式在 rubrics 那段出现一次，属周边提及，不要当主线。
- **ToolSearch / deferred loading** — 不在通用热词表内，但对开发者受众信息量很高（工具更多、上下文更省的具体实现）。
- **MCP、Computer Use、`/goal` 模式、Codex** — 原文中完全未出现，不要硬塞。
