# Insight Memo: Zero to AI Engineer 路线图（self.dll）

## title_zh

每月300刀，连一个 Agent 都建不出来？

## one_sentence_thesis

2026 年自学 AI 真正的瓶颈不是花没花钱，而是顺序——把"调 API、写 Prompt"放在"自己手写一遍神经网络"之前的人，会变成永远在 copy-paste 代码却不知道为什么的工程师。

## why_this_video_exists

这条视频提供两层观众在别处拿不到的认知：

第一，揭穿 2026 年付费 AI 课程的灰色现实——真正在造 AI 的公司（Anthropic / OpenAI / Google）现在自己发免费课带证书；同时 GitHub 上有 95000 星、45000 星、40000 星量级的免费 repo 教得比付费课更好。一个"我曾经每月烧 300 美元买证书但什么都建不出来"的亲历者把账算清楚。

第二，揭穿大多数 AI 自学路线的隐藏 bug——它们都是平铺的资源清单。这份路线图反过来主张**顺序是核心**：第 3 步 ML 数学基础和第 4 步 Karpathy 手写神经网络放在第 5 步 LLM/Prompt 和第 6 步 Agent **之前**。跳过的人会变成"会调 API 但 debug 不了模型"的人。

## judgment_lines

- 真正在造 AI 的公司，比卖 AI 课的公司更愿意把课免费给你 — 来源：Anthropic Academy 16 门免费带证书课、OpenAI Academy、Google AI Professional Certificate、IBM ML（Coursera audit 模式）全免费，而作者之前每月烧 $49 Coursera Plus + $39 DataCamp + $199 Udemy bundle 学不会东西。
- 在 2026 自学 AI 最贵的不是钱，是顺序错乱 — 来源：作者把"Rule 1: Don't skip ahead"列为第一条铁律，并明确说"跳过梯度直接学 LLM 的人会写自己看不懂的代码"。
- "会调 Claude API"和"懂模型"不是同一件事，市场为后者多付 $150K+ — 来源：原文 Step 3 明说"公司给会 debug 模型的人付 $150K+，不是给会调 API 的人"。
- Karpathy 那 7 节课不是补充资料，是分水岭 — 来源：原文把 nn-zero-to-hero 列为 Step 4 Primary，要求 Week 6–8 每天一节，手写 micrograd / makemore / nanoGPT，"the payoff: you build a transformer"。
- MCP 是 2026 Agent 标准，不学等于错过 Agent 浪潮的接口层 — 来源：原文 Step 6 明确称 MCP 为"the 2026 standard for agent tool-use"，并将 Anthropic 两门 MCP 课列为 Deep Dive。

## evidence_map

- [具体数字] 作者每月烧 $49 Coursera Plus + $39 DataCamp + $199 Udemy bundle，总额接近 $300/月，最后什么都建不出来。
- [具体数字] 14 周从零到部署真实 AI 系统：Week 1–2 基础，Week 3–5 ML，Week 6–8 深度学习，Week 9–10 LLM，Week 11–12 Agent，Week 13–14 生产化。
- [具体数字] microsoft/generative-ai-for-beginners 95000+ stars，21 lessons；microsoft/ML-For-Beginners 44900+ stars，12 周课程压缩成 3 周每天两课；mlabonne/llm-course 40000+ stars；microsoft/AI-For-Beginners 35K stars。
- [具体数字] 2025 WEF 分析：AI literate 工作者薪资溢价 15–22%。
- [具体数字] 职业路径：Junior AI Engineer $80–120K → Prompt/Agent Engineer $120–180K → AI Product Engineer $150–250K。
- [具体名字+具体角色] Andrej Karpathy 前 Tesla AI Director、OpenAI 联合创始人，nn-zero-to-hero 用纯 Python + 数学不用任何框架手写神经网络。
- [具体工具栈] 全部免费工具堆栈：Python + VS Code + Git + Obsidian + Ollama；账号：Anthropic Academy + OpenAI Academy + Google AI + Coursera audit。
- [具体技术名] MCP（Model Context Protocol）是 Anthropic 开放标准，是 2026 Agent 工具接入标准；LangGraph 是最流行的多步 Agent 编排框架。
- [具体反向操作] 第 4 步并行实验：一边在 nanoGPT 里训练自己 1000 万参数模型，一边在终端跑 `ollama run llama3.2:3b`，亲眼看 3B 参数 vs 1000 万参数的输出差距。
- [具体项目] Week 10 项目：用 ChromaDB / LanceDB 在自己的 Obsidian 笔记上建 RAG——给自己的"第二大脑"再建一个"第二大脑"。
- [具体停顿点] 每个 Step 末尾有 Checkpoint。做不到就回去，不是建议是规则。
- [具体反对] Coursera 付费按钮下面有个小小的"Audit this course"链接——可以拿到全部视频和材料免费，但拿不到 Coursera 证书。原文教你不要 Coursera 证书——直接拿 Anthropic / OpenAI / Google 自己签的。

## non_obvious_points

- **路径顺序比资源清单重要 100 倍** — 为什么不显而易见：所有人都在列"学 AI 的 30 个免费资源"，但没人告诉你哪个先哪个后。这份路线图把 ML 数学（Step 3）放在 LLM/Prompt（Step 5）之前，把 Karpathy 手写神经网络（Step 4）放在调用 Claude API 之前——这恰恰跟 99% 的"快速上手 AI"教程的顺序相反。
- **"真正造 AI 的公司"比"卖 AI 课的公司"更愿意免费教** — 为什么不显而易见：直觉是 Anthropic / OpenAI 应该把训练材料藏着卖钱。现实是它们开免费学院发证书，而 Coursera Plus、DataCamp、Udemy 这些"教育公司"在收订阅费教二手内容。原因是免费课对 Anthropic 是生态投资，对 DataCamp 是核心商品——所以激励完全相反。
- **建一个 RAG 到自己的笔记上是 Week 10 项目，不是 Day 1 玩具** — 为什么不显而易见：网上一大堆"5 分钟做个 RAG"教程让人以为 RAG 是入门级 demo。这份路线图把它放在 LLM Architecture / 量化 / 评测之后，因为没有这些前置知识，你建出来的 RAG 是黑盒——出问题完全不会修。

## tradeoffs_and_limits

- **14 周需要每周 10–15 小时的持续投入** — 具体表现：每个 Step 有 Checkpoint，"做不到就回去"是规则不是建议。意味着真实成本不是 $0 而是 140–210 小时人力。这条路线图反对"刷视频拿证书"，要求"建到能交付"——所以"免费"只对愿意花时间的人成立。
- **学完仍需"维护模式"** — 具体表现：原文最后给的 weekly ritual（周一查 release notes、周三读 paper、周五看视频、月度做小项目）每周还要再投 1 小时。AI 14 周学不完，是学到能持续学习。

## what_to_leave_out

**不该进入的素材：**

- 详细的 Obsidian 文件夹结构（太细节，观众听不动 12 行目录树）
- 部署平台的具体列表（Gradio / Streamlit / Vercel 是 Step 7 细节，跟核心 thesis 关系不大）
- Maintenance Mode 的具体周一/周三/周五安排（用一句话带过即可）
- 完整资源清单第二遍重复（原文最后那个 Resource List 是 reference 不是叙事素材）

**应避免的叙事方向：**

- 不要变成"14 周学习计划详细解读"——这会让视频变成教程，而 thesis 是"顺序决定一切"
- 不要把全片框架建立在"$300/月 vs $0"这一组对比上——这是 Hook 钩子，不是全片主轴。主轴是顺序与"真正造 AI 的公司在免费教"
- 不要逐 Step 复述（Step 1 装什么、Step 2 学什么……）——这是 PPT 目录不是叙事
- 不要把作者塑造成"省钱博主"——他是"路径设计师"，亲身踩过坑给出顺序的人

## signature_line

学 AI 在 2026 年最贵的不是订阅费，是把第五步当成第一步的代价。

## hot_keywords

- **Agent** — 全文核心概念之一，Step 6 整段在讲 Agent 架构、工具使用、多步 workflow，Final Project 是构建一个 MCP + Claude 的真实 Agent。
- **MCP** — Step 6 Deep Dive 章节核心，原文称为"the 2026 standard for agent tool-use"，列出 Anthropic Academy 两门 MCP 课作为必修。
- **Claude Code** — 原文未直接出现"Claude Code"，但 Anthropic / Claude API / Claude prompt engineering 文档反复出现。可在视频中用"Anthropic / Claude"作为锚点，不强行套 Claude Code。
- **Codex** — 原文未出现，不要硬塞。
- **AI Engineer** — 标题核心词，"Zero to AI Engineer"，并在 Career 段落明确列出 Junior AI Engineer / Prompt-Agent Engineer / AI Product Engineer 三档薪资。
- **RAG** — Step 5 Week 10 Project 是核心：在自己 Obsidian 笔记上用 ChromaDB / LanceDB 建 RAG；Step 7 有 RAGAS 评测对应。
