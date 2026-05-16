# Insight Memo: Context Engineering（不是更好的 prompt，是更好的 context 基础设施）

## title_zh
AI 输出像 AI 写的？你的 context 是空的

## one_sentence_thesis
Prompt 工程是语法，context 工程是基础设施——同一个模型为什么有人用出"通用废话"、有人用出"专属操作员"，差距不在 prompt 的措辞，而在 prompt 周围有没有一套被设计过的 context 架构（身份、受众、标准、项目）和持久记忆系统。

## why_this_video_exists
绝大多数关于 AI 的内容还在教"怎么写更好的 prompt"，而这篇文章给出了一个更高位的解释：输出之所以平庸，不是因为 prompt 写得不够好，而是因为模型在"裸跑"——它对你是谁、为谁写、好的标准长什么样、你之前决定了什么一无所知。这条视频提供两个其他渠道很少同时讲清楚的东西：(1) 三层 context（即时 / 会话 / 持久）的分层结构，以及为什么 99% 的人停在第一层；(2) 四文件架构（identity / audience / standards / project）这种可直接落地的最小框架，加上一个明码标价的市场信号——$5K–$25K 一个项目。

## judgment_lines
- "AI 输出'像 AI 写的'，不是模型不行，而是模型在裸跑" — 来源："A blind model defaults to the most average, most generic, most safe response it can produce"——模型没有关于你的任何信息时，默认会退化到最平均、最安全的那一档。
- "Prompt 是配料，context 是整个厨房——纠结配料的人永远做不出招牌菜" — 来源：原文 "Your prompt is one ingredient. Context is the entire kitchen"，并明确指出"完美 prompt + 烂 context = 平庸输出"，反过来则相反。
- "真正的杠杆不在第一层 prompt，而在第三层持久记忆——而 99% 的人停在第一层" — 来源：三层 context 模型——immediate (prompt) / session (上传文件+历史) / persistent (memory + 知识库)，原文直接写"almost nobody uses this properly, and it is where the biggest leverage lives"。
- "每次新开会话都重新自我介绍，是 AI 工作流里最大的生产力漏水点——不是 prompt 写得烂" — 来源："The single biggest productivity leak in AI-assisted work is re-explaining yourself every session"——这是个生产力诊断，不是技巧。
- "记不住不是 bug 是 feature——设计过的记忆比人类员工更值钱，因为它只记你想让它记的" — 来源："A human employee remembers everything, including their bad habits... An AI with a designed memory system remembers only what you want it to remember"——人类记忆默认全留，AI 记忆默认全删，主动权完全在你手上。
- "Context + MCP 把模型从顾问变成操作员——这是一次类别跳跃，不是渐进升级" — 来源："the model stops being an advisor and starts being an operator. It does not just know what your weekly report should contain. It pulls the data, runs the numbers, formats the report, and saves it to your drive."

## evidence_map
- [具体数字] $5,000–$25,000 per project：能为企业做完整 context 架构审计 + 落地的人，单项目报价区间。
- [具体框架] 三层 context：Layer 1 immediate（prompt 本身）/ Layer 2 session（上传文件、对话历史、system instruction）/ Layer 3 persistent（跨会话的记忆系统、context files、知识库、保存偏好）。
- [具体框架] 四文件架构：identity file（你是谁）/ audience file（你为谁写）/ standards file（什么叫好——含 anti-patterns 和正反例）/ project file（当前在做什么，周/月级动态层）。
- [具体阈值] 记忆系统三档进阶规则：(1) Manual memory documents——个人和小规模工作；(2) 当 context 文档超过 20 份时，升级到 structured knowledge base（Obsidian + markdown 文件夹结构，Claude Code 可直接读）；(3) 当知识库规模超出手动管理能力时，升级到 vector database + RAG。
- [具体机制] 动态 context loading 规则示例：写作任务加载 identity + audience + standards + 优秀样本；分析任务加载 identity + project + 原始数据 + 历史分析；研究任务加载 project + 方法论 + 既有研究；策略任务加载全部四文件 + 竞品 + 行业数据。
- [反直觉事实] 把整个知识库塞进 context window 不是更好——"Loading your entire knowledge base into every conversation is a waste of tokens and actually degrades performance"，注意力被稀释后模型反而什么都用不好。
- [类比但有具体细节] 外科医生类比："A surgeon does not review every medical textbook before every operation. They review the specific patient file, the specific procedure notes, and the specific imaging results."——支持"动态加载 > 静态加载"。
- [具体集成模式] context-first, tools-second：system prompt 立 context（who/what 模型是谁知道什么），MCP servers 提供能力（搜索 / 文件 / 数据库 / API / 邮件 / 日历），task prompt 把两者结合（"基于你已知的 Q2 目标和竞品图景，拉取最新市场数据，对比内部指标，生成周报"）。
- [口号化命题] "Prompt engineering is the syntax. Context engineering is the infrastructure. And infrastructure beats syntax every single time."（原文加粗的 thesis 句）

## non_obvious_points
- "输出听起来像 AI"的根因不是模型笨，而是它对你一无所知——所以默认输出退化到"对所有人都合理"的最大公约数 — 为什么这不显而易见：大部分人会把"AI 味"归咎于模型本身或自己 prompt 不够花哨，但原文指出 blind model 必然回到 most-average / most-generic / most-safe 三档保底，问题不在能力，在输入条件。这把"AI 味"从一个审美问题翻译成了一个信息缺失问题。
- 模型的"健忘"是一个被错用的特性，不是缺陷——人类员工默认记得所有东西（包括坏习惯和过时的判断），AI 默认全部清空意味着你拥有了"选择性记忆"的设计权 — 为什么这不显而易见：直觉上"会记忆 = 更聪明"，但原文反过来论证：unfiltered memory 在人类身上是个负担，而 designed memory 在 AI 身上是个优势，前提是你愿意把它当 feature 用。
- 加载更多 context 反而会让模型变笨——超过阈值后注意力被稀释，模型"想用全部信息但什么都没用好" — 为什么这不显而易见：直觉是"信息越多越好"、"反正窗口够长就全塞进去"，但原文明确说这是 token 浪费 + 性能下降，正确做法是 per-task 动态加载，连知识库结构都要按任务类型预先定义加载规则。

## tradeoffs_and_limits
- 加载越多 ≠ 效果越好：把整个知识库塞进 context window 会稀释注意力、浪费 token、降低输出质量。必须为每类任务预先定义"加载哪些文件"的规则，否则 context 工程会反向变成噪声工程。
- 四文件架构是持续维护成本，不是一次性产物：identity/audience/standards 相对稳定，但 project file 是"周/月级动态层"，需要不断更新当前目标、活跃项目、近期决策、open questions——不维护就回到"每次重新介绍自己"的原点。
- 记忆系统需要分级升级，错档使用会失效：超过 20 份文档还用 manual paste 会失控；不到那个量级就上 vector DB + RAG 是过度工程。原文给出的分档（manual → Obsidian 结构化 → vector DB）本身就是一个临界点判断题，选错档比不做更糟。
- MCP 集成不是"接上就能用"：context-first / tools-second 的顺序是有讲究的——system prompt 立角色，MCP 提供能力，task prompt 把两者粘起来。任一环节缺失，"操作员"就退化回"顾问"。

## what_to_leave_out

**不该进入的素材：**
- Week 6 的整段商业化叙事——把 context 工程包装成服务卖给企业、$5K–$25K 报价的市场分析部分。这是作者自己的 CTA（卖课/卖咨询），不是观众想听的认知。$5K–$25K 这个数字本身可以作为"市场已经在为这事买单"的一句话证据，但不要把整条叙事建立在"你也可以靠这个赚钱"上。
- "Week 1/2/3..."的课程章节结构。这是博客的组织方式，不是视频的叙事方式——保留洞察，丢掉"六周课"的外壳。
- "prompt engineering is the skill of 2024, context engineering is the skill of 2026"这种年份口号——容易被听成营销话术，削弱论点严肃性。
- 写作 / 分析 / 研究 / 策略四类任务对应加载哪些文件的完整对照表——太细节，作为例子提一个就够，不是这条视频要解决的。

**应避免的叙事方向：**
- 不要把视频写成"context engineering 教程"或"六步学会 context engineering"。这是认知重塑型内容，不是 how-to。
- 不要让 Skills 那条视频的"数字杠杆"框架（80k 个 Skill 没人装）复制过来——这次的核心张力不是"可用资源 vs 实际使用"，而是"语法 vs 基础设施"、"裸跑 vs 装配"、"顾问 vs 操作员"的层级跳跃。
- 不要把"三层 context"和"四文件架构"并列讲——它们是不同维度。三层是 context 的纵深结构（时间维度：即时/会话/持久），四文件是其中第三层的内部组件（功能维度：你是谁/为谁/什么叫好/在做啥）。混着讲会让观众失焦。
- 不要把全片框架建立在单一数字上（$5K–$25K 不应该是 hook，而是结尾一句话的市场佐证）。
- 不要用"AI 越来越聪明所以..."这种发展论开场——这篇文章的 thesis 恰恰相反：模型能力是常数，差距全在它周围的装配。

## signature_line
Prompt 工程是语法，context 工程是基础设施——你以为 AI 输出平庸是因为 prompt 不够好，其实是因为模型对你一无所知。
