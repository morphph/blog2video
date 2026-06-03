# Insight Memo: Every Agentic Engineering Hack I Know (June 2026) — Matt Van Horn

## title_zh

22 招让你一年内成为重度 Agent 用户

(备选: 22 个 Hack，把 Claude 装进你整个生活 / 他用 22 招重写了"程序员"这个词 / 我把整年生活都交给了 Agent)

## one_sentence_thesis

Matt Van Horn 这篇 22 hack 长帖真正的价值不在某个具体技巧，而在它示范了一种新的工作单元：传统开发 80% 写代码 20% 规划，他把比例彻底反过来——人只贡献品味和方向，剩下全部交给一队并行的 Agent，连开车去接孩子和定机票都顺手挂上去。

## why_this_video_exists

观众已经看了很多"Claude 使用技巧"和"Subagent 教程"视频，但绝大多数仍然是把 Agent 当一个更强的 IDE 来用。Matt 的内容唯一性在于：他把"Agent 嵌入日常工作流和生活流"做到了极致——4 到 6 个并行 session，终端打开直接进入 Claude 而不是 shell，给 Agent 一个邮箱地址，开 YOLO 模式不再 babysit，让 Codex 当第二台引擎，让 CLI 帮自己 preheat Tesla 和买 Costco 啤酒。这不是 hack list，是一个已经完成了的生活方式实验报告，看完观众能立刻判断自己离这个状态有多远。

## judgment_lines

- "传统开发是 80% 写代码 20% 规划，Agent 时代是反过来——计划是船锚，执行是机械动作。" — 来源：Matt 反复强调 /ce-plan + /ce-work 的两步流程，明确说"thinking goes in the plan, execution is mechanical"

- "做计划，不读计划——计划是给 Agent 的作业，不是给你的。" — 来源：Matt 的反直觉 hack #2，强迫 Agent 写出 plan 是为了让它不偷懒，不是为了让人逐行审查

- "并行 Agent 时代，人的角色不是写代码，是当那个稀缺的'信号'。" — 来源：hack #12 Human Signal——你给 6 个 session 喂方向、品味、纠偏指令，价值不在打字而在判断

- "两个 200 美元的订阅平台不是冗余开销，是字面意义上的第二台引擎。" — 来源：hack #9 Claude 做计划和 taste，Codex 做并行 build，两套 reasoning xhigh 同时跑

- "Agent 真正改变生活的不是写代码，是顺手接管了所有需要登录的杂事。" — 来源：hack #20 Printing Press + Agent Cookie，从 Tesla 预热到 Instacart 加啤酒到 ESPN 比赛提醒到 Alaska 机票，全部 CLI 化交给 Agent

## evidence_map

- [具体数字] 三个月前的旧版长帖 91.3 万次浏览；今年 Matt 一年里发了 last30days（27K stars）、Printing Press（4K+ stars）、Agent Cookie 三个项目
- [具体数字] Compound Engineering plugin 项目里他是第 3 名贡献者；Superpowers 第 3、Emdash 第 3、GStack 第 4、Paperclip 第 4、Vercel Agent Browser 第 6、Camoufox 第 2
- [具体数字] /ce-plan 做"plan for the plan"那次为他读完一本书加 2 小时 Granola 会议转录，花了 45 分钟生成"史诗级 plan"
- [具体数字] 4 到 6 个 cmux tab 并行，每个 tab 一个独立任务
- [具体数字] 全新的 M5 Max 64GB RAM 笔记本，电池续航被他这套工作量打到只剩 1 小时
- [具体数字] Printing Press 项目里他自己有 320+ 个合并 PR
- [具体数字] Codex 设 reasoning xhigh + fast mode on；Claude Code 设 reasoning xhigh + fast mode off（因为 Claude 的 fast mode 在 200 美元 Max 之上还按 token 额外收费）
- [具体事实] 给 Claude 配邮箱的开源仓库 github.com/mvanhorn/agentmail-to-claude-code——任意收到 allowlist 内的邮件就开一个新 session 处理；他在手机上跑 cc <task> 命令，Mac 端就开一个 session 干活，不需要 VPN 不需要 SSH
- [具体事实] 终端默认启动 claude --dangerously-skip-permissions 而不是 zsh，开新 tab 直接进 Agent
- [具体事实] settings.json 里加 skipDangerousModePermissionPrompt: true + defaultMode: bypassPermissions；再加 Stop hook 播 Blow.aiff 提示音，多 session 跑的时候靠声音知道哪个 session 结束了
- [具体场景] 跟 Michael Margolis 见面后，他没有去读那本免费 PDF——而是把 PDF + 2 小时会议 Granola 转录都丢给 /ce-plan "make a plan for the plan"，让 Agent 自己规划怎么读书加挖转录
- [具体场景] 中午跟候选人吃了 90 分钟饭，全程 Granola 录，他直接把原始 transcript（包括寿司话题）丢给 /ce-plan，一次过出了产品提案，当晚发出，那人现在是全职员工
- [具体场景] 在足球场边用 Alaska Airlines CLI 拉机票、查 Atmos 余额、丢给 /ce-plan 出订票策略
- [具体场景] 给朋友配置 Claude Code 开 dangerous skip permissions 时，AI 自己主动劝朋友别开
- [具体事实] 这篇文章本身是他在 cmux 里对着 Monologue 语音说话写出来的，"evolve the no-IDE opener" 一句话改一段，旁边开着 Proof 给非工程同事 review

## non_obvious_points

- **"做计划但不读计划"是反直觉的：plan 不是文档，是约束 Agent 的牢笼** — 为什么这不显而易见：大多数人以为写 plan.md 是为了让自己理清思路或备忘，Matt 揭示的实情是 plan 的作用是逼 Agent 提交 approach、写下 acceptance criteria，然后强迫它去命中。"有 plan 的 Agent 交出成品，没 plan 的 Agent 偷工减料早早收工。" 它是给 Agent 的紧箍咒，不是给人的备忘录

- **YOLO 模式之所以是必需而不是任性，是因为 6 个并行 session 根本没法逐一确认** — 为什么这不显而易见：单 session 用户体感"逐一确认"是合理安全设计，Matt 揭示了并行场景下逐一确认是工作流的杀手，YOLO 不是省事是必要条件，并且他配了一个"响铃 hook"补回失去的反馈通道——Stop hook 播 Blow.aiff，靠声音知道哪个 session 完工

- **Claude 和 Codex 不是替代品而是分工——一个做 taste，一个做 build** — 为什么这不显而易见：表面上两个都是编程 Agent 看起来重复，Matt 揭示的是订阅两个 200 美元的 Max plan 本质上是在买"第二台引擎"，Claude 留给规划和品味判断，Codex 接走重型 build，并且他从来不打开 Codex CLI，而是通过 /ce-work --codex、Codex IDE extension、Printing Press 里加 codex 后缀这三种方式从 Claude 内部派单出去

- **Agentic Engineering 真正离开终端那一刻才有破圈感** — 为什么这不显而易见：前 19 个 hack 全在终端里打转，听起来像是程序员玩具升级；但第 20 个 Printing Press 把 Tesla 预热、Instacart 加货、ESPN 比赛提醒、Alaska 机票变成 CLI 命令时，整套体系突然有了非编程的意义——这是从"AI 替我写代码"到"Agent 替我办杂事"的质变

## tradeoffs_and_limits

- **这套工作流极易上瘾，Matt 自己在最后一节诚实承认了** — 具体表现：他亲眼看到朋友"被造任何东西的能力点燃，结果什么别的都不做了，launch 出去没用户也不在乎"，他把这个状态命名为"AI Psychosis"。Agent 让 build 的成本几乎为零，但人对建造的多巴胺反馈被无限放大，"agents 本来是替我们做事的，结果我所有朋友都在自己生命里前所未有地拼命"

- **开放办公室是这套工作流的明显死角** — 具体表现：Matt 承认自己一个人独处时是 voice-pilled 重度用户，但在合用办公桌时"我做不到对着麦克风小声讲话，因为不想打扰旁边的人"。整个 voice-first 流程在共享空间里破功

- **M5 Max 64GB 全新机器跑这套工作流，电池续航被打到只剩 1 小时** — 具体表现：6 个 Claude session 加 Codex 全开的工作量本质上是把笔记本当桌面机用，硬件和电源不是边角问题——他随身带 Anker 充电宝、Tesla 车里常备充电器

- **YOLO 模式承担 GitHub 兜底假设** — 具体表现：Matt 自己的原话"这是我自己的电脑，搞砸了还有 GitHub"。这意味着这套流程预设了所有工作都在 git 里、有远程备份、可恢复——任何脱离 git 的工作（数据库迁移、生产配置、unversioned 文件）都不在这个安全网内

## what_to_leave_out

**不该进入的素材**

- M5 Max 的硬件参数细节、Anker 型号链接——细节，不是核心 thesis
- Mosh/Tmux 远程工作技巧 (#15) ——属于"开发者基础设施"知识，对目标观众价值低
- 所有具体 settings.json/config.toml 的代码块——脚本可以提"在配置文件里加一行/打开 YOLO 模式"，但不要念代码
- 23 招到 25 招的细节列表式列举——观众听不下去 22 个独立条目
- 他作为开源贡献者的所有具体仓库名（Python、Go、OpenCV、Vercel Agent Browser 等）——保留"他成了 Compound Engineering 第 3 大贡献者"作为一手 credential 即可
- @kevinrose 当年问"用什么 IDE"的旧帖典故——背景，可以省

**应避免的叙事方向**

- 不要把全片做成"22 条快闪列表"——会变成 Anatoli 式的清单视频，丢掉 Matt 内容的灵魂
- 不要逐条讲 hack——挑 3-5 个最反直觉的展开，剩下让观众感到"还有更多但你已经懂气质了"
- 不要把"Compound Engineering plugin"当成 hero 产品来推——观众不关心具体 plugin 名，关心背后的工作模式
- 不要从"Matt 是谁"开场——他不是名人，从他的处境进场反而强
- 不要在脚本中提及之前 20 期视频里的人名/概念，比如 Tw93、Improvement Loop、Addy 等
- 不要照搬"今天不聊 X 只聊 Y"——这个 hook 套路已经用滥
- 不要假装这是无代价的——要诚实保留"AI Psychosis"那一段作为 tradeoff

## signature_line

"传统开发 80% 写代码 20% 规划——Agentic Engineering 反过来：你只负责品味和方向，Agent 替你写代码、读书、preheat 车子、买啤酒、订机票。"

或更短版："Agent 不是更强的 IDE，是你工作流和生活流之间那扇被拆掉的门。"

## hot_keywords

- **Claude Code** — 全文主语，每一节都围绕它运转
- **Codex** — hack #9 用整节讲他怎么让 Codex 当"第二台引擎"，而且从不开 Codex CLI
- **Subagent / Skills** — hack #17 专讲"自己写 Skill"，但 Matt 的用法不是常规 Skills 教程，他强调"看一个能跑的 Skill 让 Agent 照着写"
- **MCP** — 全文未出现 MCP 字样，这是值得注意的 absent keyword
- **Agentic Engineering** — 这是 Matt 自己命名/重命名的概念框架（"过去叫 vibe coding"），文章标题就是这个词，可以作为叙事锚点
- **plan.md / /ce-plan** — Compound Engineering plugin 的核心命令，整篇围绕它建构，但需要包装为"plan.md 工作流"而不是具体 plugin 名以避免推销感
- **YOLO mode / dangerously-skip-permissions** — hack #8 关键术语，并行 session 必须的条件
