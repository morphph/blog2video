# Insight Memo: Best Practices for Claude Computer & Browser Use

## title_zh
Claude 点击不准？多半是你截图开太大了

## one_sentence_thesis
Computer Use 智能体在生产环境的可靠性，主要不是被模型推理能力卡住的，而是被一连串"以为没问题"的工程细节拖垮——分辨率、缓存、上下文管理、思考预算——每一项的直觉解法都恰好是错的。

## why_this_video_exists
大多数 Computer Use 教程只讲"怎么调用 API"。这条视频提供的是一份反直觉清单：当你的 Agent 点不准、跑不久、贵到离谱，问题往往出在没人告诉你的隐式默认值上——比如 macOS 截图自带 2 倍 DPI、思考模式开 max 不如 high、上下文窗口 100 张截图就满。

## judgment_lines

- 点击不准的首要嫌疑人不是模型推理，而是图像被静默降采样导致坐标系错位 — 来源：原文明确指出"Images exceeding these limits get silently downscaled, causing coordinate misalignment between the model's perceived image and your harness's expected resolution"，且把"原生分辨率不缩放"列为点击不准的最常见原因。

- 在 UI 自动化任务上，思考预算开到顶反而是浪费钱，因为这类任务是感知+机械操作，不是逻辑推理 — 来源：原文 Opus 4.7 高 effort 用 max 一半的 token 拿到接近最高成功率；4.6 medium 跟 high 加重试后成功率收敛；原文直言"UI automation tasks are fundamentally different from coding or math problems. Most computer use actions are perceptual and mechanical"。

- Sonnet 比 Opus 更适合做"点击工"，Opus 的价值在于推理而非机械精度 — 来源：原文写"Claude Sonnet 4.6 tends to be more mechanically precise at clicking"，且推荐"Start with Sonnet 4.6 for best balance of accuracy, reasoning, and cost"；Opus 4.7 才把这个差距追平。

- Computer Use 的上下文管理不是"省钱优化"，而是"能不能跑超过 100 步"的生死问题 — 来源：原文 "each action generates a new image consuming 1,000–1,800 tokens. A 200k context window can fill in under 100 screenshots."

- 提示注入对 Computer Use 是结构性风险而非偶发 bug，因为模型按设计就要读取不可信内容 — 来源：原文 "Computer use agents interact with untrusted content by design. Every screenshot, webpage, or application UI could contain adversarial instructions"。

- 与其反复改 prompt，不如录一遍操作让模型照着做——这是当前最被低估的可靠性手段 — 来源：原文 "Instead of iterating on text prompts, show Claude correct behavior by recording demonstrations"，且明确 playback 不是死板回放，模型会在 UI 变化时找等价元素。

## evidence_map

- [具体数字] 4.6 家族图像限制：长边 1568 像素、总像素 1.15 兆；Opus 4.7：长边 2576 像素、总像素 3.75 兆。
- [具体数字] 推荐起步分辨率：4.6 用 1280×720（约占 80% 像素预算）；Opus 4.7 起步用 1080p。
- [具体数字] 一张截图消耗 1000–1800 tokens；200k 上下文窗口在 100 张截图以内就会撑满。
- [具体数字] 滚动缓冲推荐默认值：`keep_n = 3`，`interval = 25`；服务端 compaction 触发阈值约 150k input tokens；客户端 compaction 触发阈值约 90% 上下文窗口。
- [具体数字] API 总共支持 4 个 cache breakpoint：1 个放系统提示/工具定义（稳定前缀），3 个放最近的 tool result（每轮推进）。
- [具体事实] macOS 截图通常 device pixel ratio = 2，得到屏幕分辨率两倍的图像——这是被忽视的常见坑。
- [具体事实] 4.6 家族要避开 1920×1080 及以上分辨率；Opus 4.7 才支持更高。
- [具体事实] 内置 prompt injection 分类器在官方 Computer Use 工具上自动运行，"approximately zero additional latency and no additional cost"；自定义工具实现没有，需要申请。
- [具体事实] 坐标缩放公式：`screen_x = int(api_returned_x * (screen_w / display_w))`。
- [具体事实] Messages array 中文本指令必须放在图像之前。
- [bug 场景] 某些下拉菜单调用系统 UI，浏览器视口截不到——这类失败不是精度问题，必须改用 JS 执行/键盘导航/DOM 操作。
- [对比数据] Opus 4.7 high effort ≈ max effort 的成功率，但只用一半 token；4.6 medium 加重试 ≈ 4.6 high。
- [一手引用] "Claude Sonnet 4.6 tends to be more mechanically precise at clicking" while Opus 4.6 brings stronger reasoning.
- [一手引用] "UI automation tasks are fundamentally different from coding or math problems. Most computer use actions are perceptual and mechanical."
- [具体事实] 内部测试发现没有提升效果的三类做法：把图像切成小块、叠加坐标网格、特定的 resize 算法选择。

## non_obvious_points

- "调高分辨率得到更好截图"是一个会反噬的直觉 — 为什么这不显而易见：在所有其他场景里更高分辨率都意味着更多信息更好结果，但 Computer Use 里超出模型限制会被静默降采样，导致 harness 期望的坐标系和模型看到的坐标系错位，反而让点击全部偏移。质量越高，错得越离谱。

- 思考预算和点击准确率不是单调正相关，开 max 可能等于白烧钱 — 为什么这不显而易见：在 coding/math 任务上"更多思考=更好结果"几乎是定律，所以工程师默认 Computer Use 也一样。但识别按钮、定位坐标本质上是感知任务，更多内省并不能让模型"看得更准"，原文直接把 max effort 标为"不要用"。

- Computer Use 的可靠性瓶颈是"工作流演示"而不是"prompt 调优" — 为什么这不显而易见：业界默认把可靠性问题归结为提示工程，于是写更长的 system prompt。但 Anthropic 的方案是反向的——录一次给模型看，让模型在真实 UI 上做"自适应回放"，这把可靠性从"描述清楚"转移到"演示清楚"，是范式的转变而非技巧。

## tradeoffs_and_limits

- 缓存断点策略只在消息字节级一致时才生效 — 具体表现：滚动缓冲必须批量裁剪（一次砍掉 `interval` 张），不能每步都删旧图，否则消息数组每轮都变，cache 全部失效，省 token 变成多花钱。

- Batch tools 在依赖中间视觉状态的场景会放大错误 — 具体表现：原文明确"Risks include compounding error if actions depend on intermediate visual states"，所以探索性导航和错误恢复序列禁用 batch；只能用于互不依赖的自包含动作。

- 内置 prompt injection 分类器只覆盖官方 Computer Use 工具调用 — 具体表现：自定义工具实现不在保护范围内，必须自己实现人工审核高风险动作、限制权限边界、记录全部操作日志，否则把不可信网页内容直接喂进模型是裸奔。

- 演示回放不是万能 — 具体表现：strict 模式要求 UI 没大变，否则停下；UI 频繁变动的场景必须用 goal-oriented 模式，把录制步骤当"提示"而非剧本。

## what_to_leave_out

**不该进入的素材：**
- 各种工具的具体 JSON 配置代码（如 `computer_20251124` 的字段）——属于文档细节，视频讲原理更有价值。
- Trajectory viewer / Tool debug panel / Localization playground 三个调试工具的具体功能描述——一句"出问题先看回放再看坐标"足够。
- Advisor tool 的 `max_uses` 等参数细节——介绍概念即可，不展开。
- Server-side vs client-side compaction 的实现差异——讲清楚"上下文必须压"这件事更重要。
- 演示录制时具体存哪些字段（selectors + coordinates）——这是工程实现细节。

**应避免的叙事方向：**
- 不要写成"Computer Use 入门指南"——观众已经知道 Computer Use 是什么，要的是反直觉的经验。
- 不要平铺直叙地按原文章节顺序讲（分辨率→思考→安全→上下文→演示）——容易变成读说明书。
- 不要把所有"踩坑点"都塞进去——挑 2-3 个最反直觉的展开，其余一笔带过。
- 不要泛泛吹捧 Anthropic 的工程严谨性——观众要的是能用的判断，不是夸厂商。
- 不要把"演示回放"讲成全能银弹——必须配合它的局限（strict 模式会停下）一起讲。

## signature_line
Computer Use 的反常识在于：你以为是模型不够聪明，其实是你截图开太大、思考开太满、上下文不会清——三件事都是"做得越多越糟"。
