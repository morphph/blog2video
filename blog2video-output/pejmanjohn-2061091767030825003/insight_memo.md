# Insight Memo: Stop Giving Every Agent Its Own Skull

## title_zh
你用的几个 Agent，没一个真的认识你

## one_sentence_thesis
真正的 Agent 瓶颈不是模型能力，是每个 Agent 都被困在自己的"颅腔"里——记忆是按工具切片的，而本该按"人"切片。

## why_this_video_exists
绝大多数关于 Agent 记忆的讨论都在单个 Agent 内部展开（Session、State、Memory 分层），但 Pejman 把视角抬高了一层：当一个人同时用 OpenClaw、Codex、Claude Code 等多个 Agent 时，每个 Agent 都得从零认识你一次。这不是"Agent 记忆没做好"，而是"记忆该归 Agent 还是该归人"的架构选择题。
更关键的一个非显而易见判断——repo 不是 memory，因为 repo 只保留了结论，丢掉了你和 Agent 在会话里探索过、剪掉、几天后又想捡回来的那些"死枝"，而那些死枝才是真正决定下一次怎么干的信息。这个角度多数关于 Agent 记忆的内容都没讲。

## judgment_lines
- "每个 Agent 都有自己的颅腔" 是软件在复制人类最大的缺陷 — 来源：原文核心比喻"knowledge lives in skulls, and skulls do not sync"，人类沟通的全部成本来自于信息不能跨大脑同步，而软件本不必如此
- 同步 repo 不能解决问题，因为价值不在结论而在被剪掉的分支 — 来源：作者描述自己回 OpenClaw 说"那个东西我们换种方式做吧"，本质是在重新进入被自己剪掉的 idea tree 分支
- Agent 跨工具协作的真正限制不是模型，是记忆边界 — 来源：作者三个 Agent（OpenClaw 出思路、Codex 写代码、Claude Code 写设计文案）输出"competent and context-blind"，能干活但不懂上下文
- 记忆该属于人，不该属于 Agent — 来源：原文结尾"Many agents with one memory layer underneath them, owned by you"，把记忆所有权从工具厂商手里拿回到用户手里

## evidence_map
- [具体场景] 三个 Agent 各管一摊：OpenClaw 在 Mac Mini 上做个人助理+想法发酵，Codex 在 MacBook Pro 上写代码，Claude Code 做设计与文案——同一个项目跨三台进程三套本地状态
- [对比数据] "repo 通过 GitHub 同步，但项目的记忆不同步"——同一份代码三个 Agent 都看到，但孕育这份代码的对话只留在 OpenClaw
- [一手引用] "The output can be competent and context-blind at the same time."（产出可以同时既能干又无知）
- [具体场景] 用户回到 OpenClaw 说"Remember that thing we talked about? Actually, let's do it that other way"——这是重新调出被自己剪掉、从未写进 markdown 的 idea 分支
- [类比场景] 一个 AI 公司高管同时坐在 10 个会议里：一个会上听到客户对定价困惑，另一个会上产品团队在讨论定价是否清晰，第三个会上销售在解释一单为什么黄了——人类要花几周才能把这些点连起来，Agent 版本可以在会议还没开完时就发现冲突
- [具体项目] @garrytan 的 GBrain 走 MCP 路线，做共享知识图，多个 Agent 查同一张图而不是各存各的
- [具体项目] @doodlestein 的 CASS 不动 repo，专门索引本地会话历史，覆盖 Codex、Claude Code、OpenClaw、Cursor、Aider，让你能跨工具搜会话
- [作者背景] Pejman 是 Magoosh 和 Alo Moves 创始人（Alo Moves 后被 Alo Yoga 收购），现在专门探索 Agent 时代的产品形态

## non_obvious_points
- 你以为 Agent 之间的记忆问题靠"把 markdown 同步"就能解决，但真正的认知价值在会话本身——你跟 Agent 争论过、抛弃过又想捡回来的那些分支，这些从来不会被写进 markdown — 为什么这不显而易见：大多数人把"记忆"等同于"文档"，忽视了"过程"也是记忆的一部分，而且过程往往比结论更值钱
- "Hive mind"（蜂群心智）听起来像 Multi-Agent 协作的术语，但 Pejman 用它指的不是 Agent 互相协调，而是"一个人在用多个 Agent 时它们共享同一个关于你的认知" — 为什么这不显而易见：行业里 hive mind 通常被理解为 Agent 之间的横向协作，但作者把它指向"对用户的统一画像"这个纵向问题，是完全不同的架构含义
- 这不是"Agent 厂商该改"的问题，是"记忆归属权"该被拿回用户手里 — 为什么这不显而易见：人们默认每个 Agent 厂商自己管理你的记忆（OpenAI 记一份、Anthropic 记一份），但作者主张存在一个用户拥有的、跨工具的记忆层，工具反过来读它，这是一个商业格局重构

## tradeoffs_and_limits
- 共享记忆不是"把所有对话都倒出来给所有 Agent"——大量对话是噪音、敏感信息、错误推断、过期内容，或只该留在特定项目/角色里 — 具体表现：作者明确说"a lot of conversation is noise. Some of it is sensitive. Some of it is wrong. Some should expire. Some should stay local to a project or role"，所以这个共享层需要"什么值得留、什么该过期、什么不能跨边界"的全套策略，不是技术上接通就完事
- 当前没有现成的产品方案——只有 GBrain（知识图方向）和 CASS（会话搜索方向）这类早期项目在攻不同侧面，意味着这个层至少还要一年才会形成有竞争力的标准 — 具体表现：原文用"this feels like one of the important areas for development over the next year"表达——是判断方向，不是宣告答案

## what_to_leave_out

### 不该进入的素材
- GBrain 和 CASS 的技术实现细节（知识图怎么建、会话怎么索引）——视频不是产品推荐，只需要点名"这个方向已经有早期玩家"
- 作者 Magoosh、Alo Moves 的创业背景——除非用作 Hook 的权威锚点，否则不必占用正文篇幅
- "human knowledge moves slowly"那段历史性铺垫——口播容易冗长，简化为一句"人类信息传递慢"即可

### 应避免的叙事方向
- 不要把这条视频变成"Memory 三层理论"的复述——yanhua1010 已经讲过 Session/State/Memory 三层，本视频的视角是跨 Agent 共享，不要陷入单 Agent 内部分层
- 不要把"hive mind"翻译为"蜂群智能"然后展开 Multi-Agent 协作的技术架构——作者用 hive mind 指的是"对用户的统一画像"，不是 Agent 间的横向协作
- 不要把全片框架建在"颅腔"这一个比喻上反复回扣——这是好 Hook 但不是好结构，正文需要展开 repo 不等于 memory、hive mind 是用户视角、记忆归属权三层
- 不要走"教程"风格教人怎么搭共享记忆——原文也没给方案，视频应保持"问题诊断 + 方向判断"的姿态

## signature_line
你用的 Agent 越多越能干活，但你这个"人"的画像，反而越来越碎。

## hot_keywords
- Agent — 全文核心概念，作者讨论的是"多 Agent + 单用户"的记忆架构
- Subagent — 原文未出现，不强加
- Memory — 原文 The Repo Is Not the Memory、The Missing Layer 两节都围绕这个词展开
- MCP — 原文在 GBrain 项目处出现一次："shared knowledge graph behind MCP"——是 Agent 互通的底层协议方向
- Claude Code — 原文核心叙事道具之一，作者用 Claude Code 做设计与文案
- Codex — 原文核心叙事道具之一，作者用 Codex 写代码
