# Insight Memo: Steering Claude Code（七种调教机制 + 何时用哪个）

## title_zh
调教 Claude Code 的 7 种武器，你用错了几个？

## one_sentence_thesis
Claude Code 给你的不是"一个能写代码的 Agent"，而是 7 个不同位置、不同生命周期、不同强制力的"指令注入口"——选错位置等于在主上下文里烧钱并稀释真正重要的指令。

## why_this_video_exists
绝大多数人把所有"我想让 Claude 怎么做"的话都塞进 CLAUDE.md，结果出现两个反直觉后果：(1) 每多一行，团队里每个 session 都在为这行付 token，且会稀释关键指令的遵循率；(2) "永远不要做 X"这种话在 CLAUDE.md 里其实是**不可靠的护栏**——长 session、压力情境、prompt injection 都会击穿它。Anthropic 这篇官博第一次系统给出了"七种机制 × 加载时机 × compaction 行为 × token 成本 × 强制力"的对照表，并明确说出"指令"和"护栏"是两回事——后者必须用 hooks + managed settings 才能做到 deterministic。这是大多数 Claude Code 用户从 README / 入门教程里拿不到的认知。

## judgment_lines

- "CLAUDE.md 不是放规则的地方，是放索引的地方" — 来源：官方建议 keep under 200 lines、give it an owner、像 code 一样 review changes；并明确程序性内容（30 行 procedure）应迁到 skills，路径相关约束应迁到 path-scoped rules
- "'Never do X' 写在 CLAUDE.md 里不是护栏，是 wishful thinking" — 来源：原文 "Claude will follow the instruction most of the time, but when under pressure, in a long session or an ambiguous situation, or due to a prompt injection in a file accessed as part of the task, the model can fail to follow a prompted rule. A real guardrail needs to be deterministic"
- "subagent 不是为了'让 Claude 帮 Claude 干活'，是为了把中间结果挡在主上下文之外" — 来源：subagent 跑在独立 fresh context window，只有 final message + metadata 回到主会话；可嵌套 5 层，dynamic workflows 编排几十到几百个后台 agent 而不需要你指定每个细节
- "你给一条指令付的 token 价，不取决于它是什么，而取决于它住在哪" — 来源：同一条"deploy checklist"写在 CLAUDE.md 是 high context cost（每个 session 都加载），写成 skill 是 low cost（仅 name + description 常驻，body 调用时才加载）
- "output styles 之所以最强，是因为它直接覆盖 system prompt——但代价是默认的'你是软件工程师'人设也一起没了" — 来源：原文明确 "a custom output style drops all of this and Claude Code becomes more of a general assistant than a software engineer assistant"（除非 keep-coding-instructions: true）

## evidence_map

- [具体数字] CLAUDE.md 建议上限：**under 200 lines**
- [具体数字] subagent 嵌套深度：**up to five levels deep**；dynamic workflows 可编排 **tens to hundreds of background agents**
- [具体事实] 七种机制全名单：CLAUDE.md files、rules、skills、subagents、hooks、output styles、appending the system prompt
- [具体事实] CLAUDE.md 有两种类型：root（session start 全程常驻，compaction 后重读）vs subdirectory（按需，只在 Claude 读该目录文件时加载）
- [具体事实] rules 在 `.claude/rules/`，path-scoped rule 用 frontmatter 的 `paths:` 字段（示例：`paths: ["src/api/**", "**/*.handler.ts"]`，规则体 "All API handlers must validate input with Zod before processing"）
- [具体事实] skills 在 `.claude/skills/`，结构 = `SKILL.md` + name + description + body；session start **只加载 name + description**，body 在 invoke 时才加载
- [具体事实] subagents 在 `.claude/agents/`，YAML frontmatter（name、description、可选 model 和 tool access）+ body 即 subagent 的 system prompt；通过 Agent tool 调用
- [具体事实] hooks 五种类型：command、HTTP、mcp_tool、prompt、agent；前三类纯 deterministic，后两类用 Claude 判断
- [具体 bug 场景] hook 输出**默认不回主上下文**：用 PreCompact 把聊天历史备份到另一个文件后，Claude 不知道存到了哪个文件；除非 hook 显式 return，否则主上下文看不到
- [具体 bug 场景] blocking hook 的 stderr 会回主上下文，让 Claude 知道为什么被拒；这是少数会回的情况
- [具体事实] hook 注册位置：`settings.json`、managed policy settings、或 skill/agent frontmatter
- [具体事实] `PreToolUse` hook 可 inspect tool call 并 **exit code 2** 阻止执行——这是 deterministic 护栏的实现方式
- [具体事实] **managed settings** 是 admin 部署、用户本地 config 无法覆盖的——唯一能做到 organization-wide deterministic 护栏的机制
- [具体事实] 压缩（compaction）行为差异：CLAUDE.md root = 重读；rules = re-injected；skills = re-inject 到一个共享 budget，oldest 先 drop；subagents = 只有 final message 回主会话；hooks = 完全绕过 compaction；output styles = 永不被 compact；append-system-prompt = 永不被 compact，但只对当次 invocation 生效
- [具体事实] monorepo 推荐：每个团队目录给自己一个 subdirectory CLAUDE.md；开发者用 `claudeMdExcludes` 设置跳过不相关团队的文件
- [具体事实] output styles 内置三种：**Proactive**、**Explanatory**、**Learning**（分别覆盖 autonomy、teaching、collaborative 三种最常见场景）——官方建议先用内置再考虑自定义
- [具体事实] output styles 的 frontmatter 选项 `keep-coding-instructions: true` 可保留默认的软件工程师人设
- [对比数据] CLAUDE.md（root）context cost = **High**；subdir CLAUDE.md = **Low**；rules（unscoped）= **Medium**；skills = **Low**；subagents = **Low**（主上下文零成本直到 call）；hooks = **Low**；output styles = **High**；append-system-prompt = **Moderate**
- [一手引用] "An unscoped rule is mechanically identical to putting the content in CLAUDE.md: always loaded, always costing tokens."
- [一手引用] "The model choosing to run a formatter is different from the formatter running automatically."（解释为什么 hooks 才是 deterministic 而 CLAUDE.md 指令不是）
- [一手引用] "Appending the system prompt has diminishing returns for adherence. Generally, the more instructions you provide using this method, the less strictly Claude will follow them, particularly if any contradict."

## non_obvious_points

- 同一条指令的强制力**完全取决于注入口而不是措辞** — 为什么这不显而易见：人的直觉是"我说得严厉一点 Claude 就会更听话"，所以会写"NEVER, NEVER do X"；但原文揭示指令强度由位置决定（output styles > append-system-prompt > rules > CLAUDE.md > skill body），用更大的字号写在 CLAUDE.md 里完全没用——真要强制就改用 hook + exit code 2
- subagent 之所以省 token 不是因为它"更小"，而是因为**它的中间过程根本没进主上下文** — 为什么这不显而易见：表面看 subagent 也要跑 LLM，怎么会省钱？关键在于它在 fresh window 里跑，几十上百次 tool call 的中间结果全留在 subagent 自己的 window 里，回主会话的只有 final message——这让"几十到几百个后台 agent 编排"成为可能，否则单条主会话早就爆窗了
- "在 CLAUDE.md 里写超过 30 行的 procedure"是一个具体的反模式信号 — 为什么这不显而易见：CLAUDE.md 表面看是"项目说明书"，写多少看起来都合理；但官方把"30 行 procedure"作为"该迁去 skills 了"的明确触发线——因为 procedure 是"按需调用"的知识，常驻主上下文是纯浪费

## tradeoffs_and_limits

- output styles 覆盖 system prompt 的代价：默认那套"你在帮人做软件工程"的角色定义连同 scope changes / 何时加注释 / 安全顾虑 / 跑测试再宣告完成 这些关键默认行为**会一起被丢掉** — 具体表现：除非 frontmatter 写 `keep-coding-instructions: true`，自定义 output style 会把 Claude Code 退化成"通用助手"，写代码的纪律性下降
- append-system-prompt 的边际递减：指令越多，遵循率越低，互相矛盾时尤其明显 — 具体表现：原文明确 "diminishing returns for adherence"——堆指令不是越多越好，到某个阈值就开始反噬
- skills 的 body 在 compaction 时共享一个 budget、oldest 先 drop — 具体表现：一个长 session 里 invoke 了很多 skill 后，最早调用的那个 skill 内容会先被挤掉，意味着"在长 session 末段重新依赖早期 skill"是不可靠的
- CLAUDE.md 在共享 repo 里的"无主增长"陷阱 — 具体表现：原文明确 "CLAUDE.md grows the way any unowned config file does: every team appends its own instructions and nothing gets deleted. The cost compounds at scale."——每多一行都让每个工程师每个 session 多付 token 并稀释关键指令

## what_to_leave_out

**不该进入的素材：**
- monorepo 的 `claudeMdExcludes` 设置细节 — 原因：太工具细节，普通观众不在 monorepo 场景
- Zod 校验规则的具体 frontmatter 写法 — 原因：原文是举例，不是 thesis 的支柱，展开会变成教程
- 内置 output styles 的三个名字（Proactive/Explanatory/Learning）的具体差异 — 原因：观众听不到具体区别就记不住，列名字只是噪音
- plugin 打包分发那段（结尾的 getting started） — 原因：与"七种机制怎么选"无关，是延伸阅读

**应避免的叙事方向：**
- 不要写成"七种机制完整教程" — 这是 Anthropic 官方文档的活，视频做不过文档，且会让 thesis 散掉
- 不要把整集框架建立在"七"这个数字上做"7 大武器一一拆解" — 容易变成流水账，且观众记不住七个；用"指令 vs 护栏"或"住在哪决定花多少 token"这种判断作为主轴更有穿透力
- 不要把 CLAUDE.md 写成反派 — 原文并不是说 CLAUDE.md 不好，而是说"用错位置"不好；保持中性，重点是"把对的东西放对的位置"
- 不要花时间解释 compaction 是什么 — 受众默认懂 Claude Code，展开 compaction 概念会打断节奏；如需 hook，用一句"长对话压缩"带过
- 不要堆代码块 — 原文有 frontmatter 示例代码，视频里不要照搬，口播听不出 YAML 缩进

## signature_line
你以为你在调教 Claude，其实你在选指令住哪——同一句话，住进 CLAUDE.md 是 token 黑洞，住进 hook 是不可破的护栏。

## hot_keywords

- **Claude Code** — 全文核心产品，七种机制都是它的官方调教接口
- **Skills** — 原文一级标题之一，明确给出"procedure 应该住这里"的判断
- **Subagent** — 原文一级标题之一，强调 isolation + 主上下文零成本，并引用了 dynamic workflows 这篇博客（hundreds of background agents）
- **Context Engineering** — 未在原文明文出现，但整篇博客实质上就是 context engineering 的具体落地（什么时候加载、加载多少、是否被 compact）——可作为 Hook 锚点用，但要明确说"这就是 context engineering"
- **Agent Harness** — 原文用 "harness" 一词描述 "the harness runs the handler"（hooks 段），是周边提及，不是核心
- **Codex / MCP / Computer Use / /goal 模式** — 原文无明显出现，不强塞
