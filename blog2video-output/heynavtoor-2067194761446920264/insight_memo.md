# Insight Memo: Stanford STORM 四提示词复刻法

## title_zh

斯坦福 STORM：4 个提示词压缩 40 小时

## one_sentence_thesis

STORM 的真正突破不是某个算法，而是**用 5 个对抗性视角替代单一提问**——这套方法之所以能让 Claude 写出"PhD 级"研究简报，是因为单一提示拿到的永远是多数派叙事，而真知识住在视角之间的冲突里。

## why_this_video_exists

大多数关于"用 AI 做研究"的内容停在"会写 prompt"层面，没人讲清楚为什么单一 prompt 在结构上必然失败。这篇博客提供了三个别处拿不到的东西：（1）斯坦福 NAACL 2024 论文里的具体量化数字（多视角法比单提示法**多 25% 组织度、多 10% 覆盖广度**）；（2）一个可即时复用的 4-prompt 模板，把 PhD 学生 40-60 小时的工作压到 5 分钟；（3）作者点破了 STORM 论文里 Stanford 自己承认的两个失败模式（source bias 和 fact misassociation），并用 Prompt 4 把它修补回来——这一步是开源 STORM 工具本身都没做的事。

## judgment_lines

- "单一 prompt 拿到的是多数派叙事，不是知识" — 来源：原文 Phase 2 指出问 "tell me about X" 永远只得到 the majority view, the most common framing, the surface；practitioner / skeptic / economist / historian / academic 这五种视角在同一话题上"看到的是完全不同的东西"
- "知识不住在共识里，住在视角间的冲突里" — 来源：Phase 4 Prompt 2 明确把"对抗映射"独立成一步——"The fights are where real understanding lives"；如果 5 个视角都同意，那大概率是真的（包括反对者都确认）；如果没人讨论某话题，那是整个领域的盲区
- "Stanford 自己承认 STORM 不会自我批判——这恰恰是 4-prompt 复刻法比原系统更强的地方" — 来源：Phase 6 明确写"Stanford's own researchers flagged it. The system does not self critique. Source bias and fact misassociation sneak in"，Prompt 4 通过让 Claude 给自己打置信度分、识别被过度代表的视角、找缺失的第 6 个角度，把这个缺口补上
- "今天的 18 个月窗口期不是技术红利，是认知工艺差距" — 来源：原文末尾"In 18 months, this kind of workflow will be baked into every tool. The edge will be gone"——作者明确把这定义为短暂的认知不对称，不是工具不对称
- "PhD 学生需要 40-60 小时不是因为他们慢，是因为这件事本质上需要那么久" — 来源：Phase 7"Not because they are slow. Because reading from 5 angles, mapping contradictions, synthesizing, and self critiquing is genuinely a 40 hour job for one human brain"——这条判断把"加速"重新定义成"承认任务本身的结构性复杂度，然后用并行视角压缩它"

## evidence_map

- [具体数字] 斯坦福 NAACL 2024 论文：多视角法产出的文章比次优方法**organized 25% 更高、coverage 10% 更广**
- [具体数字] PhD 级研究任务在人脑中需要 **40-60 小时**；4-prompt 法压到 **5 分钟**；其中 Prompt 1 输出 5 视角约 **60 秒**，Prompt 3 输出 PhD 学生需 48 小时的简报只需 **90 秒**，Prompt 4 同行评议 **60 秒**
- [具体事实] STORM = Synthesis of Topic Outlines through Retrieval and Multi-perspective Question Asking，2024 年 NAACL 发表，作者是 Stanford OVAL Lab
- [具体事实] 开源代码在 github.com/stanford-oval/storm，MIT 协议；在线版 storm.genie.stanford.edu，免费且免注册
- [具体事实] 作者明确指出 4 个 prompt 的具体功能分工：① Multi-Perspective Scan ② Contradiction Map ③ Synthesis ④ Peer Review
- [具体 bug 场景] STORM 系统的两个已知失败模式：**source bias**（信源偏见）和 **fact misassociation**（事实错配）——Stanford 研究者自己承认 STORM 不会自我批判，Prompt 4 用置信度评分（1-10）+ 偏见检查 + 缺失视角识别来修补
- [对比数据] 五种视角各自看到什么：Practitioner 看实战盲点，Academic 看同行评议证据，Skeptic 看反方最强论点，Economist 看资金流向，Historian 看历史平行案例
- [一手引用] "If all 5 perspectives agree, it is probably true. If nobody addressed a topic, you just found the gap in the entire field."（Phase 4 原文 block quote）
- [一手引用] "We are in an 18 month window. The people who learn how to research with AI properly will out think the people who do not. By a lot."（结尾段）
- [推特数据] 博客在推特上的传播量：64 replies / 544 reposts / 3.5K likes / 12.1K bookmarks / 1.68M views——bookmarks > likes × 3 表明这是一篇被收藏型内容

## non_obvious_points

- "用 4 个 prompt 复刻 STORM 比直接用 STORM 工具更强" — 为什么这不显而易见：直觉是"既然 Stanford 有开源工具和在线版，那一定比 4 个提示词靠谱"。但作者揭示了反向真相——开源 STORM 自己不做自我批判（Stanford 公开承认），而 Prompt 4 让 Claude 给自己打分、识别偏见、找盲点，这一步本质上把 4-prompt 法升级到了原系统都没有的层次。**复刻品比正品多了一道工序。**
- "Prompt 2（找冲突）才是整个方法的认知分水岭，但绝大多数人会跳过它" — 为什么这不显而易见：从表面看，Prompt 1（5 视角）已经"信息量很大"，Prompt 3（综合）"才是产出"，所以中间这一步看起来像可选的过渡。但作者明确点出 "Most people skip this step. It is the step that separates surface understanding from real expertise"——5 视角放在一起还是 5 段并列的内容；找出它们打架的地方，才是从信息到理解的相变点
- "盲区不在 5 视角讨论的内容里，恰恰在 5 视角都没讨论的内容里" — 为什么这不显而易见：人们做调研时会下意识相信"我已经覆盖了多个角度，所以视野是全的"。但 Prompt 2 第 5 问"What topic did NONE of the perspectives address?" 把"沉默"当成最有价值的信号——整个领域的盲点往往不是某派观点，而是连论战的人都没想到要谈的东西

## tradeoffs_and_limits

- **方法本身继承了 LLM 的幻觉风险** — 具体表现：Stanford 论文承认 STORM 有 source bias 和 fact misassociation；4-prompt 法虽然用 Prompt 4 做自检，但 LLM 给自己打的置信度分本身也可能错。"60 秒的同行评议"在结构上不能替代真人同行评议——它只能压低明显错误的概率，不能保证零错误
- **"5 分钟拿到 40 小时成果"的承诺有边界** — 具体表现：方法能压缩"读 + 综合 + 自检"这三步，但前提是 LLM 训练数据里覆盖了这个话题。前沿话题、本地化深度议题、或需要原始文献阅读的研究，5 分钟拿到的还是 LLM 已有知识的重组，不是新证据
- **18 个月窗口期意味着这是一份"过期红利"** — 具体表现：作者自己点破——这套工作流再过 18 个月会被烤进所有工具，今天的认知优势会消失。这不是缺陷，是诚实——但听众需要听到"这不是长期护城河"的提醒，避免把它当成可持续竞争优势来定位

## what_to_leave_out

**不该进入的素材**：
- "Phase 8: 7 Ways to Use This Starting Today" 那 7 个应用场景（写文章、商业决策、面试、投资、学新技能、谈判、做演讲）— 原因：太像 listicle 营销话术，会稀释核心机制叙事；7 个场景平铺也撑不起视频节奏
- "The Persona Block" 整段（"You are someone who reads..."）— 原因：是博客作者的自我营销定位话术，对核心方法论无贡献
- STORM 在线版 URL 和 GitHub 地址 — 原因：视频观众记不住 URL；作者自己也说 "You do not need any of it"，开源工具不是这次视频的重点
- 12 分钟 YouTube 走读视频的存在 — 原因：与"无需任何工具"的论点矛盾，且对核心机制无支撑

**应避免的叙事方向**：
- **不要把全片建立在 "25%" 这一个数字上**——这个数字是引子，不是结论；核心是 5 视角对抗的机制本身，否则会变成"念论文摘要"
- **不要写成 prompt 教程**——观众不需要逐条听 4 个 prompt 的具体英文模板，那是博客文字版的优势，不是视频的优势；视频要讲的是"为什么这 4 步缺一不可"
- **不要把"5 分钟 vs 40 小时"框成生产力鸡汤**——重点不是"省时间"，是"承认调研任务的结构性复杂度，然后用并行视角压缩它"
- **不要被"Stanford 出品"带跑成权威背书叙事**——核心不是"Stanford 说有用所以有用"，核心是这套方法揭示了单 prompt 失败的结构性原因
- **不要忽略 tradeoffs**——必须保留"LLM 给自己打分本身也可能错" + "18 个月窗口期会关上"这两条，否则就是不诚实的爽文

## signature_line

单一 prompt 给你的是多数派叙事，5 个对抗视角才给你知识——而知识住在视角打架的地方。

## hot_keywords

- **无明显当前热词**（Claude Code / Context Engineering / Agent Harness / Codex / MCP / Skills / /goal / Computer Use / Subagent 均未在原文出现）— 原文是面向 Claude 普通用户（非 Claude Code 用户）讲 prompt 工作流，热词清单上的工程化概念都不适用
- **Claude**（普通对话产品，非 Claude Code）— 原文核心载体，从头到尾"paste into Claude"
- 可作为替代锚点的非热词高密度概念：**STORM**（专有方法名，可直接用作 Hook 钩子）、**斯坦福 / NAACL 2024**（权威背书锚点）、**25% / 40 小时 → 5 分钟**（震撼数字锚点）、**PhD 级研究**（身份对照锚点）
