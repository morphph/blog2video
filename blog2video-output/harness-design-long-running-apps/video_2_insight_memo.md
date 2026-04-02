# Insight Memo: Video 2 — 9美元 vs 200美元：Harness的实战代价与模型进化

## one_sentence_thesis
Harness中的每一个组件都是对当前模型局限性的一次押注——模型一升级，你精心设计的架构可能瞬间变成技术债务。

## audience_problem
AI工程师花了大量时间搭建多Agent协作框架，但不知道这些投入什么时候会变成过度工程。更现实的问题是：面对一个复杂任务，到底该让单Agent硬扛还是上完整Harness？没有人告诉你这个决策的判断标准。

## why_this_video_exists
因为Anthropic自己的工程师用真金白银（$9 vs $200）做了对照实验，又在模型升级后亲手砍掉了自己设计的组件。这种"先建后拆"的一手数据极其稀缺，大多数团队只会往架构上加东西，从来不敢减。

## what_this_video_is_not
- 不是鼓吹"多Agent一定比单Agent强"的视频
- 不是教你复刻Anthropic完整Harness的教程
- 不深入Generator-Evaluator的具体实现（Video 1内容）
- 聚焦在决策逻辑和进化规律上

## judgment_lines
- 9美元买到的不是"差一点的产品"，是一个"看起来完成但核心全坏"的幻觉——单Agent最危险的不是失败，是交付看似正常但不可用的东西 — 来源：Solo run核心功能broken
- 200美元不是"好22倍"，而是从"不可用"到"可发布"的相变——复杂任务存在一个"最低有效投入"阈值 — 来源：$9 vs $200对比
- Sprint分解在Opus 4.6面前直接被废弃，说明这个组件从一开始就不是在解决"真正的难题"，而是在补偿模型的上下文处理能力不足 — 来源：Model Evolution Impact
- Planner和Evaluator在模型升级后依然存活，说明"规划"和"外部评估"可能是比"任务分解"更本质的能力缺口 — 来源：Maintained: Planner and evaluator
- "找到最简方案，只在必要时增加复杂度"——这句话从一个刚花了200美元跑6小时的人嘴里说出来，分量完全不同 — 来源：原文结论

## evidence_map
- [对比数据] 同一prompt：单Agent 20分钟$9 vs Harness 6小时$200
- [具体事实] 9美元版本：核心gameplay broken，poor UX
- [具体事实] 200美元版本：fully functional with polish and AI integration，含物理引擎、working entity controls、AI-assisted game design
- [具体事实] Opus 4.6后：Sprint decomposition被移除，Evaluator从per-sprint改为end-of-run single pass
- [数字] DAW案例：简化后Harness约4小时$125，产出功能性音乐制作工具
- [具体事实] Context anxiety：Sonnet 4.5接近上下文窗口限制时提前收工，compaction不够需要context reset
- [引用] "find the simplest solution possible, and only increase complexity when needed"

## non_obvious_points
- **被砍掉的组件反而信息量最大**：Sprint分解被废弃精确告诉我们Sonnet 4.5的上下文处理能力是当时Harness在补偿的核心瓶颈。每个被废弃的组件都是模型能力边界的化石记录 — 为什么不显而易见：人们关注保留了什么，忽略了删除了什么
- **Context重置优于Context压缩**：保留更多历史信息不一定更好——干净的重启加结构化交接，比带着噪声和模型焦虑的长上下文效果好 — 为什么不显而易见：违反"信息越多越好"的直觉
- **成本不是线性的，效果也不是**：花22倍的钱不是得到22倍改进，而是从废品到成品的相变。低于某个阈值花多少都是浪费 — 为什么不显而易见：人们习惯线性思维

## tradeoffs_and_limits
- 200美元和6小时对于个人开发者来说是真实的成本门槛，Anthropic的实验条件不能直接照搬
- "模型升级后简化Harness"的建议需要持续回归测试投入来验证哪些组件可以安全移除——大刀阔斧砍会失败，必须每次只移除一个变量
- 实验只在前端/全栈应用场景做了验证，其他领域的成本-质量曲线可能完全不同
- 按同样逻辑，下一代模型可能也会让Planner和Evaluator变得多余

## what_to_leave_out
- Generator-Evaluator模式的详细技术实现（Video 1内容）
- 四个设计评分标准的具体内容（Video 1内容）
- Playwright交互测试的技术细节
- 前端设计美学讨论
- "museum quality"措辞影响（可一句带过但不展开）

## memorable_examples
- **"9美元的自信垃圾"**：单Agent做的复古游戏编辑器，界面有了按钮有了，但精灵动不了关卡编辑器报错——Agent说"完成了"。适合用在：开头对比，具象化单Agent的危险
- **"Sprint分解的葬礼"**：Opus 4.6发布后工程师做的第一件事不是加功能，而是删代码。适合用在：讲模型进化对架构的冲击
- **"Context Anxiety考试焦虑"**：模型快到上下文窗口尽头时像考试快交卷的学生匆忙收尾。适合用在：讲隐藏的坑
- **DAW案例**：简化后的Harness 4小时$125做出浏览器端音乐制作软件。适合用在：证明简化不等于降级

## slide_spine
1. **cover**: Hook——9美元vs200美元，同一AI同一需求，差距不是"稍好一点"是两个时代
2. **principle**: 9美元的危险——交付"看起来完成但核心全坏"的幻觉
3. **comparison_cards**: 200美元的实际产出 vs Opus 4.6后的架构简化（Sprint被砍、Evaluator保留）
4. **checklist**: Context anxiety + 提示词蝴蝶效应 + 每个组件都编码假设
5. **summary**: "先找最简方案" + 行动号召：审计你的每个架构组件

## ending_action
如果你在搭AI Agent系统，现在就列出你用的每一个组件。然后问自己：这个组件解决的是什么模型局限？如果最新模型已经没这个局限了，大胆拆掉它。

## signature_line
你的Harness架构，就是你对模型局限性的认知地图——模型每升级一次，这张地图就该重新画一次。
