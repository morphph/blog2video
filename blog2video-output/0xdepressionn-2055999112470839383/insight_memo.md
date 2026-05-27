# Insight Memo: Karpathy CLAUDE.md 82k Stars

## title_zh
一个 TXT 文件，让 Claude 准确率从 65% 飙到 94%

## one_sentence_thesis
Claude Code 真正的杠杆点不在模型版本，而在你愿不愿意花两小时写下那份"你以为它知道、其实它每次都忘"的项目上下文——这份文件每周帮一个开发者省下 975 美金。

## why_this_video_exists
之前那条"CLAUDE.md 放哪儿、什么时候刷"的视频只解决了元问题。这一条解决的是**内容问题**：一份 viral 到 8.2 万星的真实 CLAUDE.md 里到底写了什么？21 条规则、3 个分类、每条规则对应一笔可量化的浪费。这是观众真正可以今天下午就 copy-paste 抄走的杠杆。

## judgment_lines
- "Claude 每次开新 session 都从零开始，不是它笨——是你没把它需要的东西写下来" — 来源：原文 "Every time you open Claude Code, it starts with nothing. It doesn't know your stack. Your standards."
- "65% 到 94% 的准确率跳变，靠的不是模型升级，是四条用大白话写的行为约束" — 来源：Karpathy 4 rules 单独被点名为准确率提升来源
- "AI 帮你省时间这件事是真的，但前提是你先停下来花两小时教它" — 来源：CLAUDE.md setup 2 小时 vs $975/week 浪费的对比
- "Claude 的'幻觉'和'瞎重构'不是模型 bug，是缺省指令的产物——它在替你猜，因为你没说" — 来源：原文 "So it guesses. And when it guesses, it refactors code you didn't ask it to touch."
- "最贵的不是 token，是你每天 30 分钟重复解释自己" — 来源：30min/day × $150/hr = $375/week 公式

## evidence_map
- [具体数字: 病毒指标] CLAUDE.md 在 GitHub Trending #1，82,000 stars，7,800 forks
- [具体数字: 准确率跳变] 65% → 94%（Karpathy 4 条规则启用后）
- [具体数字: 时间成本] 每个开发者每天 30 分钟重复解释项目背景
- [具体数字: 美金浪费] $375/周（重复上下文）+ $225/周（撤销越权改动）+ $375/周（忘记决策）= $975/周/人
- [具体数字: 团队放大] 5 人团队每周浪费 $4,875，全年 $253,500
- [具体数字: setup 投入] 全套 CLAUDE.md 配置耗时 2 小时
- [具体数字: 文件规模] 21 条规则、3 个分类（DEFAULTS / BEHAVIOR / MEMORY+STACK）
- [具体 bug 场景] 让 Claude 改一个函数，它 refactor 三个文件、重命名变量、重排 import、重写注释
- [具体 bug 场景] Claude 建议你 6 个月前已经否决过的 Prisma vs Drizzle 方案——因为它没有 MEMORY.md
- [具体一手引用] Karpathy = 前 Tesla AI 总监 + OpenAI 创始成员，给出了 4 个让 Claude Code 失败的行为
- [具体技术名] MEMORY.md（决策日志）+ ERRORS.md（失败日志）作为伪长期记忆机制
- [具体规则示例] "Stay in scope": 只改你被要求改的文件，发现别处问题就在末尾备注，不要动手
- [具体规则示例] "Confirm before destructive": '"You mentioned this earlier" is not confirmation'——这句话本身就是金句

## non_obvious_points
- 让 AI 准确率从 65% 跳到 94% 的，不是更强的模型，而是四句用人话写的"边界感"规则。— 为什么这不显而易见：所有人本能地以为准确率是模型属性，但 Karpathy 证明这是行为约束的产物。同一个 Claude，配不配置 CLAUDE.md，是两个产品。
- "Claude 没有记忆"不是技术限制，是配置缺失——MEMORY.md 这种朴素的 txt 文件就是当下最接近"长期记忆"的方案。— 为什么这不显而易见：行业一直在炒"AI 长期记忆"的复杂技术（向量库、Mem0、context cache），但这篇博客指出最 brutal 有效的方案是让 AI 自己写日志、自己读日志。
- 你花在让 AI 越权撤销改动的时间，比让它工作的时间更长。— 为什么这不显而易见：表面看 AI 加速了开发，但加上"撤销+重审+重新交代上下文"，净收益可能是负的。$975/周的数字把这个隐形成本第一次具象化。

## tradeoffs_and_limits
- 这套 21 条规则是**新增协作摩擦**：每个动作前 Claude 要确认、要展示 2-3 个方案、要写 changelog——对快速原型/玩具项目是过度工程，会让 Claude 变慢。适用边界：生产代码、团队协作、需要可追溯性的项目。
- $975/周的数字基于 $150/hour 的高级开发者 rate 推算，初级开发者或非美国市场要折算。但**结构性浪费的存在是事实**，金额只是放大器。
- CLAUDE.md 会随项目演化而过期——这篇博客没讲维护周期，而 Anthropic 自己说过 3-6 个月要全面 review 一次。这是一份起点模板，不是终点。

## what_to_leave_out
**不该进入的素材：**
- 全套 21 条规则的英文原文逐字念——太长，是文档不是故事，听众会走神
- 复读 $150/hour、$75/day 这类计算细节的中间步骤——只讲最终的 $975 和 $253,500 两个数字
- "Bookmark this before it gets buried"这种 Twitter 拉互动的尾巴

**应避免的叙事方向：**
- 不要把全片框架做成"21 条规则逐条讲"——这是 PPT 目录，不是叙事。要按三个分类讲"问题—成本—修复"的结构
- 不要变成"今天教你写 CLAUDE.md"——这是博主自己写的视角。我们的视角是"为什么 8.2 万人收藏了它"
- 不要重蹈上一条 Anthropic CLAUDE.md 视频（已发布）的覆盖——那条讲"放哪儿、什么时候刷"。这条讲"里面写什么"，要刻意强调 CONTENT 角度
- 不要把 Karpathy 的 4 条规则当作整片的最高潮——它确实是华彩，但出现位置应该在中后段（按原文顺序），不要提前剧透

## signature_line
"AI 准确率不是模型给你的礼物，是你写下来的边界。"

## hot_keywords
- Claude Code — 全文核心产品，标题就出现，正文反复出现
- CLAUDE.md — 全文主题文件名，标题 + 21 条规则的载体
- Agent Harness — 未直接出现，但整篇博客本质是讲"如何为 Claude 搭一个稳定的 harness"，可以作为 Hook 的概念锚
- Karpathy — 权威背书，作为 hook 第二/三句嵌入
