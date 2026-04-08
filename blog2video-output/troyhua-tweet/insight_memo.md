# Insight Memo

## title_zh
Claude Code 6层记忆管线：每轮对话背后的200K token生存术

## one_sentence_thesis
Claude Code 用逐层拦截的方式把上下文管理变成了一个经济学问题——最便宜的层先触发，贵的层只在前者失败时才启动，这比"一刀切压缩"高效得多。

## judgment_lines
1. 6层管线的核心不是技术架构，而是成本分级——从<1ms的磁盘写入到30秒的跨会话整合，每层都有明确的"拦截"职责，防止更贵的操作触发。（来源：Layer 1-6 成本和时间标注）
2. "Dreaming"机制是最被低估的设计——5道门控（24小时+5次会话+文件锁+节流）确保它几乎零成本运行，却能跨会话整合记忆，相当于给AI加了"睡眠巩固"。（来源：Dreaming Gate Checks 段落）
3. Session Memory Compact 是真正的性价比杀手——复用已有笔记做摘要，不需要API调用，5秒完成，避免了Full Compaction的完整API开销。（来源：Layer 3 vs Layer 4 对比）
4. 多智能体通信的4种模式揭示了一个设计哲学：上下文继承是默认选项（Fork），隔离是刻意选择（Named/Worktree/Remote）。（来源：Multi-Agent Patterns 段落）

## evidence_map
- **硬参数**: 默认上下文窗口200K tokens，1M窗口需[1m]后缀；单工具结果上限50,000字符/400,000字节；消息聚合上限200,000字符 → 类型：系统参数，说服力：高
- **分层成本对比**: Tool Result Storage <1ms vs Full Compaction ~10s（完整API调用）vs Dreaming ~30s（后台免费）→ 类型：架构量化，说服力：高
- **Dreaming 5道门控**: 24小时间隔 + 5次会话 + 10分钟扫描节流 + 文件锁 + Feature flag，每道门控成本仅1次stat()调用 → 类型：实现细节，说服力：中高
- **Autocompact 3-strike断路器**: 连续失败3次后停止尝试压缩，防止死循环 → 类型：容错设计，说服力：中
- **Session Memory参数**: 保留10K-40K tokens，单段最长2K tokens，总量上限12K tokens → 类型：系统参数，说服力：中

## non_obvious_points
1. **Layer 5 和 Layer 6 标注为"Free*"带星号** — 它们是后台运行的，不阻塞用户交互，但实际仍消耗计算资源。设计者把"用户感知成本"和"实际成本"做了分离，这是产品思维而非纯工程思维。
2. **Fork agent 继承父上下文的字节级完全一致** — 这不只是"继承上下文"，而是利用了KV cache的前缀匹配特性，意味着Fork的边际成本接近于零，这解释了为什么Claude Code大量使用Fork而非Named agent。
3. **Memory有三个作用域（user/project/local）且project通过VCS共享** — 这意味着团队协作时，一个人教会Claude Code的项目知识会自动传播给所有团队成员，是隐性的知识管理系统。

## tradeoffs_and_limits
- 博客来自源码逆向分析，参数可能随版本更新而变化，不是官方文档
- 6层管线的复杂度本身是一个维护负担——每增加一层都增加了调试难度和边界条件
- 1M上下文窗口需要特殊后缀激活，说明这不是默认体验，大多数用户在200K限制内工作
- Dreaming的24小时+5会话门控意味着轻度用户可能永远触发不了这个功能

## what_to_leave_out
### 素材类
- 所有具体参数的罗列表格（Per-tool result、Session Memory、Full Compaction参数等）——观众记不住，挑2-3个最有冲击力的数字即可
- Microcompaction的三种子策略（time-based、cache-editing、API-level）——太细节，合并为"自动清理旧结果"
- Query Loop的10个步骤逐一讲解——应该简化为"3阶段：预处理→API调用→后处理"

### 叙事方向类
- 不要做成"Claude Code使用教程"——这是架构解剖，观众是想理解设计思想的开发者
- 不要逐层平铺——应该突出"成本分级拦截"这个核心洞察，其余层是佐证
- 不要花时间解释什么是上下文窗口——目标观众已经知道

## signature_line
大多数人以为AI只是在"记住对话"，但Claude Code其实在运行一套6层经济系统——最便宜的记忆先上，最贵的记忆在你睡觉时才偷偷启动。
