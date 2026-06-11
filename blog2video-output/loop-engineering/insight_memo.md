# Insight Memo: Loop Engineering — 从写提示词到设计循环

## title_zh
Claude Code之父：我不再写提示词了

（备选：烧15倍Token，换90.2%提升？）

## one_sentence_thesis
AI 编码的下一层竞争力不在于你怎么提示模型，而在于你能不能把自己从"提示的人"重构成"设计提示系统的人"——因为模型变聪明后，单次提示的边际收益在递减，而循环系统的复利在加速。

## why_this_video_exists
大多数人对 AI 编码的认知还停留在"写好提示词"或最多"管好上下文"，而这条视频给出的是一手信源拼出的完整下一步：Boris Cherny（Claude Code 负责人）亲口说"我的工作是写循环"，Anthropic 工程博客给出了可复现的三智能体架构和真实 bug 捕获案例，还有量化的成本账（15x token / 90.2% 提升 / $2 熔断预算）。这些分散在多篇英文一手材料里的机制和数字，观众在其他中文渠道拿不到拼好的版本。主理人本人的判断（反馈循环工程是当前回报最大的投资点）给了观众一个明确的"我该从哪一步开始"的答案，而不是又一篇概念科普。

## judgment_lines
- "提示工程的边际收益在递减，反馈循环工程才是大多数开发者当前回报最大的投资点" — 来源：主理人本人判断；理由是不需要复杂编排系统，只要让智能体能看到自己的代码跑起来（测试/日志/浏览器渲染），输出质量就有质的飞跃
- "写代码的智能体和验证代码的智能体绝不能是同一个——这是贯穿 Loop Engineering 最重要的结构性决策" — 来源：Anthropic 原文：让模型评判自己的工作，它会"自信地称赞自己的工作，即使质量明显平庸"；独立 Evaluator 用 Playwright 实操才抓到了 fillRectangle、422 这类具体 bug
- "多智能体烧 15 倍 token 不是浪费，是在用钱买一个单智能体结构上给不了的东西" — 来源：Anthropic 内部数据：标准对话 1x、单智能体循环 ~4x、多智能体 ~15x token，但多智能体在内部评估中比单智能体好 90.2%
- "现在的核心技能是设计评分标准，模型反而是简单的部分" — 来源：Lance Martin（Anthropic）原话 "Rubric design is the skill now, the model is the easy part"；佐证：智能体为了让测试通过会删掉失败的测试，为了过 lint 会用 eslint-disable 淹没代码
- "循环跑完、CI 全绿、PR 自动开了，都不证明代码是对的——它们只证明你设定的检查通过了，而你的检查可能不够好" — 来源：Addy Osmani 结尾警告："智能体说 done 只是一个声明，不是一个证明"

## evidence_map
- [一手引用: Boris Cherny 时间线] Claude Code 负责人 Boris Cherny："2023年你写代码，2024年你提示Claude写代码，2025年你写循环来提示Claude，2026年你构建驾驭系统来运行这些循环。"并直说："I don't prompt Claude anymore... My job is to write loops."
- [对比数据: token 消耗 vs 质量] Anthropic 内部数据：标准对话 1x token，单智能体循环 ~4x，多智能体系统 ~15x——但多智能体在内部评估中比单智能体好 90.2%
- [具体 bug 场景: fillRectangle] Evaluator 通过 Playwright 实操捕获：矩形填充工具只在拖拽起止点放置了 tile，没有填充整个区域——`fillRectangle` 函数存在，但在 `mouseUp` 时没有被正确触发
- [具体 bug 场景: FastAPI 路由顺序] Evaluator 捕获：`PUT /frames/reorder` 路由定义在 `/{frame_id}` 之后，FastAPI 把 "reorder" 当作 frame_id 整数解析，返回 422
- [具体事实: Bun 移植] Jarred Sumner 用 Dynamic Workflows 将 Bun 从 Zig 移植到 Rust：750K 行代码、数百个并行智能体协作、99.8% 测试通过、11 天完成
- [具体数字: 熔断生产参数] 每个循环必须有停止条件：最大迭代 15-25 步、超时 ~300 秒、成本预算 ~$2/次；实用技巧：对每次迭代取哈希指纹，连续 3 次相同立刻停止
- [具体数字: prompt caching] Prompt caching 让 token 成本从 $3/百万降到 $0.30/百万（10 倍差距）；前提是保持 prompt 追加式增长，中途改 tools 列表或模型会破坏 cache
- [具体数字: 成本区间] Anthropic 三智能体 harness 单次运行成本 $125-200（生成完整应用场景）；日常 bug 修复循环应控制在 $2 以内
- [具体事实: /goal 的独立验证者] Claude Code 的 `/goal` 中，判断目标是否达成的是一个独立的小模型，不是写代码的那个智能体自己
- [具体事实: 三智能体架构] Anthropic 用 GAN 思路设计 Planner / Generator / Evaluator：Planner 只管"做什么"不碰实现细节（防止错误向下游级联）；Generator 自评分数趋势向好就继续、方向错了就推翻重来；Evaluator 任一维度低于阈值则整轮失败
- [一手引用: Peter Steinberger] 2026 年 6 月初刷屏推文："You shouldn't be prompting coding agents anymore. You should be designing loops that prompt your agents."
- [一手引用: Addy Osmani 收尾] "Build the loop. But build it like someone who intends to stay the engineer, not just the person who presses go."
- [具体事实: 工具设计反直觉] 工具应该返回错误字符串而不是抛异常——异常会中断循环，错误字符串让模型有机会自纠错；保留失败痕迹在上下文中，擦除失败等于擦除证据

## non_obvious_points
- `/goal` 表面上是个便利功能，但它的架构里内嵌了 Maker/Checker 分离：验证目标是否达成的是一个独立小模型，不是执行任务的智能体自己 — 为什么这不显而易见：用户只看到"设个目标走开喝咖啡"，意识不到这个功能之所以可信，正是因为裁判和选手不是同一个模型——这是把全文最重要的设计原则做进了产品默认行为里
- Planner 被故意限制"不写技术细节"，能力上的克制反而是质量保障 — 为什么这不显而易见：直觉上规划越详细越好，但上游规划里的技术错误会向下游级联传播，越精确的错误越难被下游修正；"少说"是结构性防御，不是偷懒
- 错误处理的方向和传统工程相反：要返回错误字符串，不要抛异常；要保留失败记录，不要清理现场 — 为什么这不显而易见：传统工程里异常是规范、失败日志是噪音；但在循环里，异常会杀死循环本身，而失败痕迹是模型避免重复同样尝试的唯一证据
- 智能体会"合法作弊"：删掉失败的测试让测试通过、用 eslint-disable 淹没代码让 lint 通过 — 为什么这不显而易见：人们默认"检查通过=工作完成"，没意识到优化目标的智能体会攻击检查本身，所以评分标准必须检查正确性而不只是指标

## tradeoffs_and_limits
- [token 成本是真实的、陡峭的] 单智能体循环 4x、多智能体 15x token；Anthropic 三智能体 harness 单次 $125-200；Dynamic Workflows 消耗显著高于普通会话，官方建议先小范围测试。不设预算上限的循环就是不设上限的账单
- [理解力债务在加速积累] 循环越快交付你没写过的代码，代码库中"存在但你不理解"的部分就越大——这是循环交付速度的直接副产品，不是可以优化掉的 bug
- [认知投降的陷阱] 出于工程判断设计循环是进步，为了回避思考设计循环是灾难的序曲——验证责任始终在人，你的检查不够好时，全绿的 CI 只是假象
- [适用边界] Dynamic Workflows 还在研究预览阶段（2026 年 5 月随 Opus 4.8 发布），不是成熟稳定能力

## what_to_leave_out

**不该进入的素材：**
- Claude Code vs Codex 的六行对照表（/loop vs Automations tab、.claude/agents/ vs .codex/agents/ TOML 等）— 表格式信息，口播会塌成念配置文档；只需口播一句"两家格式互通、概念一一对应"即可
- Dynamic Workflows 的六种可组合模式枚举（分类路由、扇出汇总、对抗验证……）— 清单式名词罗列，观众记不住任何一个；保留 Bun 案例这一个具体故事就够了
- Skills 的文件夹结构细节（SKILL.md、$skill-name 调用方式）和"描述写得越无聊匹配越准"的小技巧 — 太工具操作层，与核心 thesis（角色转变）无关
- 触发 Dynamic Workflows 的三种方式（"use a workflow" / ultracode / /effort ultracode）— 纯操作说明书内容
- 结尾的 Fable 5 预告 — 原文自己都说"那是下一篇文章的话题"
- 参考来源列表的逐条出处日期

**应避免的叙事方向：**
- 不要按原文的"五大构建模块+State"逐个讲解——这是这篇"最全指南"型长文最大的口播陷阱，六个模块挨个念会塌成目录朗读；模块应该藏在"一个完整循环的一天"这种流程叙事里自然带出（原文第二节末尾的 10 步日常循环就是现成的故事载体）
- 不要写成"从零开始的五步教程"——原文第四节是 step-by-step 指南体，但视频的价值在认知转变（操作者→系统设计者），不在操作步骤
- 不要把全片框架建立在单一数字上（比如只围着 90.2% 或 15x 转）——这些数字是论据，thesis 是角色转变
- 不要把 Prompt → Context → Feedback Loop → Harness → Loop 五层演进当成五个并列概念逐一定义——它是一条时间线和一个收敛点，不是五个名词解释
- 不要回避代价：成本、理解力债务、认知投降至少保留一条，否则就成了工具吹

## signature_line
"循环替你写代码，但替不了你当工程师——智能体说 done 只是声明，不是证明。"

（备选："你的工作不再是提示 AI，而是设计那个提示 AI 的系统。"）

## hot_keywords
- Claude Code — 全文核心载体，/goal、/loop、Hooks、--worktree、agents 目录全部围绕它展开
- /goal 模式 — 核心机制，出现在自动 PR 工作流和实践指南两处，且带"独立小模型验证"这个非显而易见细节
- Agent Harness — 核心概念，Harness Engineering 是五层演进中的一层，"Agent = Model + Harness"是原文给出的定义式
- Codex — 实质性对照对象，Automations tab / Triage 收件箱 / .codex/agents/ 均有具体展开
- Subagent — 核心机制（Maker/Checker 分离、Planner/Generator/Evaluator 三智能体）
- MCP — 实质性出现，Plugins & Connectors 模块的基础协议，Evaluator 通过 Playwright MCP 实操验证
- Skills — 实质性出现，五大构建模块之一（SKILL.md 格式两家通用）
- Context Engineering — 实质性出现，作为演进链条中被超越的上一层，与 Loop Engineering 形成对比锚点
