# Insight Memo: Agent view in Claude Code

## title_zh
并发 Agent 的终点不是 tmux

## one_sentence_thesis
Agent 平行化的瓶颈从来不是模型能力，而是人类的注意力调度——agent view 是 Anthropic 对"一个人怎么管 N 个并发 Agent"给出的第一个产品级答案：把多 Agent 状态做成 inbox，而不是 dashboard。

## why_this_video_exists
这条视频提供的认知不是"Claude Code 新出了个 view"，而是一个被产品发布稿掩盖的工作流拐点：当 Agent 可以同时跑很多个之后，瓶颈从模型转移到"用户大脑里那个待办账本"。tmux + 多 terminal tab + 自己脑子记进度，这种组合本来就是临时脚手架；Anthropic 把它替换成一个 CLI 原生的、以"谁在等我"为第一排序的列表视图——这是单人多 Agent 工作流从"硬撑"走向"常态"的产品信号。

## judgment_lines
- "并发 Agent 的真正瓶颈不是模型，是用户的注意力调度" — 来源：原文开篇直接承认用户此前要管 multiple terminal tabs / tmux grid / overloaded mental ledger，问题被框定在"人怎么不漏掉"，不在"模型能不能做"
- "把 Agent 列表设计成 inbox 比设计成 dashboard 更对" — 来源：每行优先显示 whether it needs your input 和 last response，状态分类是 waiting / working / done——这是邮件式优先级排序，不是监控面板式信息展示
- "`/bg` 和 `claude --bg [task]` 把'背景化'从用户技巧升级成产品原语" — 来源：以前需要 tmux detach 或开新 tab，现在前台/后台是一个一级动词；这意味着 Anthropic 在押注"大多数 session 应该默认在背景跑"
- "Peek-and-reply 的设计是承认'切回去成本太高'这件事" — 来源：原文明确说 select a session to peek at the last turn / answer inline and the session picks back up——不需要 attach 进去才能回复，等价于在 inbox 里直接回复邮件而不打开它
- "Research Preview 同时上 Pro / Max / Team / Enterprise / API plans 说明这不是高阶用户实验" — 来源：原文 getting started 段；Anthropic 把它视为所有付费层的基础能力，而不是企业版独占的高级 feature

## evidence_map
- [具体命令] `claude agents` —— 从 terminal 直接打开 agent view 的入口命令
- [具体交互] 从任意 session 内按 left arrow 进入 agent view；按 enter 直接 attach 到某个 session 看完整 transcript
- [具体命令] `/bg` —— 把当前已有 session 加入 agent view（背景化）
- [具体命令] `claude --bg [task]` —— 直接以背景模式启动新 session，跳过前台
- [具体事实] 每行展示四个字段：session、是否需要你输入、last response 内容、上次交互时间
- [具体状态分类] 状态三态：waiting（等你）/ working（在跑）/ done（已完成）
- [具体使用场景 1] Scaling concurrent sessions：一次派发多个想法，每个可选配 skill，回来时拿到一组待 review 的 PR
- [具体使用场景 2] Long-running agents：PR babysitter、dashboard updater 这类 loop 任务，下次运行时间直接显示在列表里
- [具体使用场景 3] 任务切换：在一个 session 里时按 left arrow，起一个相关任务或快速代码库提问，再 arrow right 回原任务；peek 显示答案落地
- [具体使用场景 4] See what shipped：状态指示器 + peek 中的 title，让人扫一眼就知道哪些 session 产出了 PR
- [发布范围] Research Preview 同时面向 Pro / Max / Team / Enterprise / Claude API 五个 plan
- [开通方式] 通过运行 `claude agents` opt-in，沿用现有 rate limit
- [反衬证据] 此前的现实：multiple terminal tabs + tmux grid + overloaded mental ledger（这是 Anthropic 自己写在第二段的痛点描述，等于官方承认 tmux 是临时方案）

## non_obvious_points
- "状态三态里最关键的是 waiting，不是 done" —— 为什么这不显而易见：直觉上 done 才是用户最想看的（"哪些 PR 准备好了"），但这个产品的真正解锁动作是把 waiting 抽出来排在最前——因为 waiting 是会阻塞所有其他 Agent 推进的卡点；这是把"谁在等我"做成第一公民，等价于邮件 inbox 把未读邮件置顶，而不是把已读归档置顶
- "Peek without leaving 的设计意味着 Anthropic 认为多数交互是'小决策'而不是'深度对话'" —— 为什么这不显而易见：表面看是 UI 便利功能，本质是对工作流的假设——并发 Agent 时代里，用户大部分时间在做"continue / 改一下 / 同意"这种轻决策，只有少数时候才真的需要 attach 进去看 full transcript；这个假设如果对，agent view 会比 IDE 更像未来的工作面板
- "`claude --bg [task]` 跳过前台直接背景化，是默认形态翻转的信号" —— 为什么这不显而易见：直觉里"前台跑 + 偶尔 detach"是默认；这个 flag 暗示未来的默认可能反过来——"背景跑 + 偶尔 attach"，前台只是 N 个 background session 中你恰好选中那一个

## tradeoffs_and_limits
- "这个产品假设你确实在跑多个并发 session" —— 具体表现：如果一次只跑一个 Claude Code，agent view 是负收益（多一层导航）；它的价值曲线是非线性的——session 数从 1 到 3 收益一般，从 3 到 10 才指数级上升。换句话说，agent view 把"你应不应该开多个 session"这个工作流选择题，前置成了使用前提
- "Background 的纪律压力从工具转移到用户" —— 具体表现：以前 tmux 帮你"忘掉"那些 session（它们在别的 tab 里你看不到），现在所有 session 都在一个 inbox 里看得见；用户必须主动决定"什么任务值得 /bg 派出去、什么任务必须前台盯着"——这是新的认知负担，agent view 并没有替你回答
- "Research Preview 状态" —— 具体表现：原文写明 Research Preview，意味着 API 稳定性、命令名、交互细节都可能变；想把它写进团队 SOP 或自动化脚本的人需要承担接口变更风险

## what_to_leave_out

**不该进入的素材：**
- 不要把 `claude agents` / `/bg` / `claude --bg` / left arrow / enter 这些按键和命令做成"教程清单"——观众不需要学怎么用，需要的是理解为什么这件事重要
- 不要列举那 4 个使用场景（scaling / long-running / navigate / shipped）做"feature parade"——选 1-2 个作为佐证就够，不要平铺
- 不要复述 peek 的 UI 细节（last turn 内容、attach 进去看 transcript）—— 这些是产品细节，不是叙事支点
- 配图链接、阅读时长、Research Preview 适用 plan 列表都不进 narration
- 第二段那串痛点描述（terminal tabs / tmux / mental ledger）可以用，但只能用一次作为反衬，不要反复念

**应避免的叙事方向：**
- 不要写成 "Anthropic 推出了新功能 X，能干 Y" 的产品发布稿口吻——这是 PR 稿语气，没有判断
- 不要把全片框架建立在"省了多少 tab"这种轻量收益上——核心 thesis 是工作流形态的拐点，不是效率小工具
- 不要拿 agent view 和 IDE / 看板软件做表面类比（"像 GitHub Actions 的列表"），类比会让观众跳过真正的洞察——inbox vs dashboard 的取舍
- 不要假装原文有数据；原文是产品发布稿，没有深度故事、没有数字、没有 bug 案例。narration 不能照抄成 feature list，必须为它注入观点：为什么这是 agent 工作流的拐点
- 不要试图预测 GA 时间、价格、是否会移植到 Web——原文没说，别编

## signature_line
"以前 Agent 在每个 terminal tab 里各跑各的，靠你脑子串起来；现在 Anthropic 把那个'脑子里的账本'做成了产品——并发的边界不再是模型能跑几个，而是你愿不愿意让所有 session 都进同一个 inbox。"
