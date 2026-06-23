# Insight Memo: 用 Claude + Obsidian 搭建越用越聪明的 AI 第二大脑

## title_zh
同样订阅费，为什么有人的 Claude 越用越懂你？

## one_sentence_thesis
你以为在搭一套 Claude 工作流，其实你在造一具属于自己的记忆体——大脑归你，工具随时可换。

## why_this_video_exists
绝大多数人把 Claude 当成会忘事的聊天框，每次开新窗都从零重新解释自己。这条视频给的不是"又一个笔记软件推荐"，而是一个认知翻转：当你把记忆从某个 AI 产品里抽出来、变成你电脑上的纯文本文件后，谁拥有记忆本体、谁就拥有这具大脑——而 AI 模型沦为可随时替换的"读取头"。观众拿到的是"为什么这套结构能越用越聪明、而聊天记录只会烂掉"的底层逻辑，而不是十步点击清单。

## judgment_lines
- 第二大脑的价值不在"存笔记"，而在于记忆本体从 AI 产品里被剥离出来归你所有——这意味着明年换个模型指过去照样能用，因为你拥有的是大脑、不是工具 — 来源：原文反复强调"the whole thing is just text files"、"you own the brain, not the tool"、"running on whatever model you point at it"
- 聊天历史会"烂掉"，而这套系统会"变锋利"，差别不在 AI 多强，而在记忆是被丢弃还是被结构化沉淀——同样的订阅，完全不同的机器 — 来源："unlike a chat history that rots, this one gets sharper every single day"、"Same subscription. Completely different machine."
- "别从整个大脑里干活，只打开单个项目"——更聪明的产出反而来自让 Claude 看得更少，因为上下文越窄、聚焦越准 — 来源：Step 7"Don't work from the giant vault. Open just the project... The big vault plans. A single project ships."
- 对 AI agent 说"别删这个文件"是许愿不是安全设置——只要它技术上能删能发，总有一天它就会做，安全必须建在权限层而非措辞层 — 来源：Step 10"keys, not prompts"原则、"don't delete this is a suggestion, not a safety setting"、"read-only and scoped keys, not with words"
- 空的大脑毫无用处,所以第一步不是你手敲资料,而是让 Claude 反过来面试你——把"录入自己"这件最枯燥的事变成一场访谈 — 来源:Step 5"Make Claude interview you"、"Answer like you're briefing a new co-founder"

## evidence_map
- [一手金句] "keys, not prompts"——把权限控制 vs 提示词控制压缩成三个单词的安全铁律
- [一手金句] "Same subscription. Completely different machine."——同样花 $20/月，但你得到的是一台完全不同的机器
- [一手金句] "You own the brain, not the tool."——所有权归属的核心判断
- [一手金句] "unlike a chat history that rots, this one gets sharper every single day"——会烂 vs 会变锋利的直接对比
- [一手金句] "The big vault plans. A single project ships." / "Don't work from the giant vault."——窄上下文出活的操作哲学
- [具体出处] 这套模式由 Andrej Karpathy 于 2026 年 4 月提出，名为 LLM Wiki pattern
- [具体数字] Claude Pro 套餐 $20/月；免费档不可用（Claude Code 需付费版）
- [具体配置] MCP 连接命令含真实端口：OBSIDIAN_HOST 127.0.0.1、OBSIDIAN_PORT 27124，通过 uvx 跑 mcp-obsidian
- [具体陷阱] Obsidian 给的 API Key 前面带"Bearer"字样，粘贴时必须去掉 Bearer 只留后面的字符串——否则连不上
- [具体操作场景] Obsidian 必须保持开启，连接只在 app 运行时有效（Local REST API 插件）
- [具体步骤] 双工具分工：Obsidian 当存储（本地纯文本文件 + [[双链]]形成知识图谱），Claude 当上层大脑（读全库、归档、连接、跨库回答）
- [具体步骤] 项目四件套文件夹结构：Inputs / Process / Outputs / Feedback——想法进 Inputs、Claude 在 Process 干活、成品进 Outputs、结果指标进 Feedback
- [具体机制] CLAUDE.md 放在 vault 根目录会被每次会话自动加载（用 header 结构化），相当于策略层
- [具体操作场景] 自动驾驶：Claude Desktop 的 Schedule 标签设每日 7:00am 定时任务，自动归档 Inputs、标记过期笔记、写 3 行隔夜变更摘要
- [具体数字/产品] 三个现成开源仓库：claude-obsidian(AgriciDaniel，含 executive/builder/creator/researcher 角色预设)、obsidian-second-brain(eugeniughelbur，43 条现成命令如 /obsidian-save、跨 Claude/Codex/Gemini)、second-brain-starter(coleam00)
- [具体操作场景] 接活数据：calendar/Gmail/Slack/Notion 都用 `claude mcp add` 接入，原则是尽量只授 read-only

## non_obvious_points
- 让 Claude 看得更少反而出活更好——直觉是"喂给 AI 越多上下文越聪明"，但本文主张"别在巨型 vault 里工作，只打开单个项目"，因为聚焦的窄上下文才出货，大库只负责规划 — 为什么这不显而易见：和"上下文越多越好"的主流叙事直接相反，多数人会把所有资料堆给 AI
- 给 agent 写"别删这个"是没用的——人们本能地用自然语言对 AI 下禁令，但只要它技术权限上能做，措辞约束就是许愿；真正的安全是 scoped/read-only 的 key — 为什么这不显而易见：自然语言指令"看起来"像在设规则，人们误以为说了就生效，而真相是权限层才是唯一的安全边界
- 录入自己时不该自己打字，而要被 AI 反向面试——空大脑无用，但人们会试图手敲全部背景；正解是让 Claude 一次问一个问题把你"采访"出来 — 为什么这不显而易见：直觉是"我自己最了解我，我来写"，但访谈式提取比独白式输入更完整、更省力

## tradeoffs_and_limits
- 强依赖本地运行 + 付费订阅，且连接脆弱 — 具体表现：必须 Claude Pro($20/月)、免费档不可用；Obsidian 必须全程开着否则 REST API 连接断；纯本地文件意味着没有内置云同步/多设备协作，可靠性靠你自己维护
- 自动驾驶 = 把写权限交给一个会犯错的 agent — 具体表现：定时任务让 Claude 自动归档、移动、标记笔记，一旦权限给宽，"keys not prompts"的风险就落到你头上；作者自己也承认"if it can delete a file, assume one day it will"

## what_to_leave_out
- 不该进入的素材：Step 1–4 的逐步点击安装细节（下载哪个按钮、点哪个 gear、装哪个插件）——这是教程操作流水，进了视频会变成枯燥的"跟我点"清单，稀释认知密度。MCP 命令里的端口号 27124、Bearer 去除这类配置细节也只在真要动手时才有用，口播里点到"连接很脆、有个坑"即可，不念配置串。
- 应避免的叙事方向：① 不要走"完整安装指南/十步教你搭建"的 how-to 框架——这会让视频沦为说明书，失去判断力；正确方向是讲"为什么这套东西在所有权和记忆结构上是个范式翻转"。② 不要平铺十个步骤，要抓三四个反直觉内核(归你不归工具 / 会变锋利 vs 会烂 / 看得越少出活越好 / 权限不是措辞)。③ 避免把它说成"又一个笔记 app/效率工具推荐"。

## signature_line
你不是在配置一个 Claude，你是在造一具自己的记忆体——AI 会换代，但大脑归你，越喂越聪明。

## hot_keywords
- [Claude Code] — 原文 Step 1，Claude Desktop 里的 Code 标签，"can actually read and write files on your computer"，是整套方案能读写 vault 的前提
- [Obsidian] — 全文核心工具之一，作为本地纯文本存储 + 双链知识图谱
- [Second Brain] — 标题及全文主题词，"AI Second Brain"
- [MCP] — Step 4，"the standard way Claude talks to other apps"，用 `claude mcp add` 接 Obsidian/calendar/Gmail
- [Skills] — Step 8，"a skill is a saved workflow Claude runs on command"，把重复动作存成可复用技能
- [Karpathy] — 引言段，Andrej Karpathy 2026 年 4 月提出的 LLM Wiki pattern
- [LLM Wiki] — 引言段及开源仓库描述，本方案的理论原型
- [Context Engineering] — 隐含于 Step 7"只打开单个项目让 Claude 看得更少"的上下文管理实践（原文未直接用词，但语境强相关）
