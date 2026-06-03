# Insight Memo: Dynamic Workflows in Claude Code

## title_zh
Claude Code 给自己写了个外壳

## one_sentence_thesis
Dynamic workflows 之所以重要，不是因为多了一个新功能，而是因为它把"agent 自己造 agent 编排系统"这一层正式打开——长任务的失败模式不在模型本身，在它的 context window 是不是被分给了对的子目标。

## why_this_video_exists
这条视频帮观众建立一个 mental model：长跑、并行、对抗性任务为什么单一 context window 会塌——以及为什么解法不是"换更强的模型"，而是"让 Claude 给自己写一个临时外壳"。原文给了三个非常具体的失败模式（lazy / self-preference / drift）+ 六个可复用模式，这三个失败模式名字本身就是观众没听过、听完会立刻能套到自己经历上的东西。

## judgment_lines
- "长 context 不是天花板，单一 context 才是。" — 来源：原文把 agentic laziness、self-preferential bias、goal drift 三种失败模式都归因于"plan + execute 都挤在同一个 context window"。
- "Claude 不是在多干活，而是在给自己分身。" — 来源：dynamic workflow 实质是 Claude 写一个 JS 文件，里面调用 subagent 生成函数，每个 subagent 自己一个 context window。
- "对抗性验证不是工程洁癖，是绕开模型偏见的唯一办法。" — 来源：原文显式指出 self-preferential bias 让 Claude 倾向认可自己的产出，所以验证必须由"另一个 agent"来做，不是同一 agent 自查。
- "静态 workflow 写出来要适配所有 case，动态 workflow 只为这一个 case 而写。" — 来源：原文对比 Claude Agent SDK 的 `claude -p` 静态写法 vs 动态写法的关键差异在于"通用 vs 量身定做"。
- "重要的不是模型几号，是这次任务它该派几个分身。" — 来源：原文专门有一段"Model and intelligence routing"——classifier 决定后面派 Sonnet 还是 Opus。

## evidence_map
- [具体失败场景] Agentic laziness：50 条 security review 只处理 35 条就宣告完成。
- [具体失败场景] Goal drift：compaction（自动总结压缩上下文）每一次都是有损的，"don't do X" 这种约束最容易丢。
- [具体失败场景] Self-preferential bias：让 Claude 拿 rubric 验证自己的产出，它倾向给自己打高分。
- [具体应用案例] Bun 从 Zig 重写到 Rust，用的就是 workflow——每个 callsite / 失败测试 / 模块开一个 subagent 在独立 worktree 里改，再让另一个 agent adversarially review。
- [具体功能] `/deep-research` skill 内置 workflow：fan-out 网搜、抓 source、adversarial verify claims、合成带引用的报告。
- [具体技术细节] workflow 是一个 JS 文件，包含 spawn subagent 的特殊函数，加 JSON / Math / Array 等标准函数。
- [具体技术细节] subagent 可以选模型（Sonnet vs Opus）、可以决定是否跑在独立 worktree。
- [具体技术细节] workflow 中断（用户操作、关终端）可以 resume 续跑。
- [六种模式] classify-and-act / fan-out-and-synthesize / adversarial verification / generate-and-filter / tournament / loop-until-done。
- [触发词] 输入 "ultracode" 强制 Claude Code 创建 workflow；workflow 菜单里按 "s" 保存。
- [token 预算] 可在 prompt 里写 "use 10k tokens" 设上限。
- [分发路径] 存到 `~/.claude/workflows` 或打进 skill 的文件夹再在 SKILL.md 里引用。
- [组合方式] 与 `/loop`（定时跑）和 `/goal`（硬性完成条件）配合。
- [反直觉建议] 把 skill 里的 workflow 当 template 而不是逐字脚本——给 Claude 留改写空间。
- [模型版本] 这是 Claude Opus 4.8 才让动态写 harness 成为可能。
- [作者] Thariq Shihipar 和 Sid Bidasaria，Anthropic 内部 Claude Code 团队。
- [非编程类应用] 80 份简历后端岗位排序、CLI 工具命名 tournament、把 business plan 拿给"投资人 / 客户 / 竞品"三种 persona agent 撕、Slack #incidents 半年根因挖掘、博客技术声明逐条对照 codebase 验证。
- [量化反直觉] "1000+ 行一次性 sort"会塌，pairwise comparison 比 absolute scoring 可靠——每个 comparison 都是独立 agent，确定性循环保住 bracket 顺序。
- [quarantine 模式] 读不可信公开内容的 agent 不许做高权限动作，由另一组 agent 接管行动权。

## non_obvious_points
- **失败模式有名字本身就是新认知** — 为什么不显而易见：大多数人遇到 agent 跑一半放弃只会骂"模型偷懒"，不会意识到这是一个有名字的、可以被结构化规避的现象（agentic laziness / self-preferential bias / goal drift 这三个词在用户嘴里是缺席的，但在团队内部已经被命名）。这三个词比"工作流是什么"本身更值钱。
- **配对判断比绝对打分更靠谱** — 为什么不显而易见：直觉上"你给每条打 1-10 分再排序"很自然，但实际上 Claude 拿 rubric 打绝对分数会漂移；让它两两比"哪条更严重"反而稳定。这是从评分理论借来的洞察，但在 agent 上才被普遍验证。
- **quarantine 是 agent 安全的实操形态** — 为什么不显而易见：大家都听过"prompt injection"很危险，但很少有人把对策结构化成"读外部内容的 agent 和执行高权限动作的 agent 必须是两个 agent"。这是把多 agent 编排顺手当成 security boundary 用，原文一句话带过但其实是个很大的设计模式。
- **"量身定做的临时脚手架"已经超过"通用工作流"** — 为什么不显而易见：直觉上一套通用的、可复用的 workflow 应该比每次重写一个更好（DRY 原则），但实际上模型够强之后，给这一个任务现写一个反而胜过"为所有 case 写一套"。这是经典软件工程直觉的反转。

## tradeoffs_and_limits
- **Token 烧得多** — 具体表现：原文自己第一段就提醒 "dynamic workflows often use more tokens and are best suited for complex, high value tasks"——开一群 subagent 每个独立 context，token 量是单 context 的好几倍。所以原文专门有"When not to use"段，劝你日常 coding 任务别动不动就开 workflow。
- **本机资源吃紧** — 具体表现：refactor 案例里专门说"告诉 agent 不要用 resource-intensive 命令"以免最大并行时机器跑不动。
- **best practice 还在发育** — 具体表现：原文反复说 "best practices are still developing"——是个还在摸索的工具，不是已经成熟的 API。
- **5 个 reviewer 不是越多越好** — 具体表现：原文劝告"大多数传统 coding 任务不需要 5 个 reviewer 的 panel"——加 reviewer 不是免费的洞察，是真金白银的 token。

## what_to_leave_out
**不该进入的素材**：
- workflow 文件存在哪个目录、按哪个键保存——这是用户手册细节，视频里讲完观众也记不住，让他们看文档去。
- 触发词 "ultracode"——记忆负担没必要，自然语言就够触发。
- 与 Claude Agent SDK / `claude -p` 的细节对比——这是开发者过去用过 SDK 才有体感的，CEO 听众完全不在乎。
- 全 6 种 pattern 一一念遍——一定会塌成 PPT 目录腔。挑 2-3 个最有故事感的（fan-out-and-synthesize、adversarial verification、tournament）展开。
- Bun Zig→Rust 重写故事的"X thread"出处——视频里讲完结果就行，不必引用 X。

**应避免的叙事方向**：
- 不要把它框成"Anthropic 又发了个新功能"——那是产品发布稿口吻，视频是"教你看懂这件事"。
- 不要写成 6 个模式的目录式罗列。要挑 2-3 个最能说明问题的展开。
- 不要把"workflows are new"那段直接搬出来用——读起来像免责声明。
- 不要全程围绕"workflow 是什么"展开——观众真正想知道的是"为什么单 context 不够"以及"我能不能在工作里用得上"。
- 不要拿"五大模式 / 三大失败 / 七大用例"这种数字框架——会塌成 PPT。
- 不要把 `/goal`、`/loop`、`ultracode` 这些命令一起在一段塞——观众消化不了。

## signature_line
- "Agent 的极限不在模型能不能想到，而在它能不能给自己分身。"
- "长 context 不是天花板，单一 context 才是。"

## hot_keywords
- Claude Code — 全文核心讨论对象（话题主角，非 attribution）
- Agent Harness — 全文反复使用的核心概念，标题级
- Subagent — workflow 的基本执行单元
- Skill — workflow 的分发载体，与现有 skill 生态打通
- `/goal` — 与 workflow 配合的硬完成条件命令
- `/loop` — 与 workflow 配合的定时循环命令
- MCP / Context Engineering — 原文未直接提及，但话题落在"context window 怎么分配"的本质上，可以在 narration 里点到"context engineering 之上一层"
