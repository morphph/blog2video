# Insight Memo: Garry Tan 的 GBrain 与 Meta-Meta-Prompting

## title_zh
10 万页大脑：他凭什么 40 分钟干完 40 小时？

## one_sentence_thesis
个人 AI 真正的护城河不在用哪个模型、写多巧的 prompt，而在你是否把自己的人生（关系、阅读、会议、判断）持续编译成一个会复利增长的结构化数据资产——模型只是发动机，数据和 skill 才是车本身。

## why_this_video_exists
绝大多数关于"AI agent"的内容停留在 prompt 技巧、工具对比、或"我用 ChatGPT 提升了 10 倍效率"的口号层面。这篇博客罕见地公开了一个 5 个月内真正跑起来、且作者愿意全部开源的"个人操作系统"的具体架构与数据规模：10 万页结构化知识、100+ skill、100+ cron、97.6% LongMemEval recall。它给出了一个可被验证、可被模仿、可被反驳的具体样本——而不是又一个"未来已来"的玄学。它还揭露了一个反直觉的失败模式：第一版 book-mirror 把作者父母写成已离婚、把出生地写错，如果直接分享会摧毁信任。这种"具体到能复盘"的细节，是其他 AI 内容拿不到的。

## judgment_lines
- "Agent 真正的瓶颈不是模型能力，而是模型周围的数据厚度和 skill 厚度" — 来源：同一批 SOTA 模型，普通人用是 chat 窗口，Garry 用是 40 分钟产出 3 万字个性化 brain page，差距来自 10 万页累积的 brain 和 100+ skill，而不是 prompt 技巧
- "个人 AI 的护城河是私有数据的复利，不是公司给你的工具" — 来源："the future belongs to individuals who build compounding AI systems, not to individuals who use corporate-owned centralized AI tools"——20 本书 mirror 之所以越做越好，是因为第二本知道第一本，第二十本知道前十九本
- "Skill 才是真正的 prompt——把一次性的 prompt 工作转化为可复用的资产" — 来源：作者明确说"当有人问我怎么 prompt 我的 AI，答案是：我不 prompt。skill 就是 prompt"；skillify 是一个生成 skill 的 meta-skill，第一次手动做完 book-mirror 后被自动萃取成可复用 skill
- "Thin harness + Fat skills + Fat data 是个人 AI 的正确分层，不是相反" — 来源：OpenClaw 只有几千行路由逻辑、不知道书或会议是什么；复杂度全部下沉到 skill 和数据；这与 LangChain "给你哑铃却不给训练计划"的批评形成镜像对比
- "Cross-modal eval 比单模型自评更能抓住 AI 的特定失败模式" — 来源：Opus 4.7 1M 抓精度错误，GPT-5.5 抓缺失上下文，DeepSeek V4-Pro 抓"读起来太泛"——这是同一篇内容的不同失败维度，单一模型作为裁判会有盲点

## evidence_map
- [具体数字] 10 万页结构化 brain pages，覆盖每个人、公司、会议、书籍、文章、想法
- [具体数字] 100+ skill，全部为自包含的 markdown 文件
- [具体数字] 100+ cron job 7×24 运行（社交媒体、邮件、Slack 等的自动 ingestion）
- [具体数字] 单次 book-mirror 产出 3 万字 brain page，耗时约 40 分钟
- [对比数据] 40 分钟 vs $300/小时的治疗师 40 小时——后者即便读同一本书也做不到同等深度，因为缺少完整的个人语境图谱
- [具体数字] When Things Fall Apart：162 页、22 章 → 全部被切片，每章双栏（作者观点 + 与作者人生的具体映射）
- [具体数字] 已完成 20+ 本书的 mirror（Pema Chödrön、Bertrand Russell、Hamming、Feynman、Alan Watts、Ken Wilber、Hesse 等）
- [具体数字] GStack 开源项目 87,000+ star
- [具体数字] GBrain 在 LongMemEval 上 recall 97.6%，且检索环节里没有 LLM，超过 MemPalace
- [具体数字] GBrain 一键安装、自带 39 个可安装 skill
- [具体 bug 场景] 第一版 book-mirror 出现 3 个事实错误：说作者父母离婚（实际没有）、说他在香港长大（实际生于加拿大）——如果在生成时直接外发将摧毁信任
- [具体修复] 修复方式是引入 mandatory fact-check 步骤 + cross-modal eval：Opus 4.7 1M 抓精度、GPT-5.5 抓缺失、DeepSeek V4-Pro 抓"太泛"
- [具体场景] Demis Hassabis 来 YC 做 fireside chat，系统 2 分钟内拉齐：Demis 的全部 brain page、AGI 时间线立场（"50% scaling, 50% innovation"，5-10 年）、Mallaby 传记重点、3 个多跳 demo 脚本、对话话题钩子
- [具体机制] 每次会议结束后 entity propagation：系统遍历所有被提到的人和公司，把会议内容写回他们的 brain page——会议页本身不是产物，传播才是
- [一手引用] "This is not a writing tool. It's not a search engine. It's not a chatbot. It's a second brain that actually works, not as a metaphor, but as a running system"
- [一手引用] "The model is just the engine. Everything else is the car."
- [一手引用] "The difference between having a filing cabinet and having a nervous system."
- [开源事实] 全部架构开源：github.com/garrytan/gbrain，含 GStack（coding framework）、GBrain（知识基础设施）、OpenClaw / Hermes Agent（harness）

## non_obvious_points
- "Entity propagation"比"会议笔记"重要得多 — 为什么这不显而易见：大多数人把会议 AI 的价值定义为"生成更好的会议总结"，但 Garry 明确说会议页不是产物，把会议信息传播回每个被提及的人和公司的 brain page 才是——这是把"会议"这个一次性事件转化为多个关系页的复利更新，本质是数据结构的胜利，不是 summary 质量的胜利
- 第一版必须烂，否则 skillify 没东西可萃取 — 为什么这不显而易见：直觉上你想一开始就设计好 skill 架构；但 skillify 是从"手动做完一次"提取重复 pattern，没有第一次烂的手动版本就没有可提炼的 skill。这把"第一版很烂"从风险变成必要环节
- 模型可互换、harness 可瘦化，意味着今天看起来强的 AI 公司其实在卖发动机 — 为什么这不显而易见：大量投资和注意力流向"哪个模型更强"，但 Garry 用 Opus / GPT-5.5 / DeepSeek / Groq Llama 按任务调度——模型层完全可商品化，真正不可复制的是你私有的 10 万页 brain 和 100+ skill。这暗示个人 AI 的竞争维度已经转移，但绝大多数用户还在比模型

## tradeoffs_and_limits
- 极高的个人语境暴露成本 — 具体表现：要让系统真正有用，必须把家族史（移民、父亲来自港新、母亲来自缅甸）、治疗记录、与兄弟的对话、19 岁与室友的 IM、深夜笔记全部录入。这是一种近乎极端的隐私 surrender，且数据集中在一处一旦泄露后果严重
- 时间和工程投入门槛非常高 — 具体表现：作者作为 YC CEO 仍连续 5 个月凌晨 2 点写代码，跑 100+ cron、写 100+ skill；普通人复制这套系统不是"装一个 app"，是要承担一个长期工程项目的运维
- Cross-modal eval 依赖多家前沿模型同时可用，存在脆弱性和成本 — 具体表现：精度 / 召回 / 创造性三个维度分别绑定 Opus 4.7 1M、GPT-5.5、DeepSeek V4-Pro。任一供应商断供、涨价、能力倒退或政策变化都会动摇这个评估栈，且每次 mirror 都要跑多个模型，成本不可忽略
- 第一版必须烂的工作流隐含信任风险 — 具体表现：早期 skill 产出会有事实错误（如父母婚姻状况错误、出生国错误），如果在 fact-check skill 成熟前就把内容外发，会直接破坏关系。换句话说，这个系统在"达到可信"之前有一段必须独自承担错误的潜伏期

## what_to_leave_out

### 不该进入的素材
- Garry 的具体家族成员名字（哥哥 James、19 岁室友、治疗师等私人细节）—— 与核心 thesis 无关，且观众无法验证，容易把视频引向"窥探名人生活"
- 五篇系列前作的具体标题（"Fat Skills, Fat Code, Thin Harness"、"Resolvers"、"The LOC Controversy"、"Naked models are stupider"、"The skillify manifesto"）—— 仅作为背景，不展开会让信息密度更高
- LangChain "raised $160M" 的吐槽 —— 离题，容易被解读为带节奏
- 完整的 20 本书清单 —— 用 "20+ 本书" + 1-2 个有代表性书名即可，逐本念会拖节奏
- 具体的部署技术栈（Tailscale、Render、Railway、Pi）—— 太教程化，与"为什么这件事重要"的判断主线无关
- 1.1M views / 9.6K bookmarks 的传播数据 —— 不要拿来当论据，那是社交证明不是认知证据
- 39 个可安装 skill 的清单细节 —— 提总数即可，不要逐个介绍 enrich / media-ingest / perplexity-research

### 应避免的叙事方向
- 不要把全片框定为"Garry Tan 是个工作狂"的人物特写——这会把结构性洞察（skill / 数据复利 / harness 分层）降级为"成功人士的勤奋"，是这篇内容最容易被误读的方向
- 不要写成"3 个工具教你打造第二大脑"的教程贴——这正是作者明确反对的"chat window 思维"，且会让 thesis（compounding 私有数据）消失在工具清单里
- 不要把核心数字（10 万页 / 40 分钟 / 97.6% recall）作为全片唯一锚点反复回放——数字是证据不是论点，反复念会让观众记住数字、忘了判断
- 不要做成"vs ChatGPT"的对立叙事——作者并不反对 LLM，他反对的是把 LLM 当 chat 窗口而不当 OS，对立面是"使用方式"不是"具体产品"
- 不要绕开 tradeoffs 只讲爽点——尤其是隐私暴露成本和"第一版必须烂"的代价必须保留至少一条，否则视频会沦为推销
- 不要让观众以为这是一个"装一下就能用"的开源项目——必须传达出长期工程投入和数据复利的本质

## signature_line
你以为大家在比谁的模型更强，他已经悄悄把自己的 10 万页人生编译成了一辆只属于自己的车——模型是发动机，但车不是你的，发动机再强也没用。
