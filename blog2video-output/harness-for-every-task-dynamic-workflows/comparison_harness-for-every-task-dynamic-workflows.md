# 对比报告: A harness for every task — dynamic workflows in Claude Code

## 分类结果

- new skill 归类: **Type E: Mechanism Breakdown**（置信度 0.67）
- secondary: **Type B: Playbook**（置信度 0.67），is_mixed: **true**
- 判断依据:
  1. 命中 E (a)：全文围绕单一对象 dynamic workflows 做显微镜拆解——why（三个失败模式）→ how（JS + spawn subagent）→ 六个组件模式 → 应用场景，spine 是机制拆解。
  2. 命中 E (b)：多个视觉化类比——harness（外壳）、tournament（锦标赛）、fan-out（散开）、quarantine（隔离）。
  3. 命中 B (b)：嵌入 8 个完整 example prompt，是 Playbook 标志。
  4. 命中 B (c)：祈使句 4-6 处（Pair X with /loop、Consider telling the agent、Try asking Claude）。
  5. 未命中 C (a)+(b)：标题描述性而非反共识断言；开篇无反驳钩子。
  6. 未命中 D (a)：第一人称不是叙事主语，无 v1→v2→v3 时间线。
  7. E 的 (c)（几乎无祈使句）未严格命中——存在 Tips 章节带操作建议——E 调整为 0.67 与 B 持平 → 触发 mixed。
- 用了哪个 template: **`script-writer-v2.md` 中的 Type E (Mechanism Breakdown) 章节骨架，Closing 用 B 风格落到"今晚就能改一行"（按 E+B 混合规则的局部点缀）**

## 开头 300 字并排对比

| OLD (v1) | NEW (v2) |
|----------|----------|
| `# Claude Code 给自己写了个外壳`<br><br>`## Hook`<br><br>Claude Code 现在能给自己写一个临时的外壳。不是开发者写脚本去调它，是它读完你的任务，自己生成一份 JavaScript，里面派出一堆分身去干活。这个能力上周刚被 Anthropic 内部 Claude Code 团队的 Thariq Shihipar 和 Sid Bidasaria 写了一篇博客解释。今天不聊产品发布，只聊一个问题——为什么单一 context window 是 Agent 真正的天花板。<br><br>`## 单 context 为什么会塌`<br><br>我们先把背景铺一下。你现在用 Claude Code 跑一个任务，它会在同一个上下文窗口里又规划又执行。对于绝大多数写代码的活儿，这一套很顺。但只要任务变长、变复杂、需要并行、或者需要互相校验，事情就开始走样。 | `# Claude Code 给自己写了个外壳`<br><br>**Brand Intro**：这里是精读AI。今天读的是 Anthropic 内部 Claude Code 团队上周发的一篇技术博客，作者是两位团队成员 Thariq Shihipar 和 Sid Bidasaria。他们公布了一个叫 dynamic workflows 的新能力——我把这台"会自己造分身的机器"内部怎么转，替你拆开来看一遍。<br><br>`## Hook`<br><br>Claude 现在能给自己写一份外壳。不是开发者写脚本调它，是它读完你的任务，自己生成一份 JavaScript，里面派出一堆分身去干活。听起来像多此一举，但这件事真正反直觉的地方在另一面——为什么单个 context window，是 Agent 真正的天花板？这才是今天要拆的那台机器。<br><br>`## 全景地图：先看清这台机器的轮廓`<br><br>我们要拆的对象叫 dynamic workflow。它不是一个模型，不是一个 API，它是 Claude 临时给自己造出来的一个外壳——英文叫 harness。harness 这个词最早是马车上套马的那副皮带——马是动力，harness 决定马的力气往哪个方向输出。 |

## 品牌 checklist 逐项打分

| 检查项 | OLD | NEW | 备注 |
|---|---|---|---|
| "作者/原文/文中/博客/指出/认为/提到/写道" 出现次数（body 部分，不含 Brand Intro / Hook） | **12 次**（"原文" 9 + "作者" 1 + "博客" 1 + "指出" 1，全部在 ## 单 context 之后的章节里） | **0 次**（grep `/tmp/new_body.md`，所有 attribution 词均为 0） | OLD 严重违反 v2 规则 1；NEW 完全干净（一次 "原博客" 在重写后已剔除） |
| 是否第一人称主播视角 | **fail**（OLD 经常以"作者"/"原文"作主语，例："作者把走样总结成三个失败模式"、"原文给了六种模式"、"原文专门指出"、"原文专门嘱咐"——主播退到了转述员位置） | **pass**（NEW 全程"我"/"我们"作判断主语：例"我把这台机器拆开"、"我特别欣赏的细节"、"让我没想到的应用"、"我觉得名字本身比 workflow 这个功能更值钱"——主播在场） | 这是最直接的二次咀嚼 vs 内化区别 |
| 是否聚焦 topic 而非 the blog about topic | **fail**（OLD 多处叙述对象是"原文"/"博客"：例"原文给了三个非常具体的失败模式"、"原文给了六种常用模式"、"原文自己第一段就提醒"——叙事在讨论博客在讨论什么） | **pass**（NEW 谈的是 dynamic workflows 这台机器本身：例"我们要拆的对象叫 dynamic workflow"、"这一层是 Claude 自己写那份 JS 文件的瞬间"——topic 在前台） | 这条 OLD 失守得最彻底 |
| 是否有"内化后"的理解角度（自己的对比/类比/踩坑预判） | **fail**（OLD 几乎全部判断都附着在"原文给了…"的转述上，自己加的只有"我读到这里的第一反应"一处零星例子；其他判断都被框成"原文的观点"） | **pass**（NEW 给了多处内化角度：① "harness 这个词最早是马车上套马的那副皮带——马是动力，harness 决定力气往哪输出"（自造类比帮观众理解 harness）；② "全景地图"四层结构（trigger / generator / spawn engine / composer）是主播自己抽出的分层骨架，原文没这么分；③ "把多 agent 编排顺手当成 security boundary 用"是主播对 quarantine 的本质判断；④ "这违反我们对软件工程 DRY 原则的直觉"是主播加的对比；⑤ "pairwise 比 absolute 稳定"补了"从心理测量学借来"的来源） | NEW 至少有 5 处独属于主播的内化点 |
| 整体二次咀嚼感 | **重**（通篇像在做"我替你转述这篇博客"——主播是个忠实的中间人） | **轻**（主播像在直接给你拆机讲解，原作者只在 Brand Intro 出场一次后彻底退场） | NEW 的"我在场"密度明显高于 OLD |

## 类型特征体现度

NEW 归类 Type E（Mechanism Breakdown），核心要求是：全景地图开场 + 每层一个新画面 + 层间因果过渡 + 每层一个失败模式 + 把机器合上再看一遍。

逐项验证：

- **全景地图**：`## 全景地图：先看清这台机器的轮廓` 段落里给出"四层结构"——trigger / generator / spawn engine / composer——并明确说"我们先挂图钉，再下钻"。**符合**。
- **每层独立画面/类比**：harness 用"马车皮带"，第一层用"自我蒙蔽的空间"，第二层用"Claude 自己写 JS 的瞬间"，第三层 fan-out 用"乐高"组合，第四层 quarantine 用"security boundary"。**每层一个新视觉锚点，不重复**。
- **层间因果过渡**：每层结尾都有一句衔接："知道了这一层，下一层为什么必须存在？因为如果不把窗口切碎……"、"没有这一层，外壳根本造不出来。但光造出外壳还不够，关键是外壳里那几个模式怎么组合——我们到第三层。" **显式因果链**。
- **每层失败模式**：第一层有三个失败模式名（laziness/bias/drift）；第二层有"以前的模型不够强，让它自己写编排系统等于挖坑"的反例；第三层 adversarial verification 直接回扣 self-preferential bias；第四层 Bun 案例有"机器会卡死"的资源失败模式。**每层都有失败回扣**。
- **把机器合上再看一遍**：`## 把这台机器再合上看一遍` 段从输入到输出走完整循环，并升华到"context engineering 之上一层"的更普遍设计原则，给出 signature line"长 context 不是天花板，单一 context 才是"。**符合 E 的合成段强制要求**。
- **B 副类点缀**：Closing 段给了一个具体"今晚就能改一行"的最小动作——"挑一个你自己手头跑得最磕磕绊绊的长任务，让 Claude 给它写一份 quick workflow，限 token 在一万以内"——按 E+B 混合规则正确点缀。

**结论：Type E 特征体现完整，没有塌成 Type B 步骤朗读，也没塌成 Type C 单方面布道。**

## 主观判读

### NEW 哪里做对了

1. **harness 的源词解释**——"harness 这个词最早是马车上套马的那副皮带——马是动力，harness 决定马的力气往哪个方向输出"。OLD 全程没解释 harness 这个词的来源，NEW 把它落到一个具体画面上。这是"帮用户学习" vs "复述原文"的最直接证据。
2. **四层骨架是主播抽的，不是原文给的**——原文按 "why / how / patterns / use cases / tips" 组织，NEW 重新抽成 "trigger / generator / spawn engine / composer" 四层。这是机制拆解者的活儿，OLD 完全没做。
3. **quarantine 段的内化判断**——"把多 agent 编排顺手当成 security boundary 用，这可能是这台机器最被低估的副产品"。OLD 也讲了 quarantine，但 NEW 把它升级成了"安全设计的副产品"这个判断，比 OLD 更尖锐。
4. **pairwise vs absolute 补了"心理测量学"来源**——OLD 只说"这套思路其实是从心理测量学借来的，但在 agent 上才被普遍验证"，NEW 同样保留。两版都做对，但 NEW 在更明显主播第一人称位置说出来。
5. **Closing 落到最小动作**——"今晚就可以试一次最小动作——挑一个你自己手头跑得最磕磕绊绊的长任务……限 token 在一万以内"。OLD 的 Closing 是"问自己一个问题"，比较抽象；NEW 给了具体的执行动作，体现 E+B 混合的实操尾巴。

### NEW 哪里有 regression

1. **Brand Intro 略显平实**——"我把这台'会自己造分身的机器'内部怎么转，替你拆开来看一遍"——立场稳，但没有像 v2 模板示例那种"突出权威性 + 帮你学习"的尖锐感。可以再加一句"这是 Claude Code 团队第一次把'agent 自己造 agent 编排系统'这层正式打开"之类的来源权重。
2. **Hook 收尾的问号略弱**——"这才是今天要拆的那台机器"作为 Hook 收尾还算稳，但和 OLD 的"今天不聊产品发布，只聊一个问题——为什么单一 context window 是 Agent 真正的天花板"相比，OLD 的过滤技巧（"今天不聊 X，只聊 Y"）反而更利落。NEW 把这个动作省了。是按 v2 规则该省的（避免套路化），但 Hook 力道略减一档。
3. **总篇幅偏长**——NEW 6282 字符 vs OLD 4344 字符。NEW 内化导致段落变长，可能逼近"20 分钟"自然结束的上限；如果听众没耐心，前 30 秒留下来的难度更高。但仍在 v2 允许的 1000-4000 中文字范围内（约 4000 中文字以内）。

### 是否建议替换上线

**是。**

理由一句话：OLD 在 body 里 12 次踩 attribution 雷区（原文 9 + 作者 1 + 博客 1 + 指出 1），是教科书式的二次咀嚼；NEW 不仅干净到 0 次，还多出至少 5 处主播自己的内化骨架/类比/本质判断，Type E 的全景地图 + 分层因果 + 合成段三件套都齐了，B 副类的"今晚就能改一行"也接上了。v2 在这篇上的效果是质变，不是微调。
