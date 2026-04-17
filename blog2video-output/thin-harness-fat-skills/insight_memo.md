# Insight Memo: Thin Harness, Fat Skills

## title_zh
Agent 100 倍生产力的秘密不是模型

## one_sentence_thesis
AI Agent 的能力差距不在模型智能，而在模型外围那层"脚手架"的结构：把判断力写成可复用的 markdown skill，把执行力下沉到确定性工具，harness 本身反而要尽量薄——同样的 Claude，10 倍用户和 100 倍用户之间的区别就在这里。

## why_this_video_exists
这篇文章揭示了一个绝大多数 AI 开发者搞反的架构原则——人们以为要"给 Agent 堆更多工具、更大 context、更智能的 MCP"，但 Anthropic 被泄露的 Claude Code 源码（512,000 行）证明了反直觉的事实：真正的价值在"薄 harness + 厚 skill"，40+ 工具定义、2-5 秒延迟的 God-tool 是反模式。文章还给出了一个罕见的"可以把技能当函数调用"的具体 mental model——同一个 /investigate skill 配不同参数，就能从"分析 210 万封邮件的医疗研究员"变成"追查空壳公司 FEC 文件的法证调查员"。这种"skill 就是带参数的方法调用"的认知大多数人没建立起来。

## judgment_lines

- "同样的模型，10 倍用户和 100 倍用户之间的差距不在智能，在架构" — 来源：Steve Yegge 说用 AI coding agent 的人比用 Cursor+chat 的人生产力高 10x–100x，但两拨人用的是同一个 Claude；差别来自 harness 设计。
- "Agent 失败不是因为模型不够聪明，是因为它不懂你的数据" — 来源：模型本身已经会推理、综合、写代码，真正卡壳的是不懂你的 schema、conventions、问题形状；skill 文件就是补上这层。
- "把确定性工作塞进 latent space 是 Agent 设计最常见的致命错误" — 来源：让 LLM 给 8 个人排座位没问题，给 800 人排座位它会幻觉一张看起来合理但完全错误的表，因为这是组合优化问题，不该放在 latent 层。
- "markdown 是比源代码更完美的能力封装形式" — 来源：skill 描述过程、判断、上下文，这些恰好是模型天然思考的语言；rigid source code 反而表达不了 judgment 的流程。
- "今天的 CLAUDE.md 越厚，模型越笨" — 来源：作者把 20,000 行 CLAUDE.md 砍到 200 行后，模型注意力反而恢复；Claude Code 自己提示他精简。resolver 按需加载，比硬塞 context window 有效得多。
- "如果同一件事你要我做第二次，那是我第一次就失败了" — 来源：作者给 agent 的硬规则——手动做 3-10 次 → 批准后固化为 skill → 需要自动就放 cron；"被问第二次"定义为失败。

## evidence_map

- [具体事实] 2026 年 3 月 31 日 Anthropic 误把 Claude Code 完整源码（512,000 行）发布到 npm registry，作者读完后确认核心价值在 harness 而非模型。
- [具体数字] 20,000 行的 CLAUDE.md 被精简到约 200 行（压缩 100 倍），模型表现反而变好；砍掉的内容转成 resolver 按需加载的外部文档。
- [具体数字/对比数据] Playwright CLI 每个浏览器操作 100ms，而 Chrome MCP 的 screenshot-find-click-wait-read 链要 15 秒，速度差 75x；fat harness 的典型病状是 3x token、3x 延迟、3x 失败率。
- [具体数字] Steve Yegge 引用："用 AI coding agent 的人比用 Cursor+chat 的人生产力高 10x–100x，比 2005 年的 Googler 高 1000x。"
- [具体场景] Chase Center, 2026 年 7 月 YC Startup School，6,000 名创始人，靠传统 15 人 program team 手动读申请 + spreadsheet 的流程在 200 人规模可行，6,000 人规模崩溃。
- [具体 bug 场景/诊断故事] 创始人 Maria Santos 的 Contrail（contrail.dev）在申请里说自己是"Datadog for AI agents"，但 diarization skill 读完 GitHub commit 发现 80% 的代码在 billing module——实际上是伪装成 observability 的 FinOps 工具。这个 gap 只有读完申请+commit+advisor 对话三份材料同时交叉判断才能发现。
- [具体 bug 场景] 创始人 Kim 申请时标 "developer tools"，但 1:1 对话记录暴露他真正在做 SOC2 合规自动化；skill 自动把他重新归类到 FinTech/RegTech。
- [具体数字] YC 用这套系统后，NPS "OK"（不是"bad"是中等）评分从 7 月的 12% 降到下一次活动的 4%——靠的不是改代码，是 /improve skill 读 NPS 后把新规则写回 skill 文件自己。
- [一手引用] "You are not allowed to do one-off work... The test: if I have to ask you for something twice, you failed." 这条推文得到 1,000 赞和 2,500 收藏。
- [具体对比] /investigate skill 七步流程 + 三个参数（TARGET/QUESTION/DATASET），同一个 markdown 文件：传入安全科学家 + 210 万封 discovery 邮件 → 医疗研究分析师；传入空壳公司 + FEC 文件 → 政治献金法证调查。
- [架构数字] 作者推荐的三层架构中，harness 只有约 200 行代码，JSON 进 / 文本出，默认只读；90% 的价值在 skill 层。
- [具体 skill 调用] /match-breakout（1200 人，按行业聚类，30 人/房间）、/match-lunch（600 人，跨行业 serendipity，8 人/桌，不重复）、/match-live（当场匹配，200ms，1:1 最近邻），同一个 matching skill，三种调用。

## non_obvious_points

- [skill 是带参数的方法调用，不是 prompt 模板] — 为什么这不显而易见：大多数人把 skill 理解成"写好的提示词模板"，但作者的视角是"用 markdown 做编程语言，用人类判断做 runtime"——skill 描述 process，invocation 提供 world，这是软件工程范式而不是 prompt engineering 范式。
- [最有价值的改进信号不是"差评"，而是"中等评价"] — 为什么这不显而易见：通常做系统改进会去看 bad cases，但 /improve skill 特地去 diarize "OK" responses——那些"系统差一点就成功"的案例才能精准定位规则漏洞，差评往往噪音太大反而没信息量。
- [模型一升级，skill 层自动变强，确定性层一点不动仍然可靠] — 为什么这不显而易见：大家直觉上觉得"换模型要重写一堆 prompt"，但"latent 上移、deterministic 下沉"的好处是升级只影响 judgment 步骤，SQL、排序、分配这些硬代码完全不需要动——skill 是永久 upgrade，不会退化也不会遗忘。
- [resolver 才是真正决定 context 的东西，不是 context window 大小] — 为什么这不显而易见：行业在卷更大的 context window，但实际瓶颈是"在正确时机加载正确文档"；Claude Code 靠 skill 的 description 字段自动做意图匹配，用户根本不需要记得 /ship 存在。

## tradeoffs_and_limits

- [把错误的工作放在错误的一侧会系统性失败] — 具体表现：LLM 安排 8 人晚宴座位没问题，安排 800 人时会产出"看起来合理但完全错"的幻觉结果；文中明确这是把组合优化（确定性问题）错误放进 latent space 的典型崩溃，分不清这条线的系统就是最差的系统。
- [厚 harness 的成本是隐性但致命的] — 具体表现：40+ 工具定义吃掉一半 context window、God-tool 单次 MCP round-trip 2-5 秒、把每个 REST endpoint 包成独立 tool 会带来 3x token / 3x 延迟 / 3x 失败率；这些成本在 demo 时不明显，上生产就叠加爆炸。
- [skill 路径依赖"纪律"而不是"灵感"] — 具体表现：skill 要求"手动做 3-10 次 → 出示结果 → 批准后固化 → 需要自动就放 cron"这种工程规矩；如果团队没能力坚持这套流程，skill 层会迅速变成另一个 20,000 行失控 CLAUDE.md。
- [Diarization 不是 RAG，也不能被 embedding 替代] — 具体表现：文中 Santos 和 Kim 的两个重分类场景（says vs actually building），都是必须同时读三份材料做判断的，embedding 相似度检索、关键词过滤、SQL 查询都抓不到；这意味着这类任务既烧 token 又慢，批量规模受硬约束。

## what_to_leave_out

**不该进入的素材：**
- YC Startup School 的 breakout / lunch / live matching 三个场景全讲会让视频变成"YC 内部系统介绍"——只需用其中 1 个作为 demo 即可（建议用 Santos 那个 says vs actually building 的 debug 故事，最有冲击力）。
- 五个定义中的"Diarization"定义可以简化：不必在视频里把这个英文术语完整讲清楚，它更像实现细节，核心意思"模型读完所有材料后写结构化 profile"观众能听懂就够。
- 作者的 OpenClaw 推文的点赞数和 bookmark 数（1,000 / 2,500）对中文观众没说服力，可以省略社交证据。
- "Skills are permanent upgrades" 那一节的哲学收尾（"Build it once. It runs forever."）对中文观众偏西方 founder narrative，可以压缩。
- Steve Yegge 名字 + "2005 Googler" 对比数据可以保留但不用解释 Yegge 是谁——观众只需要记住 10-100x 的冲击数字本身。

**应避免的叙事方向：**
- 不要把全片框架建立在 "100x 生产力" 这个单一数字上——它只是引子，核心是"架构而非模型"；如果反复回到 100x 会让视频像打鸡血。
- 不要当成教程来写——这不是"如何写 skill 文件的 5 步教程"，而是一次架构认知的翻转：直觉上该厚的地方要薄（harness），直觉上不该抽象的地方要抽象（skill）。
- 不要陷入把五个定义（skill / harness / resolver / latent vs deterministic / diarization）逐一铺开讲的学术结构；应该围绕"薄 harness + 厚 skill" 这一条主干，用五个定义中最有冲击力的 2-3 个（skill-as-method-call、latent vs deterministic 的 800 人座位、20000→200 行 CLAUDE.md）作为证据，其他提到即可。
- 不要把 Anthropic 误发 Claude Code 源码的事件当作爆料式悬念——它在原文里只是佐证，不应喧宾夺主。
- 不要忘记讲代价和边界——特别是"800 人座位幻觉"这条，必须保留；只讲爽点会让观众误以为 skill 是万能银弹。

## signature_line
"同样的 Claude，为什么有人 2 倍有人 100 倍？差距不在模型脑子里，在模型周围那 200 行脚手架里。"
