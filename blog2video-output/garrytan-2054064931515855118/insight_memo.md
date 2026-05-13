# Insight Memo: Garry Tan 的 AI Agent Complexity Ratchet

## title_zh
72 小时 14 个 PR：90% 测试覆盖凭什么不再是奢侈

## one_sentence_thesis
AI Coding 真正的变革不是写代码更快，而是把过去贵到无法维持的"90% 测试覆盖"变成了默认配置——验证成本崩塌之后，软件第一次拥有了一个只能向上、不能回退的质量棘轮。

## why_this_video_exists
大多数 AI Coding 的讨论停留在"模型有多强、能不能替代程序员"。这篇博客把视角拉高了一格：它讲的是错误模型本身的相位变化——为什么过去 50 年软件工程的所有流程（code review、QA、release train）都建立在"防止错误"上，而 AI Agent 让"快速捕捉并修复错误"变成更合理的范式。观众能拿到一个普通 AI 工程内容里不会出现的论点：90% 测试覆盖的拐点（Capers Jones 数据、DO-178C 航电标准、Six Sigma 类比）从工程奢侈品变成了默认起点，这才是真正的复利来源。同时附带一个非常具体的 TTY 测试 harness 故事（PR #1354），可以让观众立刻理解"行为契约也可被测试"这件事。

## judgment_lines
- "AI Coding 的真正解锁不是写得快，而是验证得起" — 来源：原文明确写"It's not that AI lets you write code faster... It's that AI lets you verify at a level that was previously too expensive to sustain"。Garry 区分了这两件事，并把后者作为论点核心。
- "90% 测试覆盖过去是航电级奢侈品，现在是默认设置" — 来源：Capers Jones 10,000 个项目数据，<70% 覆盖时 DRE 65-75%，85-95% 覆盖时 DRE 跳到 92-97%；DO-178C 的 MC/DC 标准；Mockus/Nagappan/Dinh-Trong 的 Vista 研究显示 90% 之后努力曲线陡升——但 "AI agents don't experience effort"。
- "AI Agent 没有'累'这件事，所以最后那 20% 的覆盖率是它最擅长的部分" — 来源：原文 "They don't get bored writing the fourteenth edge-case test... The brutal last 20% that made 90% coverage impractical for human teams is exactly the kind of work AI agents are best at"。
- "棘轮不靠人，靠下一轮 Agent 加载 context 时无法回退" — 来源：原文 "It can't regress below the test suite... It can't ship quality below the evaluation baseline"。机制是结构性的而不是文化性的。
- "可观察就可测试——测试面已经从函数返回值扩展到 TTY 行为契约" — 来源：PR #1354 用 Bun 的 TTY 功能在伪终端里 spawn Claude Code，监听它是否真的发起交互提问；PR #880 跨两个独立程序做端到端测试，359 行测试代码。

## evidence_map
- [具体数字] 970,000 行代码 + 665 个测试文件，跨 GStack 与 GBrain，几乎全部由 Claude Code / Codex 撰写
- [具体数字] 72 小时合并 14 个 PR，新增约 29,000 行代码，且每个 release 测试质量都比上一个更高
- [作者并行规模] 平均 15 个 Conductor session 并行运行
- [具体 bug 场景] GBrain 的 epistemological extraction：从 28,000 页中抽取 100,720 条 claim；cross-model evaluation（GPT-5.5 + Claude）打分 6.8/10；核心 bug 名为 "holder confusion"——分不清"谁持有这个 belief"（写作者本人？被引用者？还是系统推断的？）V1 在 35% 的情况下搞错持有者；V2 prompt 修复了 6 个失败模式，weight rounding 在 DB 层强制以 0.05 为单位（避免假精度如 0.74），17 个测试锁死契约
- [具体对比数据] Capers Jones：<70% 覆盖率时 DRE 65-75%；85-95% 覆盖率时 DRE 92-97%。曲线在 85% 附近有一个明显的"膝盖"
- [行业标准] DO-178C 对 FAA Level A 系统（出 bug 就坠机）要求 MC/DC 覆盖；branch coverage 漏掉 10-20% 的 fault，MC/DC 达到 >99% DRE
- [类比/外部数据] Six Sigma：3σ ≈ 67,000 defects/M；4σ ≈ 6,200；5σ ≈ 233。4σ 到 5σ 是 27 倍，非线性的相位跳跃
- [学术研究] Mockus / Nagappan / Dinh-Trong 的 Windows Vista 研究：覆盖率与 post-release defects 负相关，但 90%+ 所需努力陡升——所以大多数团队卡在 70-80% 称之为 "good enough"
- [具体 PR 故事 #1] PR #1354 TTY 测试 harness：用 Bun 的 TTY 功能在伪终端里 spawn Claude Code，喂入特定 repo 场景，触发 review skill，实时监听终端输出，验证 agent 是否真的发起至少一个交互式提问。修复包含三层：STOP gates、anti-shortcut clause（"plan file is the OUTPUT of the interactive review, not a substitute for it"）、gate-tier floor tests。
- [具体 PR 故事 #2] PR #880：359 行测试代码，从源码 build OpenClaw 插件、在隔离 profile 里 spawn 实例、CLI 安装、`plugins inspect` 验证运行时加载、设置 config slot、跑 `plugins doctor` 验证零诊断告警。跨两个独立程序的完整端到端 round trip。
- [项目体量] GStack：93K stars、701K LOC、46 skills、37 contributors，v1.30 单次发布合入 21 个社区 PR
- [项目体量] GBrain：14K stars、25 contributors，v0.31.1.1 单个 PR 合入 22 个社区修复（auth flow、schema bootstrapping、sync、privacy）
- [具体 release 修复] v0.31.2：修复 code sync 在含 symlink 的大 repo 上挂死的 bug，给 parser 加 30 秒超时；v0.31.1：修了 25 个 CLI 命令静默路由到空本地 DB 而非用户真实 brain 的问题
- [传播数据] 帖子 139.7K views、686 likes、1,345 bookmarks（书签率异常高，说明读者把它当 reference 收藏，不只是点赞划走）、109 reposts、44 replies

## non_obvious_points
- AI Agent "不感到疲惫"才是 90% 拐点变可达的真正原因 — 为什么这不显而易见：大多数人讨论 AI Coding 时关注"速度"和"能力"，没人把"AI 不会在周五下午 5 点偷懒"作为一个工程参数来对待。但 Vista 研究告诉我们，过去 70%→90% 这段曲线之所以陡升不是因为技术难，而是因为它消耗人类意志力。Agent 没有这个上限，于是过去 50 年的工程经济学被改写了。
- "可被 harness 的东西就可被测试"把测试面从函数返回值扩展到整个 stack — 为什么这不显而易见：大多数人对"单元测试"的心智模型还停留在 assert(add(1,1)==2)。但博客论证：OS 给你进程树和文件系统、Terminal 给你每个 keystroke、Browser 给你渲染状态、Agent 给你可观察的行为序列。所有这些都能 assert，都能棘轮化。TTY 测试 Claude Code 是否"真的发起对话"——这种测试在前 AI 时代几乎没人写，因为太麻烦；现在 Claude 五分钟就写完。
- 测试的真正功能不是"line coverage 这个虚荣指标"，而是行为契约的持久化记忆 — 为什么这不显而易见：作者明确说 "The ratchet isn't about line coverage as a vanity metric. It's about tests that encode behavioral contracts"。Holder confusion 测试不是为了覆盖率数字，是为了把"V1 那次踩过的坑"作为一条永不会被遗忘的契约写进 codebase。员工会离职、记忆会丢失，但 context window 不会辞职。这把"institutional memory"从人迁移到了测试套件。

## tradeoffs_and_limits
- 测试会给出虚假信心 — 具体表现：90% line coverage 不等于 90% 行为正确性。覆盖率衡量的是"代码路径被执行过"，不是"语义正确"。一个测试可以覆盖一行代码但完全没断言它的意图。这也是作者强调"behavioral contracts"而非 line coverage 的原因，但视频要诚实说出这条边界。
- AI 评估（cross-model eval）本身有成本 — 具体表现：GBrain 那次 epistemological extraction 用 GPT-5.5 + Claude 双模型独立打分；100,720 条 claim 跑 cross-model eval 的 API token 成本不是零。Eval 的频率和深度会成为新的工程经济学约束。
- 行为契约比语义正确性更容易验证 — 具体表现：TTY 测试可以验证"Agent 有没有发起提问"，但很难验证"它问的问题是不是真的有质量"。能 assert 的是协议层，能不能 assert 内容深度是另一个问题。
- 棘轮也可能锁死合理的重构 — 具体表现：原文没明说但是 implicit。17 个测试锁死了 holder confusion 的契约——如果未来需要根本性重构 extraction 逻辑，这些测试可能从"institutional memory"变成"institutional fossil"。质量楼底永远向上意味着，要推翻一个曾经做对过的决定会变得更难。
- 灾难性错误未被棘轮覆盖 — 具体表现：作者自己承认，剩下的灾难性错误是"会破坏 state"的那一类——错误的生产数据库迁移、未被察觉的安全漏洞、不可撤销的隐私泄漏。棘轮帮一部分忙，但不是全部。

## what_to_leave_out

不该进入的素材：
- 不要去复述这是"系列第七篇"的前 6 篇内容（观众没看也不需要看就能理解本期）
- 不要展开 Six Sigma 的数学推导（3σ/4σ/5σ 的数字提一下作为相位跳跃类比即可，不需要解释 standard deviation）
- 不要把 GStack 93K stars / GBrain 14K stars 当成 marketing 收尾来念（这是结尾推广，主轴是棘轮机制本身）
- 不要堆砌所有 release notes（v0.31.0/0.31.1/0.31.1.1/0.31.2 全念观众会疲劳，挑 1-2 个最有说服力的就够：symlink 30s timeout、22 community PRs in one release 即可）
- 不要在视频里出现"开源免费 MIT 协议 GitHub 上"的安利尾声

应避免的叙事方向：
- 不要把整片框架建立在"15 个并行 session"或"72 小时 14 个 PR"这一个数字上——这容易让观众理解成"Garry 个人产能很猛"，但博客的论点是机制（棘轮）而不是个人英雄主义
- 不要写成"如何用 AI 写测试"的教程——这是认知类内容，不是 how-to
- 不要陷入"AI 会不会取代程序员"这种烂俗的钩子，原博客的视角更高一层
- 不要把"棘轮"翻译成模糊的"循环改进"——棘轮的关键定义是"单向不可回退"，这是它与普通迭代的区别，必须讲清楚
- 不要把 90% 这个数字本身当成 takeaway——真正的 takeaway 是"验证成本崩塌"，90% 是结果不是目标

## signature_line
过去 50 年我们一直在防止错误发生；现在我们可以让错误一旦发生就被永远钉在棘轮上——不是 AI 让你写得更快，是 AI 让"90% 测试覆盖"从航电级奢侈品变成了周二早上的默认设置。
