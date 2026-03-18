# Video 2：5个原则让Claude Code Skill从能用变成好用？

[SLIDE 1: cover]

你写了一个 Skill。
Claude 确实能用了。

但每次都要重新配置 Slack 频道。
有时还不小心 push 到 main。

能跑，和好用，差了十万八千里。

这里是精读AI。
AI 世界很吵。
每期帮你读透一篇最值得读的。

上期讲了 Skill 的结构设计和 Gotchas 清单。
这期聊怎么让 Skill 真正好用。

[SLIDE 2: principle]

先说最反直觉的一条。

Skill 的 description 字段。
你觉得它是给人看的文档。

错。它是给模型看的触发词。

像外卖 app 的搜索标签。
你搜"奶茶"能找到店。
因为商家标签写的是"奶茶"。
不是"基于茶叶的冷饮制品"。

babysit-pr 这个 Skill。
description 如果写成一段正式描述。
Claude 不知道什么时候该用。

改成 "babysit, watch CI"。
再加一句 "make sure this lands"。
用户说"帮我盯着这个 PR"。
Claude 立刻匹配上。

一个字段的改动，激活率完全不同。

[SLIDE 3: comparison_cards]

第二，缓存首次配置。

像微信登录，扫一次码。
之后就自动了。

standup-post 需要知道发哪个频道。
SKILL.md 里嵌入 shell 命令。
读取 config.json。
文件不存在就问你。
问完保存，下次直接用。

第三，用 CLAUDE_PLUGIN_DATA 存数据。
这个目录跨会话持久保存。
Skill 升级了，数据还在。
日报 Skill 每次发完追加日志。
下次就能对比昨天的内容。

第四，给代码不给描述。

lib/signups.py 里有三个函数。
docstring 里直接嵌着 gotchas。
比如要用 signup_completed。
不是 signup_started。
要按 anonymous_id 去重。

Claude 查注册量下降时。
直接 import 组合，不从零开始。
坑都写在注释里，不踩第二次。

[SLIDE 4: checklist]

生产级 Skill 的六条清单。

第一，description 写触发短语。
第二，首次配置自动保存到 config.json。
第三，CLAUDE_PLUGIN_DATA 做跨会话记忆。
第四，提供可组合的代码。gotchas 嵌入 docstring。
第五，加按需钩子做安全护栏。会话结束自动解除。
第六，持续迭代。每次出错加一条 gotcha。

[SLIDE 5: summary]

Skill 不是文档，是活的系统。

触发词写给模型看。
配置只问一次。
数据跨会话保存。
给代码而不是描述。
钩子防住危险操作。

最好的 Skill 不是一次写对的。
是你踩坑、补充、越用越好的。

现在去做一件事。
把 description 改成用户会说的话。
再加上首次保存机制。

AI 世界很吵，精读一篇，胜过刷一百条。
我们下期再见。
