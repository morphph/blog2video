# Insight Memo: How to Actually Use Claude — 18 Steps

## title_zh
你用 Claude 的方式，决定了它的 90%

## one_sentence_thesis
大多数人用 Claude 用得很差，不是因为 Claude 不行——是因为他们把它当搜索引擎用、每次重新自我介绍、从不让它先反问，最后只榨出了 10% 的价值。

## why_this_video_exists
这篇文章不是再列 Claude 的隐藏功能（那是上一期的事），而是回答一个更尴尬的问题：**就算你知道功能在哪里，你用 Claude 的方式本身就在浪费它。** 它把"会用 Claude"拆成 18 个可执行的姿势矫正——其中至少 6 个（"让 Claude 先反问你"、"让 Claude 帮你写 prompt"、"风格克隆"、"指定输出长度"、"删掉 preamble"、"换新话题就开新 chat"）是大多数日活用户从没意识到的操作习惯。这是一份**使用工程学**的清单，不是功能清单。

## judgment_lines

- "把 Claude 当搜索引擎用，等于把它的价值砍掉 80%" — 来源：原文明确说"It is a thinking partner. It doesn't just pull information, it reasons, synthesizes, argues, and builds on context. The moment you treat it like a search engine, you cut its usefulness by 80 percent."
- "好的输出不是因为你问得好，是因为 Claude 反问得好" — 来源：步骤 5"让 Claude 先反问你 5 个问题再开始"，原文论点是"output is dramatically better because it's built on the right foundation"
- "Claude 默认替你想'多写一点更稳'，但这恰恰是它写得啰嗦的根因" — 来源：步骤 10 指定输出长度可以削 40-60% 的 token，且不损失你真正需要的价值
- "你每次新开聊天重新自我介绍，是在用 token 给自己制造一个会随规模放大的坏习惯" — 来源：步骤 12 直接把这件事框定为"trains yourself into a habit that costs you more as Claude usage scales"
- "AI 写出来一股 AI 味，不是模型问题，是你没给它你自己的样本" — 来源：步骤 6 风格克隆——没有样本时 Claude 默认写自己的腔调

## evidence_map

- [类型: 一手引用] 原文开篇："Claude 出来两年了，每天用它的人大部分还在用它的 10%。"
- [类型: 具体数字] 把 Claude 当搜索引擎用，价值砍掉 **80%**（原文判断）
- [类型: 具体数字] 步骤 10 指定输出长度，**40 到 60 percent** 的 token 削减——"without losing any of the value you actually need"
- [类型: 具体操作流程] 步骤 1：Claude → Projects → 新建项目 → 命名 Work / Personal
- [类型: 具体 prompt] 步骤 5 的反问 prompt 是一个**短得吓人**的杠杆："Before you start, ask me the 5 most important questions that would help you do this well. After I answer, then begin."（不到 30 词，但改写整个交互结构）
- [类型: 具体 prompt] 步骤 11 删 preamble 是一条加进 Custom Instructions 就永久生效的规则——"Never start responses with preamble, affirmations, or restatements of my question. Go directly to the answer."
- [类型: 具体技术名称] Projects、Custom Instructions、Project Instructions、Knowledge Base、Extended Thinking（brain icon）
- [类型: 反直觉对比] 步骤 4 的两个 prompt 对比：
  - 差："What is prompt caching?"（让 Claude 背定义）
  - 好："I'm building a workflow that calls Claude 20 times per session. Walk me through how prompt caching works and whether it would actually reduce my costs given that context."（给 Claude 一个跟你一起解决的问题）
- [类型: 具体技巧] 步骤 9 "Claude writes prompts for Claude"——不会写 prompt 时让 Claude 帮你写 prompt（包含 role / context / format / constraints）
- [类型: 具体技巧] 步骤 7 "Attack, not critique"——叫 Claude 攻击你的方案，先 destroy 再 steelman，再说它真的想法

## non_obvious_points

- **"让 Claude 先反问你"几乎没人用，但是 18 个里面性价比最高的一个。** — 为什么这不显而易见：大多数人的直觉是"我问得越清楚，Claude 答得越好"。这是对的，但不够。让 Claude 反问你 5 个最重要的问题，意味着 Claude 自己挑出它**最缺的那 5 个信息**——这比你猜它需要什么准得多。

- **"指定输出长度"省的不只是钱，更是注意力。** — 为什么这不显而易见：大家以为限制长度是为了省 token / 省 API 费用。但原文的真正逻辑是：你读不完的部分本身就是噪声，**它不只是浪费 Claude 的输出能力，也在浪费你的注意力**。一句 "Answer in 3 sentences maximum" 同时优化了输出端和接收端。

- **"删掉 preamble"是一次性永久收益。** — 为什么这不显而易见：很多人把"Great question, let me break this down"当成 AI 的语言习惯接受了。但只要写进 Custom Instructions 一次，它在这个 Project 里就**再也不出现**。这是少数"写一次、终身受益"的设置。

## tradeoffs_and_limits

- **18 步的"一次性 setup"成本是真实的。** 写背景模板、生成 Custom Instructions、跑一遍风格克隆、把"删 preamble"规则写进去——认真做一遍至少 30 分钟到 1 小时。如果你只是偶尔问 Claude 一两个问题，这套设置的回本周期会很长。文章的隐含前提是"你每天都在用 Claude"，对低频用户来说这套姿势矫正的优先级要降。

- **"让 Claude 攻击你的方案"是高强度操作，不适合所有人。** 步骤 7 让 Claude 不带任何限定地 destroy 你的计划。这对真正想压力测试的人是必要的，但对脆弱期的决策（你已经焦虑，只是想要一个有人陪你想一遍的过程），它会**反而压垮你**。要分清"我要 sparring partner"和"我要 thinking partner"——文章把它们分开了（步骤 7 vs 步骤 17），但很多人会用错。

- **"风格克隆"克隆的是表层模式，不是判断力。** 给 3-5 段你的写作让 Claude 学，它能复制句长、节奏、用词偏好——但它学不到你为什么这样写。所以风格克隆做出来的稿子读起来像你，**但说不出你会说的话**。它适合大量、低决策内容（邮件、社媒草稿），不适合代表你立场的核心稿件。

## what_to_leave_out

**不该进入的素材：**
- 步骤 15（旅行规划）、步骤 16（账单分析）这两条是消费向 use case，跟核心 thesis"使用工程学"关系弱，提一两句举例可以，不要展开。
- 步骤 2 那个详细的"姓名/职业/责任/目标"背景模板，不要在视频里把每一行都念一遍——讲清楚"它干什么、放在哪里、为什么有效"就够了。
- 步骤 14 Feynman 方法是个独立技巧，可以提，但不展开。
- 步骤 17（personal thinking partner）和步骤 18（stress-test business idea）跟前一期的 Personal Psychologist / Devil's Advocate 是不同 prompt 但同一思路的衍生，不要花太多时间，一笔带过即可。

**应避免的叙事方向：**
- **不要把它讲成"Claude 18 个使用技巧"清单**。这是 PPT 目录式叙事，会让观众听完忘了。要抓真正的 thesis："你用 Claude 的方式本身在浪费它"——然后用 5-6 个最反直觉的步骤撑起来。
- **不要重复上一期的内容**。上一期讲的是 Projects / Memory / Cowork / Skills / Claude Code 这些**功能在哪里**。这一期讲的是**功能就在那里，但你的使用姿势是错的**。两者要明确切割，最好在视频里有一句话点出这个对比。
- **不要按 1-18 顺序讲**。原文按章节分了 5 个块（Start Here / Claude Is Not What You Think / What Even Regular Users Don't Know / Tokens / Ready to Use Right Now），跟着原文章节走更自然，但要挑出 5-6 个最反直觉的点重点展开，其他一笔带过。
- **不要把 Hook 写成"AnatoliKopadze 又写了一篇关于 Claude 的文章"**。作者只在 Hook 中嵌入一次，主体叙事不再提。

## signature_line
你以为你在问问题，其实你在浪费一个能跟你一起想问题的伙伴。

## hot_keywords

- **Claude Code** — 原文没直接讲 Claude Code（那是上一期的内容），但热词清单里包含它，可以作为对比锚点出现一次。
- **Skills** — 原文未明显出现。
- **MCP** — 未出现。
- **Subagent** — 未出现。
- **Context Engineering** — 原文虽未用这个词，但**整篇文章的核心动作就是 context engineering**：把你的背景写进 Projects，让 Claude 反问你补齐 context，删掉无关的 preamble noise，新话题开新 chat 避免 context bleed——这些都是 context engineering 在个人使用层面的具象化。Hook 或 Synthesis 可以用这个词作为认知拔高点。
- **Custom Instructions / Projects** — 全文的物理载体，不是 hot keyword 但是文章的核心机制。
