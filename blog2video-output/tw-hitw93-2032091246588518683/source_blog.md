# Claude Code 深度指南：从工具使用者到系统设计者

**Author:** Tw93 (@HiTw93)
**Source:** https://x.com/HiTw93/status/2032091246588518683
**Date:** 2026-03-12

---

## 引言

Claude Code 不只是一个终端里的 AI 助手，它是一个完整的 agentic coding 系统。大多数人停留在"问它写代码"的阶段，但真正的效率提升来自于理解它的架构，并围绕这个架构构建你自己的工作流。

本文将从 Claude Code 的核心架构出发，逐层拆解它的七大可编程层，帮助你从工具使用者进阶为系统设计者。

![Claude Code 启动界面](images/image_1.jpg)

## 一、Claude Code 的七层可编程架构

Claude Code 的能力不是铁板一块，而是分成了清晰的七层，每层有不同的职责：

| 层 | 职责 |
|---|------|
| CLAUDE.md / rules / memory | 长期上下文，告诉 Claude "是什么" |
| Tools / MCP | 动作能力，告诉 Claude "能做什么" |
| Skills | 按需加载的方法论，告诉 Claude "怎么做" |
| Hooks | 强制执行某些行为，不依赖 Claude 自己判断 |
| Subagents | 隔离上下文的工作者，负责受控自治 |
| Verifiers | 验证闭环，让输出可验、可回滚、可审计 |

![七层架构表](images/image_2.jpg)

理解这七层的关键在于：它们不是功能列表，而是设计维面（design surfaces）。每一层解决的是不同维度的问题。

## 二、Agentic Loop：Claude Code 的运行模型

Claude Code 的核心运行模型是一个 agentic loop：

1. **Gather context** — 收集上下文（读文件、搜索代码、查看 git 历史）
2. **Take action** — 执行动作（写代码、运行命令、调用工具）
3. **Verify results** — 验证结果（运行测试、检查输出、审查变更）

这三步不断循环，直到任务完成。你可以在任何时刻介入：打断、调整方向、补充上下文。

![Agentic Loop 示意图](images/image_3.jpg)

## 三、五大设计维面（Design Surfaces）

从架构层映射到实际设计时，可以归纳为五个维面：

| 层面 | 核心问题 | 主要载体 |
|------|---------|---------|
| Context surface | 哪些信息常驻，哪些按需加载 | CLAUDE.md、rules、memory、skills |
| Action surface | Claude 当前具备哪些动作能力 | built-in tools、MCP、plugins |
| Control surface | 哪些动作必须被约束、阻断或审计 | permissions、sandbox、hooks |
| Isolation surface | 哪些任务需要隔离上下文和权限 | subagents、worktrees、forked sessions |
| Verification surface | 如何判断任务完成且结果可信 | tests、lint、screenshots、logs、CI |

![五大设计维面表](images/image_4.jpg)

## 四、Context Surface：上下文的精细管理

### 各概念的运行时角色

| 概念 | 运行时角色 | 解决什么 | 典型误用 |
|------|----------|---------|---------|
| CLAUDE.md | 项目级持久契约 | 每次会话都必须成立的命令、边界、禁止项 | 写成团队知识库 |
| .claude/rules/* | 路径或语言相关规则 | 目录、文件类型或语言级局部规范 | 所有规则都堆到根 CLAUDE.md |
| Built-in Tools | 内置能力 | 读文件、改文件、跑命令、搜索 | 把所有集成都塞进 shell |
| MCP | 外部能力接入协议 | 让 Claude 访问 GitHub、Sentry、数据库 | 接太多 server，工具定义挤爆上下文 |
| Plugin | 打包分发层 | 把 Skills/Hooks/MCP 一起分发 | 把 plugin 当成运行时 primitive |
| Skill | 按需加载的知识/工作流 | 给 Claude 一个"方法包" | skill 既像百科全书又像部署脚本 |
| Hook | 强制执行规则的拦截层 | 在生命周期事件前后执行规则 | 用 hook 替代所有模型判断 |
| Subagent | 隔离上下文的工作单元 | 并行研究、限制工具与权限 | 无边界 fan-out，治理失控 |

![概念角色表](images/image_5.jpg)

### 上下文何时加载

理解上下文经济学至关重要。不同的功能在不同时机加载进上下文窗口：

- **Session start（始终在上下文中）**：CLAUDE.md（完整内容，每次请求）、MCP servers（工具定义，每次请求）、Skills*（仅描述，默认）
- **On use（使用时加载）**：Skills（完整内容，使用时加载）
- **Isolated（独立上下文）**：Subagents（全新、隔离的上下文）、Hooks（外部运行，零上下文成本）

*注：设置了 disableModelInvocation: true 的 Skills 在被调用前不加载任何内容。

![上下文加载时机图](images/image_6.jpg)

### 上下文经济学

以 200K token 上下文窗口为例：如果你接了 5 个 MCP Servers，光工具定义就要占 25,000 tokens（12.5%），这还没开始干活。剩下 87.5% 才是你的可用上下文。

![Context Economics Progress Bar](images/image_7.jpg)

用 `/context` 命令可以查看详细的上下文使用分布：System prompt、System tools、Custom agents、Memory files、Skills、Messages、Free space、Autocompact buffer。

![/context 命令截图](images/image_8.jpg)

## 五、Session 管理与上下文切换

### Session 连续性

Claude Code 支持 session 的延续和分叉：

- `claude --continue` / `claude --resume`：在同一个 session 上追加对话
- `claude --resume abc123 --fork-session`：从 session 的任意节点分叉出新的 session（新 ID）

![Session Continuity 示意图](images/image_9.jpg)

### 探索阶段与执行阶段

一个高效的工作流应该区分**探索阶段（PlanMode）**和**执行阶段**：

**探索阶段**特征：只读操作为主，澄清目标，提交方案。价值：将探索与执行在"副作用"层面隔离，降低错误方向的自治成本。

**执行阶段**特征：产生实际变更，消耗 Token，产生历史记录。

上下文管理工具：
- `/clear`：切断失败路径的上下文污染
- `/compact`：将冗长历史收缩为工作摘要
- `fork-session` / `worktree`：提供系统级与文件级的并行隔离

![探索与执行阶段](images/image_10.jpg)

### 案例：用 PlanMode 做设计

一个好的 prompt 应该明确告诉 Claude 只做分析和设计，不要写代码：

> 我需要你为以下任务制定实现计划，只做分析和设计，不要写任何代码。
>
> 任务：为一个 Rust 写的 CLI 工具添加插件系统，允许用户通过动态加载 .so 文件扩展功能。
>
> 现有架构：
> - src/core/ 包含核心逻辑，不能大改
> - 当前用 clap 解析命令，命令注册是静态的
> - 无任何 FFI 或动态加载代码
>
> 约束：
> - 不能引入 libloading 以外的大型依赖
> - 必须保持向后兼容，现有命令行为不能变
> - 插件必须有版本协议，防止 ABI 不兼容
>
> 请输出：
> 1. 关键设计决策及各方案的 trade-off
> 2. 文件/模块变更清单（哪些新增、哪些修改）
> 3. 实现顺序（分阶段，标出风险点）
> 4. 需要我确认的不确定点

![案例 Prompt](images/image_11.jpg)

## 六、Action Surface：工具设计的艺术

### 好工具 vs 坏工具

工具设计的质量直接影响 Claude 的决策质量：

| 维度 | 好工具 | 坏工具 |
|------|-------|-------|
| 名称 | jira_issue_get, sentry_errors_search | query, fetch, do_action |
| 参数 | issue_key, project_id, response_format | id, name, target |
| 返回 | 与下一步决策直接相关的信息 | 一堆 UUID、内部字段、原始噪声 |
| 规模 | 单一目标，边界清楚 | 多个动作混杂，副作用不透明 |
| 成本 | 默认输出受控、可截断 | 默认返回过大上下文 |
| 错误信息 | 包含修正建议 | 仅返回 opaque error code |

![好工具 vs 坏工具表](images/image_12.jpg)

### Skill 的交互式工作流

Skills 不仅仅是知识文档，它可以是交互式的工作流。例如，一个 Skill 可以分步引导用户做选择：

通过 AskUserQuestion 工具，Skill 可以在"完全自由"和"过于死板"之间找到最佳平衡点——structured + composable，提供清晰的 UI 交互界面。

![交互式 Skill 截图](images/image_13.jpg)

### 找到交互的 sweet spot

在无结构（modified markdown output）和过于死板（ExitPlanTool parameter）之间，AskUserQuestion tool 提供了结构化且可组合的方案，有清晰的 UI 界面。

![Finding the Sweet Spot](images/image_14.jpg)

## 七、Isolation Surface：从 Todos 到 Tasks

### 任务编排的演进

随着模型能力提升，任务编排从简单的 Todos（单 Agent 线性执行清单）演进为 Tasks（多 Agent 并行、有依赖关系的 DAG）：

- **Todos**：单个 Agent，线性清单（Set up project → Write tests → Implement feature → Deploy）
- **Tasks**：多个 Agent 并行工作，Task 之间有依赖关系，支持状态跟踪（completed ✓ / in progress ● / pending）

![From Todos to Tasks](images/image_15.jpg)

## 八、Control Surface：Hooks 的威力

### Hooks 的生命周期事件

Hooks 是强制执行规则的拦截层，支持 8 种生命周期事件：

1. PreToolUse — Before tool execution
2. PostToolUse — After tool execution
3. PostToolUseFailure — After tool execution fails
4. Notification — When notifications are sent
5. UserPromptSubmit — When the user submits a prompt

![Hooks 列表截图](images/image_16.jpg)

### Validation Shift-Left Flow

Hooks 的核心价值是"左移验证"（Shift-Left）：

- **无 Hook**：Edit → Edit → 编译 → 发现错误 → 长时间回溯
- **有 Hook**：Edit → Hook 自动校验（PreToolUse/PostToolUse）→ 0 延迟 → 立即阻断/修复

100 次编辑累积节省 1-2 小时。

![Validation Shift-Left Flow](images/image_17.jpg)

## 九、系统内部：Prompt Caching 与 Compaction

### System Prompt 的分层结构

Claude Code 的 System Prompt 是分层缓存的：

1. **Base System Instructions** — globally cached
2. **Tools (Read, Write, Bash, Grep, Glob, ...)** — globally cached
3. **CLAUDE.md & Memory** — cached per project
4. **Session State (env, MCP, output style)** — cached per session
5. **Messages (user messages, tool results, ...)** — grows each turn

![System Prompt Layout](images/image_18.jpg)

### Compaction 机制

当上下文窗口接近满时，Compaction 机制会自动触发：

1. **Before**：上下文窗口快满了，底部有 compaction buffer
2. **Forked Compaction Call**：将完整对话发送给模型（cache hit — 1/10 price），加上 "Summarize this conversation" 指令，生成摘要（~20k tokens max）
3. **After**：System + Tools 保持不变，加入 compact_boundary 标记，然后是 Conversation summary（替代所有旧消息）+ Re-attached files & context，底部留出空间给新对话

![How Compaction Works with Prompt Caching](images/image_19.jpg)

## 十、MCP 实战配置

通过 `/mcp` 命令管理 MCP servers。一个典型的项目配置可能包括：

- brave-search — 网络搜索
- fetch — 获取网页内容
- filesystem — 文件系统操作
- github — GitHub 操作
- memory — 持久记忆
- sequentialthinking — 顺序思维

![MCP 管理截图](images/image_20.jpg)

## 十一、避免过度工程化

一个经典的 meme 完美诠释了这个问题：

初学者和真正的高手都选择 **Keep It Simple**。只有中间层的人会堆砌 20 Skills、20 Slash Commands、1000 行 CLAUDE.md、100 Subagents、Multiple AI Services、Agentic Framework。

![Keep It Simple meme](images/image_21.jpg)

## 十二、常见反模式与修复

| 反模式 | 症状 | 修复 |
|--------|------|------|
| CLAUDE.md 当 wiki | 每次加载污染上下文，关键指令被稀释 | 只保留契约，资料拆到 Skills 和 rules |
| Skill 大杂烩 | 描述无法稳定触发，工作流冲突 | 一个 Skill 只做一类事，副作用显式控制 |
| 工具太多描述模糊 | 选错工具，schema 挤爆上下文 | 合并重叠工具，做明确 namespacing |
| 没有验证闭环 | Claude 只能"觉得自己完成了" | 给每类任务绑定 verifier |
| 过度自治 | 多 agent 并行无边界，出错难止损 | 角色/权限/worktree 最小化，明确 maxTurns |
| 上下文不做切分 | 研究、实现、审查全堆在主线程，有效上下文被稀释 | 任务切换 /clear，阶段切换 /compact，重型探索交给 subagent（Explore → Main 模式） |
| 自治范围过宽但治理不足 | 多 agent、外部工具全开，但缺乏权限边界和结果回收边界 | permissions + sandbox + hooks + subagent 组合边界 |
| 已批准命令堆积不清理 | settings.json 里残留 rm -rf 等危险操作，一旦触发不可逆 | 定期审查 .claude/settings.json 的 allowedTools 列表 |

![反模式表](images/image_22.jpg)

## 十三、从工具使用者到系统设计者

使用 Claude Code 的三个阶段：

| 阶段 | 关注点 | 效率感知 |
|------|--------|---------|
| 工具使用者 | "这个功能怎么用" | 有帮助但有限 |
| 流程优化者 | "如何让协作更顺"，开始写 CLAUDE.md 和 Skills | 明显提升 |
| 系统设计者 | "如何让 Agent 在约束下自主运作" | 质变 |

![三阶段表](images/image_23.jpg)

真正的质变不是学会更多命令，而是开始用系统思维来设计人与 AI 的协作界面。当你从"这个功能怎么用"转变为"如何让 Agent 在约束下自主运作"，你就从工具使用者进阶为系统设计者了。

---

*本文由 Tw93 (@HiTw93) 发布于 X (Twitter)，2026年3月12日。*
