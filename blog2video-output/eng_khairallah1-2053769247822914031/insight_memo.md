# Insight Memo: Claude Skills 的认知重构与杠杆缺口

## title_zh
8 万个 Skill 没人装，问题在哪？

## one_sentence_thesis
Claude Skills 不普及，不是因为难用，而是因为大多数教程把它当 saved prompt 教，而它本质上是一个需要被"管理"的数字员工——所以装完就废，没人进入 refine 循环。

## why_this_video_exists
绝大多数 Claude Skills 内容都停留在"怎么安装"这一步。这篇文章揭示了一个被忽略的杠杆缺口：市面上有 8 万+ 社区 Skills，每周还在以千为单位增长，但绝大多数用户连一个都没装；而真正的 ROI 不在安装，在持续迭代——一个被持续 refine 的 Skill 一年能省 26 小时，10 个就是 6.5 个工作周。视频提供的不是教程，而是一个让观众重新理解 "Skill = 员工而非 prompt" 的认知模型，以及由此推导出来的"为什么 80k Skills 没人用"的解释。

## judgment_lines
- "Skill 不是 saved prompt，是 trained employee" — 来源：saved prompt 是对话起点，Skill 给出"完整作业流程 + 好坏标准 + 异常处理 + 工具 + 输出格式"，输出从"one-off quality"变成"standardized quality"
- "市场上 8 万个 Skills 没人用，是因为教程只教安装不教管理" — 来源：原文"showing someone how to hire an employee and never teaching them how to manage one"
- "一个 Skill 没跑过 happy path / edge case / stress test 三个场景，就不算 production-grade" — 来源：The Three-Scenario Test，任一场景失败都说明缺一条指令
- "Skill 的价值不在写出来，在每周 refine 一次——一个月后才会产出和人类专业人士不可区分的结果" — 来源：The Weekly Refinement Cycle，"output indistinguishable from work done by a trained human professional"
- "10 个 Skills 一年省 6.5 周，不是省时间，是从执行层跳到策略层" — 来源："Let Claude handle the execution while you handle the strategy"

## evidence_map
- [具体数字] 社区 Skills 超过 80,000 个，且每周以"thousands"速度增长
- [具体数字] Anthropic 已发布官方 Skills 覆盖 PDF、Word、PPT、Spreadsheet、Design
- [具体数字] SKILL.md 文件必须控制在 500 行以内
- [具体数字] 1 个 Skill × 每周省 30 分钟 × 52 周 = 26 小时/年；10 个 Skills = 260 小时/年 ≈ 6.5 个完整工作周
- [具体数字] 每周五 review 一次，refine 一个月，即可产出与人类专业人士不可区分的输出
- [具体事实] Skills 的物理形态：一个文件夹 + 一个 SKILL.md 文本文件，无依赖、无配置
- [具体事实] Skills 存储路径：Claude Code 项目级 `.claude/skills/` 或全局 `~/.claude/skills/`
- [具体事实] SKILL.md 结构：YAML frontmatter（name + description + 触发短语）+ 工作流指令（plain English step-by-step）
- [具体对比] saved prompt = "here is how to start"；Skill = "here is exactly how to do this job from start to finish, here is what good output looks like, here is what to do when things go wrong"
- [具体规则] 三问测试：What does this Skill do?（精确到"给参加过 webinar 的潜客发跟进邮件、引用具体场次、附一个案例、以约 demo CTA 结尾"这种粒度）/ When should it activate?（至少列 5 个触发短语）/ What does perfect output look like?（贴一封你自己写过的优秀邮件作样本，胜过 50 行指令）
- [具体规则] 三场景测试：happy path（覆盖 80% 用例）/ edge case（缺数据、格式异常、信息冲突）/ stress test（最大、最乱、最复杂版本）
- [具体禁令] "vague language is banned" — "format nicely"、"handle appropriately" 这类模糊表述不被允许，每条指令必须 specific & testable
- [一手引用] "Most guides show you how to install a Skill and stop there. That is like showing someone how to hire an employee and never teaching them how to manage one."
- [一手引用] "One Skill is a Tool. Ten Skills is a Workforce."

## non_obvious_points
- 80k Skills 已经存在、大多数人却一个都没装 — 为什么这不显而易见：大家以为 AI 的瓶颈在模型能力或 prompt 技巧，而真正的杠杆缺口是"现成的标准化能力包没被 adoption"。这意味着普通用户和高级用户的差距，不在写 prompt 的水平，而在是否进入了 Skill 生态。
- "Skill 是员工"这个比喻不是修辞，是工作方法 — 为什么这不显而易见：员工类比反过来定义了你要做的事——你要"招聘"（找 Skill）、"培训"（写 SKILL.md）、"考核"（三场景测试）、"管理"（每周 refine）。一旦接受这个比喻，"装完就放着"就变成明显错误，等于雇了人不分配工作。
- "vague language is banned" + 500 行上限 — 为什么这不显而易见：表面看是格式约束，实际是在强迫你把"我大概知道怎么做"的隐性知识，转译成"任何人/任何模型按这个执行都能复现"的显性流程。这一步本身就是把个人经验变成可规模化资产的过程，与 Skill 是否被 Claude 执行无关。
- 杠杆数学的本质不是省时间 — 为什么这不显而易见：260 小时/年听起来是"效率提升"，但作者的真实主张是"Claude handle execution while you handle strategy"——这是一个工作层级跃迁，而不是 productivity hack。把它当成时间管理来理解，会低估它的影响。

## tradeoffs_and_limits
- Skill 的价值不在"写出来"那一刻，而在持续 refine —— 具体表现：原文明确说"after one month of refinement"才能产出 indistinguishable from a trained human professional 的输出。意味着没有"周五 review"习惯的用户，写完的 Skill 大概率停留在 70 分，永远进不了 production-grade。
- 三问测试与三场景测试是硬门槛 —— 具体表现：触发短语少于 5 个、没有 perfect output 范例、没跑过 edge case / stress test 的 Skill，按作者标准都不算合格。这意味着"写一个 Skill"的实际成本远高于"写一个 prompt"，初次投入门槛被低估会导致放弃。
- "员工"类比的成本 —— 具体表现：Skill 越多管理成本越高。原文提到要"maintain a master document tracking all your Skills, their status, and their last refinement date"——即 Skill 库本身需要一个目录/状态/上次 refine 时间的元管理，不是装上就完事。

## what_to_leave_out

### 不该进入的素材
- 四个行业的 Skill 清单（real estate / marketing / finance / consulting / e-commerce 各 5 个）—— 原因：这是例子不是 insight，全列出来会变成 listicle，稀释核心论点。如果要用，只引一个行业一两个例子作触感即可。
- Skills 的物理路径细节（`.claude/skills/`、Claude Desktop with Cowork）—— 原因：这是 how-to 教程内容，不是认知输出。视频不是安装文档。
- skillsmp.com、github.com/anthropics/skills 等具体网址 —— 原因：链接在视频里没有可点击价值，且会让叙事变成 tutorial。
- YAML frontmatter 的具体语法（kebab-case 命名等）—— 原因：实现细节，让真正动手做的人去查官方文档。
- "Phase 1 / Phase 2 / Phase 3 / Phase 4" 这种阶段编号结构 —— 原因：那是文章的脚手架，不是视频的脚手架。

### 应避免的叙事方向
- 不要把视频写成"Claude Skills 完整教程"或"一文搞懂 Claude Skills" —— 原因：tutorial framing 会让视频沦为 80k Skills 安装指南中又一个，恰好就是作者批判的"只教安装不教管理"的那种内容。
- 不要按四个 Phase 顺序讲完 —— 原因：那是 how-to 结构，视频应锚定在 2-3 个认知点（reframe + 杠杆缺口 + refine 循环），让动作项从认知里自然导出。
- 不要把"省 260 小时/年"作为视频的核心 hook —— 原因：单一数字驱动的叙事容易让观众停在"听起来很爽"层面；这个数字应放在结尾作为认知跃迁的注脚，而不是开头的钩子。
- 不要把 Skill 和 prompt 的差别讲成"功能更多" —— 原因：那是描述性对比；真正的差别是"对话起点 vs 完整作业 SOP"、"one-off quality vs standardized quality"，这是一个认知层级的对比，不是 feature comparison。
- 不要假设观众知道 MCP / Agent / Tool use 的关系 —— 原因：本文没讲这些，强行关联会偏离原文论点。

## signature_line
你以为 Skill 是 prompt 的升级版——其实它是你雇的第一个数字员工，而 80k 个员工正在外面排队等着上岗，你一个都没招。
