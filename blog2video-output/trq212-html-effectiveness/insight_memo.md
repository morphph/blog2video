# Insight Memo: HTML 不是格式选择，是"在场"机制

## title_zh
我为什么不再读 AI 写的 markdown

## one_sentence_thesis
Claude Code 团队成员 Thariq 把输出格式从 markdown 切到 HTML，表面是格式升级，真正的动机是：当 AI 越来越强、plan 越写越长，他不想让"读不进去"变成"把判断权让渡给 AI"。

## why_this_video_exists
这是 Anthropic Claude Code 团队成员的一手观察（@trq212，3.4M views / 13K bookmarks），不是外部用户的"使用技巧"。普通教程会教你"怎么让 Claude 写 HTML"，但只有内部团队会告诉你：他们真正担心的不是输出格式，是"人类在 AI 协作流里逐渐隐身"——以及他们用什么具体动作把自己拉回 loop。这种"工程姿态层面的选择"在博客目录、教程站、KOL 二手解读里都拿不到。

## judgment_lines
- markdown 不是错的，是被 agent 的产能撑爆了——超过 100 行就没人读，"读不进"才是真问题 — 来源：原文 "I tend to not actually read more than a 100-line markdown file, and I certainly am not able to get anyone else in my organization to read it."
- 真正的恐惧不是"AI 写得不够好"，而是"我开始不读 AI 写的东西了" — 来源：原文 "I had begun to fear that because I had stopped reading plans in depth I would simply have to leave Claude to make its choices."
- HTML 的核心价值不是"信息密度高"，而是"人愿意打开它" — 来源：原文 "The chance of someone actually reading your spec, report or PR writeup is much much higher if it's in HTML."
- 一次性 HTML editor（throwaway editor）是 AI 时代 UI 的原型：不是产品、不是工具、用完即弃，关键在末尾的"copy as JSON / copy as prompt"按钮 — 来源：原文 "Not a product, or a reusable tool, but a single HTML file, purpose-built for this one piece of data... always to end with an export"
- 作者诚实列出代价（2-4x 慢、diff 难 review、token 多）——这是不打口号的工程姿态，不是布道 — 来源：原文 FAQ 段落

## evidence_map
- [一手引用] "the real reason I use HTML is that I feel much more in the loop with Claude"（结尾点破真相的那句）
- [数字] 100 行：作者自陈 markdown 阅读阈值
- [数字] 2-4x：HTML 比 markdown 生成慢的倍数
- [数字] 1MM context window（Opus 4.7）：作者认为 token 增加在新 context 容量下不再重要
- [具体场景] 拖拽式 Linear ticket 重排 + "copy as markdown" 导出
- [具体场景] feature flag 编辑器：分组 + 依赖检查 + "copy diff"
- [具体场景] 系统 prompt 的 side-by-side 编辑器 + 实时预览 + token counter
- [具体场景] PR review HTML：内联 diff + margin annotations + severity 颜色编码
- [反例] markdown 里 Claude 用 unicode 字符估计颜色（作者的"my favorite"——荒诞证据）
- [类比/原型] sliders/knobs 调动画参数 → "copy parameters" 把状态送回 Claude Code（双向交互范式）
- [背景权威] 作者是 Anthropic Claude Code team 成员；3.4M views / 13K bookmarks
- [反直觉态度] "I'm a little bit afraid that people will read this article and turn it into a /html skill"——作者主动反对工具化，强调"从零 prompt 起手"

## non_obvious_points
- **HTML 是 Claude Code 的双向输入界面，不是输出格式** — 为什么这不显而易见：99% 读者会把 HTML 当作"更好看的 markdown"——单向、只读。但作者真正在用的是 sliders/knobs/draggable cards + "copy as prompt" 按钮，HTML 在他这里是 GUI，是 chat 输入框的扩展。这把"格式选择"的讨论维度直接抬到"交互范式"。
- **"读得进"是"判断权"的代理变量** — 为什么这不显而易见：表面看作者在抱怨可读性，实际担心的是认知主权——"我不读 plan = 我把 plan 决策外包给了 AI"。这个因果链作者藏到了文章最后一段才点破，前面 90% 内容看起来是"格式比较"，但真正的论点是"如何避免人在 AI 协作里隐身"。
- **disposable / throwaway 是关键限定词** — 为什么这不显而易见：在工程文化里，"做个工具"通常意味着"可复用、要维护、要测试"。作者反着来——明确说"不是产品、不是 reusable tool"，就是为这一份数据、这一次任务做一个一次性 UI，用完即弃。这个反"DRY"姿态只有在"生成成本接近零"的 AI 时代才成立，是个新的设计 primitive。
- **Claude Code vs ClaudeAI 的真正分水岭是 context ingestion** — 为什么这不显而易见：很多人以为 Claude Code 只是"带 terminal 的 Claude"。作者点出本质区别：Claude Code 能读 file system / MCPs / browser / git history——所以它产出的 HTML 是带项目语境的，不是无根的设计稿。这把"为什么不用 ClaudeAI 做同样的事"这个隐性问题答了。

## tradeoffs_and_limits
- **生成慢 2-4x** — 具体表现：每次让 Claude 写 HTML 而不是 markdown，等待时间显著增加；作者说"results are worth it"，但这是个真实成本
- **diff noisy，难 code review / 难做版本控制** — 具体表现：作者自己点名这是"one of the biggest downsides"——HTML 改一个字，整行甚至整块标签会重排，git diff 看不出实际变化
- **token 消耗更高** — 具体表现：HTML 标签开销大；作者用"1MM context window"作为缓解理由，但这其实是把成本转嫁给了模型容量
- **风格容易变丑 / 不一致** — 具体表现：作者建议用 frontend design plugin 或建一个公司内部的 design system HTML 文件作为参考；说明默认产出未必符合品牌调性

## what_to_leave_out

**1. 不该进入的素材：**
- "It's Joyful"段落（情感型卖点，会冲淡核心论点）
- 详尽列举所有 use cases（Specs / Code Review / Design / Reports / Custom Editors 全展开会变成博客目录复述）
- 每个 use case 的 example prompt（教程感太强，视频不是 tutorial）
- "如何让 Claude 不写丑 HTML"（这是 how-to 细节，不是认知层面的洞察）

**2. 应避免的叙事方向：**
- 不要走"教你写 HTML prompt"路线——视频不是教程
- 不要把"HTML > markdown"当主结论——博客自己最后才点破真正核心是"stay in the loop"，视频应该顺着这个真正的论点走
- 不要列 use cases 当骨架——会变成"博客有什么我复述什么"
- 不要把它包装成"Anthropic 内部黑科技"做猎奇——作者本人姿态是反工具化的（"a little bit afraid people will turn it into a /html skill"）
- 不要忽略 tradeoffs——把局限也讲出来才匹配作者的工程诚实，否则视频会比原文更轻浮

## signature_line
当 AI 写得比你读得快，"读得进"就是你保留判断权的最后一道闸——HTML 不是更好的输出，是把人重新按回驾驶座的机制。
