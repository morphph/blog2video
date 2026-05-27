# Insight Memo: Claude 的 17 个隐藏开关——大多数人一个都没打开

## title_zh

Claude 有 17 个开关，你开了几个？

## one_sentence_thesis

大多数人吐槽 Claude "记不住我"、"只会生成文字"、"答得太软"，其实不是模型不行——是这些功能本来就在那里，开关一直没打开，所以你用的永远是默认那个最笨的版本。

## why_this_video_exists

这条视频不是再讲一遍 Claude Code 怎么造、Agent 怎么搭、prompt 怎么写。这些上一周已经被讲烂了。这条视频提供一个被忽略的观察：能力差距早就不是 Claude 的瓶颈，配置差距才是。一篇 2.6M 浏览的清单文，4.7K 收藏、只有 990 个点赞——这个比例本身就在说，大家把它当作"以后要折腾的清单"收起来，然后再也不打开。视频的价值是把这层"知道但没开"的尴尬戳穿，让观众听完真的去点那几个 toggle。

## judgment_lines

- "Claude 答得敷衍，不是模型懒，是你没给它角色" — 来源：原文 5-9 号是五个角色 prompt（心理医生、毒舌导师、健身教练、对话陪练、魔鬼代言人）。同一个模型，挂上 brutally honest mentor 的 system prompt 立刻翻脸不认人。
- "Claude 记不住你，是因为 Memory 默认是关的，不是因为它没有记忆" — 来源：原文第 4 节明确写 "It's off by default. Most people don't know it exists."
- "收藏 4751、点赞 990——这个比例就是 AI 工具采用率的真实写照" — 来源：原文页面统计（saved as homework, never executed）
- "Claude Design 这个产品，连它存在都没几个人知道" — 来源：原文第 16 节 "Most people don't know this product exists. claude.ai/design 直接访问就行"
- "Speculation/KAIROS 那些花哨架构再牛，对一个连 Projects 都没用上的用户来说毫无意义" — 来源：原文第 1 节 "If you've never used Projects, this is the first thing to fix before anything else in this article." 作者自己也把 Projects 排在最前。

## evidence_map

- [具体数字] 文章列出 17 个功能（编号 1-17），覆盖 Web Claude / Cowork / Claude Code / Claude Design / API 五个面
- [具体数字] 2.6M views, 4751 bookmarks, 990 likes, 200 reposts, 36 replies——bookmark/like = 4.8 倍，典型"以后再说"型内容
- [具体事实] Memory 功能默认关闭，原文："It's off by default. Most people don't know it exists."
- [具体事实] Projects 是 #1 优先项，"this is the first thing to fix before anything else"
- [具体事实] Artifacts 在免费版就能用，"Available on the free plan. Most people have never tried it."
- [具体事实] Adaptive Thinking / Extended Thinking 是一个需要主动打开的模式，"Most Claude users have never turned this on."
- [具体事实] Claude in Chrome：浏览器扩展，能读 tab、点链接、填表单、跳 URL
- [具体事实] Claude Cowork：桌面 app，直接访问本地文件系统
- [具体事实] Scheduled Tasks：定时跑任务，不需要用户触发，例子是每周一早 7:30 跑 AI/crypto 新闻摘要存到 /briefs 文件夹
- [具体事实] Skills in Cowork 是"插件式能力包"，类比"phone apps"。装一个 PowerPoint 技能包，Claude 自动知道怎么做 ppt
- [具体事实] CLAUDE.md 文件放在 project 根目录，每次会话开始自动读取，无需提醒
- [具体事实] Claude Code 集成 VS Code / JetBrains，可塞进 GitHub Actions 自动 review PR
- [具体事实] Claude Design 入口：claude.ai/design，导出 PPTX / Canva / PDF / HTML
- [具体数字] Prompt Caching：API 端最高省 90%，缓存 5 分钟 TTL，每次命中刷新
- [具体 prompt] 5 个角色 prompt 在原文给完整模板：CBT 心理医生、毒舌导师、健身教练、难对话陪练、devil's advocate
- [具体配置] cache_control: {"type": "ephemeral"} 是 API 启用 prompt cache 的字段

## non_obvious_points

- "功能存在 ≠ 功能被使用"，这是 AI 工具采用的最大鸿沟。一个 2.6M 阅读的清单文里，最常出现的句子是 "Most people don't know" / "Most users have never turned this on" / "It's off by default" — 不显而易见的点是：作者其实在写一篇"AI 默认设置批评稿"，不是单纯的 feature list。
- "给 Claude 一个角色"这件事的杠杆比"换更强的模型"高得多。文章里那 5 个角色 prompt，每个都让 Claude 表现出一个完全不同的人格——但它们用的是同一个模型。这不是模型升级，是 system prompt 一行字的事。
- 文章里那个对偶很扎眼：Web Claude 的"开关"是产品设置（Memory toggle、Projects、Extended Thinking），Cowork/Claude Code 的"开关"是文件（CLAUDE.md、Skills 包）——从勾选框到配置文件，是同一种"显式开启"思维的两个版本。

## tradeoffs_and_limits

- 17 个功能里至少 4 个有付费/平台门槛或安装步骤（Cowork 桌面 app、Scheduled Tasks、Claude in Chrome 浏览器扩展、Claude Design）。"花 10 分钟全部打开"听起来简单，实际是跨 4-5 个产品环境配置，对非技术用户依然是认知成本。
- Memory 和 Projects 把上下文持久化，意味着把你的工作流、用语、判断喂给 Claude。这是隐私 / 数据治理边界——原文没提，但视频里应该补一句"开 Memory 之前想清楚你愿意让它知道什么"。
- "给 Claude 一个角色"是 prompt 工程的入门技巧，不是终极解药。复杂决策仍然需要观众自己判断，角色 prompt 只是让 Claude 不再一味讨好你，不是让它真的变成一个 20 年经验的导师。

## what_to_leave_out

**不该进入的素材：**
- 17 个功能不要全部讲完。前面已经有"清单文"视频疲劳，全讲完就变成念清单。挑 5-7 个有最大反差/最大杠杆的讲透。
- 不要逐条粘贴原文 prompt 模板。讲清楚"为什么这个角色 prompt 有效"比念 5 个完整 prompt 强。
- Prompt Caching 这条是开发者向的，技术细节不要展开（90% 省钱可以一句话提及，但 cache_control 字段、5 分钟 TTL 这些不进视频）。
- "Try this"、"Use this when..."这些指令性段落是 Twitter 长文格式，视频里转写为我们自己的判断即可。

**应避免的叙事方向：**
- 不要把视频做成"Claude 使用教程"。这是认知重构视频，主线是"为什么大多数人用了一个最弱版本"。
- 不要用"今天教你怎么用 Claude"这种教程口吻。视频是"读完一篇 2.6M 的清单文，我发现真正值钱的不是清单本身"。
- 不要让 17 这个数字成为全片回扣点（"第 1 个、第 5 个、第 17 个……"），这是 PPT 目录式叙事，不是口语。
- 不要在 Hook 用作者名作主语——这是过去几期反复犯的错。
- 不要复述前几期讲过的 Claude Code 内部架构、Skills 作为"训练过的员工"那一套——本期重心是"用户视角的开关差距"，不是构建者视角。

## signature_line

Claude 不是不能做这些事——是大多数人用的那一版 Claude，所有开关都还没打开。

## hot_keywords

- Claude Skills — 第 13 节 "Skills in Cowork"，但角度完全不同：上一期 Khairallah 讲的是 Skill = 训练过的员工（构建者视角），这一期讲的是 Skills 作为"手机 app"——用户安装插件包。两期是同一个词的两种受众视角。
- Claude Code — 第 15 节，但只占 17 项中的一项，并且只讲 user-facing 行为（VS Code 集成、GitHub Actions），完全不碰内部架构。
- CLAUDE.md — 第 14 节，原文角度是"每次会话自动读，写一次永久生效"——和 0xcodez 的 4 层 prompt 结构不重叠。
- MCP — 原文未出现。
- Subagent / Agent Harness — 原文未出现。
- Context Engineering — 原文未出现。
- Computer Use — 间接出现（第 10 节 Claude in Chrome、第 11 节 Cowork），但作者不用这个术语。

整体上：原文是 user 视角的功能清单，不是 builder 视角的架构文。绝大多数热词都不在原文里——这是好事，意味着本期可以挖到一个 builder 视角之外的角度。
