# Insight Memo: Building a Good Vertical Agent —— 把 Agent 的上下文当 CPU 缓存来设计

## title_zh
30个工具的Agent，输给了7个工具的它？

## one_sentence_thesis
一个好 Agent 之所以好，不是因为模型更强或工具更多，而是因为它把"用户任务分布"忠实地压缩进了上下文——常用能力住在系统提示里、偶发能力按需取、长尾能力靠一份 100 行的 skill 去 grep 一本 7 万行的原始 API 大全。

## why_this_video_exists
市面上讲"怎么搭一个 Agent"的内容铺天盖地，但几乎没人讲"怎么搭一个好的 Agent"——作者用了将近一年时间打磨 Shortcut 表格 Agent（部署在四大多策略对冲基金中的三家），把"好"拆成了可执行的工程决策，而不是玄学。观众能从这里拿到三样别处拿不到的东西：(1) 一个连流行 Agent 都互相打脸 4 倍的设计分歧（工具数量），说明这个领域根本没有公认原则；(2) 一套可以直接照搬到任何垂直领域的 L1/L2/L3 上下文分层方法论；(3) 一连串具体到函数名和错误码的工程证据（getCellRange 压缩、write-diff linter、deferred tools 元墙），让"压缩任务分布"这句抽象话变成看得见摸得着的代码。

## judgment_lines
- "工具不是越多越好，反而越多越蠢" —— 来源：作者自家实验持续显示模型准确率随工具数量增加而下降；每个工具都是更多 schema、更多让模型选错的表面积，所以 Shortcut 只给一个 execute_code 工具，让模型用编程语言的完整表达力去组合能力，而不是拼接几十个僵硬的工具调用。
- "Agent 设计领域至今没有公认原则，连最基础的问题都对不上" —— 来源：Codex 和 Claude Code 各自上 ~30 个工具，Pi 只上 7 个；最基础的"工具数量"问题上流行产品就差 4 倍，这本身就是"没有共识"的信号。
- "读取一段单元格本质是一次压缩，不是一次搬运" —— 来源：getCellRange 把 600 个公式压成一行图例、400 个带样式单元格压成两行、还免费补上模型没问过的表头行，整张表无损塞进原始 dump 几分之一的 token。
- "把 99% 做到，比停在 95% 值钱 10 倍——所以那 4 个百分点的脏活必须干" —— 来源：作者明确指出准确率和价值的关系非线性，99 分的任务价值是 95 分的 10 倍，这正是为什么要在 L1 上花"荒谬、不成比例"的精力。
- "好的写回反馈不是'你改了什么'，而是'你改了什么、以及你大概率搞错的是哪一处'" —— 来源：write-diff 把 200 次写入分组采样成几行，并把第 57 行那个会被淹没在一片绿色 diff 里的 #REF! 顶到最上面标成 MUST FIX，相当于给 Agent 自己的编辑动作内建了一个 linter。

## evidence_map
- [具体数字/对比数据] 工具数量的 4 倍分歧：Codex 和 Claude Code 各 ~30 个工具，Pi 只 7 个——作者用它论证"流行 Agent 在最基础设计问题上都不一致 = 没有公认原则"。
- [具体事实] Shortcut 表格 Agent 部署在"四大多策略对冲基金中的三家"，这是一个"出错代价高、没人给打分曲线放水"的领域；作者打磨了"将近一年"。
- [具体数字/准确率经济学] 准确率与价值非线性：99% 的任务价值是 95% 的 10 倍。
- [具体设计/代码] 单工具设计：只有一个 execute_code 工具，没有 read_range / write_range / make_chart；API 活在代码里，模型永远在写代码，L1/L2/L3 只是"它知道能调哪些函数、以及找到它们费了多大劲"。
- [具体 bug 场景/写回 diff] write-diff linter：对 `D${r}=B${r}*C${r}` 的批量写入返回结构化 diff，199 个单元格归在"Changed without issues"，而第 57 行的 `D57: ∅ -> #REF! [=B57*C57]` 被单拎进"Cells that need review"并标 MUST FIX: INVALID_FORMULA。它会主动揪出无效公式、未标注的硬编码数字、藏在公式里的硬编码、离谱的百分比。
- [具体压缩技巧/数字] getCellRange 三件事：① 公式别名——把每个公式归一化成 R1C1 形式（=A2*B2 和 =A3*B3 都变成 =RC[-2]*RC[-1]），出现 >10 次的模式折叠成 F1 这样的短别名，500 个公式 → 一行图例，零信息损失；② 免费的行列上下文——向左扫行标、向上扫表头（靠"哪一行文本单元格最多"投票选表头），让模型白拿 Region|Units|Price|Revenue；③ 样式压缩——按相同样式分组、折叠成连通区域、每组一行。结论原话量级："600 个公式变成一行图例，400 个带样式单元格变成两行。"
- [具体代码/L2 gotcha] pivot table 规范不是 type signature 的堆砌，而是手写散文教整套配方顺序：必须用 suspendLayout()/resumeLayout() 包住批量改动否则每次调用都重建表；聚合方式得传裸整数（8 = sum）因为运行时根本没有那个友好的 enum。
- [具体机制/deferred tools 元墙] L2 对可执行工具用元工具墙：`get_tool_info("web_search")` 返回 schema 并标记 "fetched"，`execute_tool("web_search", …)` 在没先 fetch 前会 REFUSE；已 fetch 的工具集就是一个 session 级缓存。作者原话："this is the same idea as deferred tools on Claude but we're not locked to one vendor's tool-loading feature."
- [具体数字/prompt 预算] 预算拆分镜像频率曲线：L1 = 几百行（核心读写 + execute_code 契约 + 关键类型 + 安全准则，每次调用都常驻，所以最拼命压）；L2 ≈ 50 行（不是规范本身，而是"祝福过的"方法白名单 + 指向 getXInfo(...) 的指针）；L3 ≈ 5 行（skill.md 的名字和描述）。原始 API 参考 7 万行，完全躺在磁盘上，永不进 prompt。
- [具体机制/L3] L3 是完整原始 API（Excel 的整个 Office.js / Shortcut web 的整个 SpreadJS），机器生成、7 万行、完全无法当 prompt 用；配一份 ~100 行的 skill 教模型用 bash grep 去挖（grep -n '"charts.add"' -A 5 找方法、grep '"isEnum": true' -B2 -A10 枚举 enum），把"几万行读不了"变成"3-6 个 grep 精准捞到签名"。
- [一手引用/系统提示] 系统提示里把逃生舱写明："API HIERARCHY… NEVER guess — read the docs in FULL… If the wrapped API can't do it, use the raw API — don't compromise."

## non_obvious_points
- "工具越多模型越差"违反直觉——为什么不显而易见：常识是"能力越多越强"，但作者指出每加一个工具就是更多 schema 进 prompt、更多重叠职责、更多选错的表面积，于是把"选哪个工具"这个决策彻底取消，只留"写代码"一个决策。这是把决策数量当成噪声源来削减，不是把工具当资产来累积。
- "读取也是压缩、写回也是压缩"——为什么不显而易见：大多数人把 read/write 当成纯粹的 I/O 搬运，但作者把它们做成了带特征工程、token 压缩、后果汇报的包装层（getCellRange 的三重压缩、write-diff 的分组采样 + 分类 triage）。读和写在这里都是有损耗预算的信息编码问题，而不是数据通道问题。
- "分层不会消失，只会随模型变强往下滑"——为什么不显而易见：直觉会觉得"模型越强、上下文窗口越大，分层这套脚手架就该被淘汰"。但作者的判断恰恰相反：昨天的 L3 变成明天的 L2、昨天的 L2 塌进 L1，Agent 的责任范围向外扩张、层级整体下滑一级，但分层本身永不消失——因为上下文相对于"你能塞进去的一切"永远稀缺，噪声永远扣准确率。"没有哪个模型大到让'在对的时间把对的东西放到它面前'这件事不再重要。"

## tradeoffs_and_limits
- 这套分层的核心代价是"压缩 vs 发现"的永久权衡，必须逐项手工裁决，没有免费午餐——具体表现：放进 L1 就即时可用，但每个任务无论用不用都付 prompt token；推到 L3 就平时零成本，但需要时要花好几次工具调用去找（L3 要 3-6 次 grep）。L1 的那些压缩包装层"造起来很贵"，而且作者明说"你还是得造，因为 Agent 每个任务都在付这个代价"。这是用大量前期工程投入换常用路径的准确率，不适合不愿在少数关键处做"乏味、细致的脏活"的团队。
- 边界：分层的具体形状取决于"你的用户任务分布"，而这个分布只有领域内的人最懂——所以这套方法是可迁移的结构，但 L1/L2/L3 各放什么没法照抄，必须在自己的领域重新做判断。

## what_to_leave_out
不该进入的素材：
- getCellRange / write-diff / pivot table 的逐行代码细节和精确字段格式（如 numberFormat:#,##0.00、font.color:#1A7F37、CELL DIFF SUMMARY 的具体排版）——太细节，视频里讲清"600 公式压成一行、第 57 行的 #REF! 被顶到最上面标 MUST FIX"这个量级和故事即可，不要逐行念代码。
- 具体 grep 命令的四条写法、Office.js vs SpreadJS 的命名区别——属于实现细节，讲清"7 万行的大全 + 100 行的 skill 教它 grep"即可。
- "an agent is a while-loop around a model that calls tools"这种已被标准化、人人都懂的基础定义——作者自己也说"写个 Agent 一个下午就行、不难也不深"，视频不要花时间普及这层。

应避免的叙事方向：
- 不要把全片框架建立在单一数字上（比如只围着"4 倍工具差"或"10 倍价值"打转）——这些是论据，核心 thesis 是"Agent 是任务分布的忠实压缩 / 上下文像 CPU 缓存分层"，数字服务于这个主线。
- 不要写成"如何搭建 Agent 教程"——这篇恰恰是反教程的"如何搭一个好 Agent 的判断力"，叙事要落在"为什么这么设计"而不是"step by step 怎么做"。
- 不要把它讲成"Shortcut 产品广告"或对冲基金故事——对冲基金部署只是"出错代价高"的可信度背书，主体是可迁移的方法论。
- 不要暗示"工具越少一定越好"成普适教条——作者的判断是"减少模型的决策表面积"，单工具是这个判断在他领域的解，不是放之四海的口号。

## signature_line
别人忙着给 Agent 加到 30 个工具，真正赢的那个只给了 1 个——因为 Agent 的上限不在它能调多少工具，而在你有没有把任务分布像 CPU 缓存一样分层压进它的上下文：热的常驻、温的按需、冷的留条能 grep 到的逃生舱。

## hot_keywords
- Agent / Agent Harness —— 全文核心。"a good agent is a faithful compression of its task distribution"是中心论点，整篇围绕"怎么搭一个好的垂直 Agent"展开，是绝对核心概念。
- Context Engineering —— 全文实质主线（虽未逐字用这个词组）。"the system prompt, the tools, and the artifacts… they're all the same thing: the agent's context"、"accuracy is a function of context quality"——整篇就是一套上下文工程方法论，可作 Hook 锚点。
- deferred tools (Claude) —— 实质性出现且是关键证据。L2 的元工具墙 get_tool_info/execute_tool 被作者明确点名为"same idea as deferred tools on Claude but we're not locked to one vendor"，是听众能直接对上号的热词。
- Skills —— 实质性出现。L3 靠一份 ~100 行的 skill（SKILL.md）教 Agent grep 7 万行 API 大全；L2 的 curated specs 作者也说"exactly like skill mds"，是核心机制之一。
- Codex —— 作为对比证据出现："Codex and Claude Code ship ~30 tools each"，用于论证工具数量的 4 倍分歧，是周边但具体的锚点。
- Claude Code —— 同上，与 Codex 并列作为"~30 工具"的对比方，周边提及但可作熟悉度锚点。
- MCP —— 无实质出现（不要硬塞）。
- Computer Use / Subagent / /goal 模式 —— 无明显出现。
