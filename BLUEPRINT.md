# Blog-to-Video Pipeline: Reverse Engineering & Implementation Blueprint

## Part 1: Reverse Engineering Analysis — 慢学AI 的内容转化方法论

### 1.1 博客 → 视频的拆分逻辑

原博客约 2500 词（英文），被拆成 3 个视频：

| 视频 | 时长 | 覆盖博客章节 | 核心问题 |
|------|------|-------------|---------|
| Video 1 | 8:29 | Single agent case + 3 scenarios + Signals | **何时用** 多 Agent？ |
| Video 2 | 7:26 | Context-centric decomposition | **如何拆分** Agent 边界？ |
| Video 3 | 4:04 | Verification subagent + Conclusion | **从哪里开始**？最安全的第一步 |

**拆分原则观察：**
- 每个视频回答一个独立的核心问题（When / How / Where to start）
- 每个视频 4-8 分钟，适合小红书/视频号的消费习惯
- 视频之间有递进关系但各自独立成篇
- 代码示例全部省略，替换为比喻和场景描述

### 1.2 口播稿的转化模式（Script Transformation Patterns）

**原博客是工程文档风格，口播稿完成了以下转化：**

#### Pattern 1: 开头 Hook — 把标题变成问题
- 博客标题：`Building multi-agent systems: when and how to use them`
- 口播 Hook：`现在多 Agent 架构很火，那么什么时候该使用它？`

#### Pattern 2: 概念翻译 — 用生活比喻替代技术描述
| 原文概念 | 口播比喻 |
|----------|---------|
| Single agent with tools | 一个人就是主厨，切菜、炒菜、摆盘样样精通 |
| Multi-agent coordination overhead | 你需要花大量时间去协调：那个洋葱切丁不是切丝！ |
| Context pollution | 上下文污染 → 本来要解决"无法登录"，结果开始分析"为什么上个月快递慢了" |
| Telephone game (context handoff) | 传话游戏 |
| Verification vs Testing | 老师判卷子 vs 学生写作文（白盒 vs 黑盒）|
| Early victory problem | 偷懒倾向 → 跑了一两个测试就宣布"大功告成" |

#### Pattern 3: 结构模板 — 每个视频的骨架
```
1. Hook 问题（15-30秒）
2. 反直觉论点 / 教训（30秒）
3. 比喻引入核心概念（1-2分钟）
4. 分点拆解 + 条件/前提（3-5分钟）
5. 信号/检查清单（1分钟）
6. 总结金句（15-30秒）
```

#### Pattern 4: 语气风格
- 第二人称："你是经营一家小餐馆"
- 设问句引导："为什么这么说？想象一下..."
- 强调语气词："这句话非常关键"、"这就是精髓所在"
- 每段结尾有小结/金句

### 1.3 PPT 幻灯片设计解析（从截图逆向）

#### 视觉风格
- **背景**：深色（接近纯黑 `#0D0D0D` ~ `#1A1A2E`）
- **主色调**：紫色标题 + 红色警告/强调 + 绿色正面信号 + 黄色字幕
- **卡片式布局**：圆角矩形容器，半透明深色背景
- **最小化文字**：每张幻灯片核心信息不超过 50 字
- **双语保留**：中文主体，英文术语原词保留（如 Deep Research, Token, Agent）

#### 幻灯片类型分类
| 类型 | 用途 | 示例 |
|------|------|------|
| **封面 Slide** | 视频开头，大标题 + 副标题 + 3个要点概览 | "为什么你不需要复杂的 Agent 架构？" |
| **原则 Slide** | 展示核心论点，左右分栏 | 左：主厨理论 / 右：隐形成本（Token、延迟、通信） |
| **对比 Slide** | 三列卡片并排对比 | 上下文保护 / 并行化 / 专业化分工 |
| **流程 Slide** | 展示决策路径或检查清单 | 信号检测 → 解决方案 |
| **总结 Slide** | 视频结尾，一句话总结 | 检查清单三问 |

#### 每个视频的 Slide 数量
- 估算每个视频 3-5 张核心 Slide（不含过渡）
- 每张 Slide 在屏幕上停留 60-120 秒

---

## Part 2: 自动化 Pipeline 架构设计

### 2.1 整体流程

```
Blog URL/Content
       ↓
┌─────────────────────┐
│  Stage 1: 内容分析   │  → 判断视频数量、提取核心论点
│  (Content Analyzer)  │
└─────────────────────┘
       ↓
┌─────────────────────┐
│  Stage 2: 脚本生成   │  → 每个视频的完整口播稿
│  (Script Writer)     │
└─────────────────────┘
       ↓
┌─────────────────────┐
│  Stage 3: 幻灯片生成 │  → 每个视频的 PPT 文件
│  (Slide Designer)    │
└─────────────────────┘
       ↓
┌─────────────────────┐
│  Stage 4: 视频合成   │  → TTS + PPT → MP4 视频
│  (Video Assembler)   │
└─────────────────────┘
```

### 2.2 Stage 1: Content Analyzer（内容分析 Agent）

**输入**：博客原文（URL 或 Markdown）
**输出**：结构化 JSON

```json
{
  "blog_metadata": {
    "title": "Building multi-agent systems",
    "word_count": 2500,
    "complexity": "high",       // low | medium | high
    "depth_score": 8,           // 1-10
    "topic_category": "engineering"
  },
  "video_plan": {
    "total_videos": 3,
    "rationale": "博客包含3个独立可讲的核心主题...",
    "videos": [
      {
        "video_number": 1,
        "title_zh": "为什么你不需要复杂的 Agent 架构？",
        "title_en": "Why you don't need complex Agent architecture",
        "hook_question": "现在多 Agent 架构很火，那么什么时候该使用它？",
        "core_sections": ["single_agent_case", "three_scenarios", "signals"],
        "estimated_duration_minutes": 7,
        "key_concepts": [
          {"concept": "context_pollution", "analogy_hint": "主厨 vs 助手"},
          {"concept": "token_cost", "analogy_hint": "员工手册复印费"}
        ]
      }
      // ...more videos
    ]
  }
}
```

**视频数量决策逻辑**：

```
if word_count < 1000 and depth_score <= 4:
    videos = 1
elif word_count < 2000 and depth_score <= 6:
    videos = 1-2  # 取决于是否有可独立成篇的子主题
elif word_count >= 2000 or depth_score >= 7:
    videos = 2-3  # 每个核心主题一个视频
else:
    videos = 1

# 额外规则
max_videos = min(3, number_of_independent_subtopics)
# 每个视频目标时长：4-8 分钟（约 800-1500 字口播稿）
```

**Prompt 核心指令**：
```
你是一个内容策划专家，专门将英文技术博客转化为中文短视频系列。

分析规则：
1. 识别博客中可以独立成篇的核心主题（每个主题能回答一个独立问题）
2. 每个视频的信息量控制在 4-8 分钟口播时长
3. 如果博客只有一个核心论点，只做一个视频
4. 如果博客有清晰的递进结构（When → How → What），拆成多个视频
5. 代码示例不进入视频，替换为概念性描述
6. 为每个概念预设一个生活化比喻方向
```

### 2.3 Stage 2: Script Writer（口播稿生成 Agent）

**输入**：Content Analyzer 的 JSON + 博客原文
**输出**：每个视频的口播稿（带 Slide 时间标记）

**口播稿格式**：
```markdown
# Video 1: 为什么你不需要复杂的 Agent 架构？

## [SLIDE 1: 封面] (0:00 - 0:30)
现在多 Agent 架构很火，那么什么时候该使用它？
今天我们来精读 Claude 官方发布的工程博客...

## [SLIDE 2: 原则] (0:30 - 2:00)
Claude 官方分享了一个真实的教训...
想象一下，你是经营一家小餐馆...

## [SLIDE 3: 三场景] (2:00 - 5:30)
第一，上下文保护...
第二，并行化...
第三，专业化分工...

## [SLIDE 4: 信号检查] (5:30 - 7:00)
你可以检查一下你的系统是否出现了以下三个信号...

## [SLIDE 5: 总结] (7:00 - 7:30)
最后总结一下。构建 Agent 系统，不要一上来就做多 Agent...
```

**Script Writer Prompt 核心要素**：
```
风格要求：
1. 用第二人称（"你"），营造对话感
2. 每个概念先用比喻引入，再给定义
3. 设问句引导："为什么这么说？想象一下..."
4. 技术术语保留英文：Agent, Token, Context Window, Deep Research
5. 每 2 分钟插入一个记忆锚点（金句或反直觉观点）
6. 口播稿总字数 = 目标时长(分钟) × 200 字/分钟
7. 每段用 [SLIDE N: 类型] 标记对应的幻灯片切换点

禁止：
- 不要逐句翻译原文
- 不要保留代码示例
- 不要使用书面化的长句
- 不要在一个段落中塞入超过 3 个新概念
```

### 2.4 Stage 3: Slide Designer（幻灯片生成 Agent）

**输入**：口播稿（含 Slide 标记）
**输出**：每个视频的 PPTX 文件

**设计规范（模仿慢学AI风格）**：

```javascript
// 全局设计参数
const DESIGN_SPEC = {
  // 尺寸：16:9 竖屏（适配手机观看）
  width: 9,    // 英寸 — 注意是竖屏！
  height: 16,

  // 配色方案
  colors: {
    background: '#0D0D1A',      // 深色背景
    card_bg: '#1A1A2E',         // 卡片背景
    card_border: '#2A2A4A',     // 卡片边框
    title: '#FFFFFF',           // 标题白色
    subtitle: '#B0B0CC',        // 副标题灰紫
    accent_purple: '#8B5CF6',   // 紫色强调
    accent_red: '#EF4444',      // 红色警告
    accent_green: '#10B981',    // 绿色正面
    accent_yellow: '#F59E0B',   // 黄色高亮
    accent_blue: '#3B82F6',     // 蓝色信息
  },

  // 字体
  fonts: {
    title: { face: 'Arial Black', size: 28 },
    subtitle: { face: 'Arial', size: 18 },
    body: { face: 'Arial', size: 14 },
    label: { face: 'Arial', size: 11 },
    english_term: { face: 'Consolas', size: 12 },
  }
}
```

**Slide 类型模板**：

| Slide 类型 | 布局描述 | 使用场景 |
|-----------|---------|---------|
| `cover` | 大标题居中 + 3个要点卡片底部横排 | 视频开头 |
| `principle` | 左列：核心论点卡片 / 右列：3个支撑点 | 解释核心原则 |
| `comparison_cards` | 2-3 列等宽卡片，各有标题+要点 | 场景对比、方案对比 |
| `checklist` | 带 ✅ / ❌ 图标的条目列表 | 信号检查、条件判断 |
| `quote_highlight` | 大号引用文字 + 出处标注 | 金句强调 |
| `summary` | 3 个编号问题/要点 | 视频结尾 |

### 2.5 Stage 4: Video Assembler（视频合成）

这是最终将口播稿 + PPT 合成为视频的环节。有几种可选方案：

#### 方案 A: Remotion（推荐用于 MVP）

Remotion 是 React-based 的视频生成框架，可以将 React 组件渲染为视频。

**优势**：
- 幻灯片可以直接用 React 组件实现（无需先生成 PPTX）
- 支持动画过渡效果
- 可编程控制时间轴
- 可集成 TTS API

**流程**：
```
口播稿 → TTS API → 音频文件(.mp3)
口播稿中的 [SLIDE] 标记 → 时间戳
设计规范 → React Slide 组件
音频 + 时间戳 + Slides → Remotion 渲染 → MP4
```

**关键组件**：
```typescript
// 伪代码示意
const BlogVideo: React.FC<{slides: Slide[], audio: string}> = ({slides, audio}) => {
  return (
    <Composition
      id="BlogVideo"
      width={1080}   // 竖屏 9:16
      height={1920}
      fps={30}
    >
      <Audio src={audio} />
      {slides.map((slide, i) => (
        <Sequence from={slide.startFrame} durationInFrames={slide.duration}>
          <SlideComponent type={slide.type} data={slide.data} />
        </Sequence>
      ))}
    </Composition>
  );
};
```

#### 方案 B: FFmpeg + 静态图片

如果不想引入 Remotion，可以用更简单的方式：

```bash
# 1. PPT → 图片（每张 slide 导出为 PNG）
# 2. TTS → 音频
# 3. 根据时间戳拼接
ffmpeg -loop 1 -t 30 -i slide1.png \
       -loop 1 -t 120 -i slide2.png \
       -loop 1 -t 180 -i slide3.png \
       ... \
       -i audio.mp3 \
       -filter_complex "concat=n=5:v=1:a=0" \
       -c:v libx264 -pix_fmt yuv420p \
       output.mp4
```

**优势**：简单、无需前端框架
**劣势**：没有动画效果，观感较静态

#### 方案 C: PPTX + TTS + 视频合成服务

使用第三方服务如 Synthesia、HeyGen、D-ID 等，上传 PPT + 配音生成视频。
或者用国内的服务如剪映专业版的批量剪辑功能。

### 2.6 TTS（文字转语音）选型

| 服务 | 中文质量 | 成本 | 适合场景 |
|------|---------|------|---------|
| **Azure TTS** | ⭐⭐⭐⭐⭐ | ~$16/100万字符 | 生产级，支持 SSML |
| **OpenAI TTS** | ⭐⭐⭐⭐ | $15/100万字符 | 简单集成，声音自然 |
| **Fish Audio** | ⭐⭐⭐⭐⭐ | 按量计费 | 中文极佳，支持克隆 |
| **EdgeTTS (免费)** | ⭐⭐⭐⭐ | 免费 | MVP 首选 |
| **剪映 TTS** | ⭐⭐⭐⭐⭐ | 免费(App内) | 手动流程可用 |

---

## Part 3: 实现路径建议

### 3.1 推荐技术栈

```
Content Analyzer:  Claude API (Sonnet) + Structured Output
Script Writer:     Claude API (Sonnet) + Few-shot examples
Slide Designer:    Claude API + pptxgenjs (或 Remotion React 组件)
TTS:              Edge TTS (免费MVP) → Fish Audio/Azure (生产)
Video Assembly:    Remotion (最佳) 或 FFmpeg (简单)
Orchestration:     Claude Code Agent / Node.js 脚本
```

### 3.2 分阶段实现计划

#### Phase 1: 手动验证 Pipeline（1-2 天）
- 用 Claude 对话手动执行每个 Stage
- 验证口播稿质量和 Slide 设计是否达标
- 建立 few-shot 示例库（用慢学AI的视频作为参考样本）

#### Phase 2: 自动化脚本生成（2-3 天）
- 实现 Content Analyzer + Script Writer 为一个 Claude Code 命令
- 输入博客 URL → 输出口播稿 Markdown 文件
- 这一步已经能大幅提升效率

#### Phase 3: 自动化 Slide 生成（3-5 天）
- 基于口播稿的 [SLIDE] 标记自动生成 PPTX 或 React 组件
- 建立 Slide 类型模板库
- 实现竖屏 9:16 的暗色风格

#### Phase 4: 视频合成自动化（5-7 天）
- 集成 TTS API
- 实现 Remotion 渲染或 FFmpeg 合成
- 端到端测试：URL → MP4

#### Phase 5: 集成到 Hot2Content（可选）
- 作为 Hot2Content 的新 subagent 类型
- 支持批量处理多篇博客
- 支持发布到小红书/视频号

### 3.3 Claude Code 命令设计

可以将整个 pipeline 封装为一组 Claude Code 自定义命令：

```bash
# 分析博客，输出视频计划
/blog-analyze https://claude.com/blog/xxx

# 生成口播稿
/blog-script --plan ./output/video_plan.json

# 生成幻灯片
/blog-slides --script ./output/video1_script.md

# 合成视频（需要额外环境配置）
/blog-render --script ./output/video1_script.md --slides ./output/video1.pptx
```

---

## Part 4: Prompt Templates（核心 Prompt 模板）

### 4.1 Content Analyzer Prompt

```xml
<system>
你是一个专业的内容策划师，专注于将英文技术博客转化为中文短视频内容。
你的目标受众是：对 AI/技术感兴趣的中文互联网用户（小红书、视频号）。

你需要分析博客并输出结构化的视频计划。

<rules>
1. 视频数量判断标准：
   - 博客中有几个可以独立回答的核心问题？
   - 每个视频对应一个核心问题
   - 单个视频目标时长 4-8 分钟
   - 最多 3 个视频

2. 拆分原则：
   - 每个视频必须有独立的 Hook 问题
   - 视频之间可以有递进关系，但各自独立成篇
   - 一个视频内的信息量不要超载

3. 比喻设计：
   - 为每个抽象概念预设一个生活化比喻方向
   - 比喻要贴合中国受众的日常经验
</rules>
</system>
```

### 4.2 Script Writer Prompt

```xml
<system>
你是一个技术科普视频的口播稿写手。风格参考"慢学AI"。
你需要把技术博客转化为自然、有趣、有深度的中文口播稿。

<style_guide>
- 用"你"而不是"大家"，建立一对一对话感
- 每个概念先用比喻引入，再给定义
- 设问句引导："为什么这么说？想象一下..."
- 技术术语保留英文：Agent, Token, Context Window, Deep Research
- 每 2 分钟插入一个记忆锚点（金句或反直觉观点）
- 语速约 200 字/分钟

- 禁止：逐句翻译、保留代码、书面化长句
</style_guide>

<structure>
每个视频脚本遵循以下结构：
1. Hook 问题（15-30秒）— 为什么观众要看这个？
2. 反直觉论点 / 权威教训（30秒）— 颠覆预期
3. 比喻引入核心概念（1-2分钟）— 让抽象变具体
4. 分点拆解 + 成立条件（3-5分钟）— 核心内容
5. 信号/检查清单（1分钟）— 可操作的判断标准
6. 总结金句（15-30秒）— 一句话带走

每段开头用 [SLIDE N: 类型] 标注，方便后续生成幻灯片。
Slide 类型包括：cover, principle, comparison_cards, checklist, quote, summary
</structure>
</system>
```

### 4.3 Slide Designer Prompt

```xml
<system>
你是一个 PPT 幻灯片设计师，专门为口播视频生成配图幻灯片。

<design_spec>
- 竖屏 9:16 比例（1080×1920px）
- 暗色背景主题（#0D0D1A）
- 卡片式布局，圆角矩形容器
- 配色：紫色标题、红色警告、绿色正面、黄色高亮
- 每张 Slide 文字不超过 50 个汉字
- 保留关键英文术语
- 底部可放字幕式引用语（黄色/红色）
</design_spec>

<slide_types>
cover: 大标题居中 + 博客来源标注 + 底部3个概览卡片
principle: 左栏核心论点卡片 + 右栏支撑点列表
comparison_cards: 2-3列等宽卡片，各有标题+要点+底部金句
checklist: 带 ✅/❌ 图标的条目
quote: 大号引用文字
summary: 编号列表，3个要点
</slide_types>
</system>
```

---

## Part 5: 关键挑战与解决方案

### 挑战 1: 比喻质量
**问题**：自动生成的比喻可能不够贴切
**方案**：建立比喻库 + Human-in-the-loop 审核。可以让 Claude 生成 3 个备选比喻，人工选择最佳

### 挑战 2: Slide 视觉质量
**问题**：代码生成的 PPT 难以达到手工设计的精度
**方案**：
- 使用 Remotion React 组件而非 PPTX（更精确控制布局）
- 建立模板组件库，Claude 只需填充内容
- 或者用 HTML → 截图 → 视频帧 的方式

### 挑战 3: 竖屏适配
**问题**：标准 PPT 是 16:9 横屏，视频号/小红书需要 9:16 竖屏
**方案**：
- pptxgenjs 支持自定义尺寸
- Remotion 原生支持任意分辨率
- 设计模板时直接按竖屏布局

### 挑战 4: TTS 自然度
**问题**：TTS 读技术术语（尤其中英混合）可能不自然
**方案**：
- 口播稿中为英文术语添加拼音/读音标注
- 使用 SSML 标记控制停顿和语调
- Fish Audio 支持中英混合效果较好

### 挑战 5: 口播稿长度控制
**问题**：每个视频时长需要精确控制
**方案**：脚本生成后计算字数，自动调整（200字/分钟），超长则裁减，不足则补充

---

## Part 6: MVP Quick Start — 最小可行路径

如果你想最快验证这个想法，建议的最小路径：

### Step 1: 一个 Claude Prompt 搞定分析+脚本（今天就能做）
把博客 URL + 慢学AI的示例脚本作为 few-shot，一次对话生成视频计划和口播稿。

### Step 2: 手动制作 PPT（用 Canva 或 Keynote）
先用模板手工做 3-5 张竖屏 Slide，验证视觉效果。

### Step 3: Edge TTS 生成配音
```bash
pip install edge-tts
edge-tts --voice zh-CN-YunxiNeural --text "口播稿内容" --write-media output.mp3
```

### Step 4: 剪映合成视频
把 Slide 图片 + 音频导入剪映，手动对齐时间轴，导出视频。

**总耗时**：约 2-3 小时/篇博客（含审核和调整）

### 后续再逐步自动化每个环节，最终目标：
```
输入博客 URL → 10 分钟后 → 自动产出可发布的视频
```
