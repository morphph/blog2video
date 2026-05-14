# Best practices for computer and browser use with Claude

Source: https://claude.com/blog/best-practices-for-computer-and-browser-use-with-claude

## Getting started: resolution and scaling

### Ensure proper scaling

Claude's Computer Use API has internal processing limits on image size. For the Claude 4.6 model family:
- **Max long edge**: 1568 pixels
- **Max total pixels**: 1.15 megapixels

For Opus 4.7:
- **Max long edge**: 2576 pixels
- **Max total pixels**: 3.75 megapixels

Images exceeding these limits get silently downscaled, causing coordinate misalignment between the model's perceived image and your harness's expected resolution.

### Recommended resolutions

**Start with 1280x720.** This is a practical default that uses about 80% of the pixel budget and stays well within API limits.

**For Opus 4.7, start with 1080p** for meaningful quality improvement while maintaining a good balance between token usage and performance.

**For maximum visual information**, use the "max API fit" approach, computing optimal resolution per-image based on native aspect ratio while preserving it and avoiding upscaling.

### Resolutions to avoid

- **Native resolution (unscaled)**: Unless already below limits, this is the most common cause of poor click accuracy
- **Very low resolutions (below 960x540)**: Too much detail is lost
- **MacOS concern**: Screenshots often have a device pixel ratio of 2, resulting in 2x screen resolution
- **4.6 family**: Avoid 1920x1080 and above; Opus 4.7 supports higher resolutions

### Coordinate scaling

When resizing screenshots before sending them, you must scale returned coordinates back to actual screen resolution:

```
scale_x = screen_w / display_w
scale_y = screen_h / display_h

screen_x = int(api_returned_x * scale_x)
screen_y = int(api_returned_y * scale_y)
```

### Content ordering in the messages array

Place text instruction **before** the image. This lets the model know what it's looking for while processing the screenshot, improving accuracy.

### Diagnosing click issues

**Clicks consistently offset**: Check that `display_width_px` / `display_height_px` match actual image dimensions; pre-downscale to 1280x720; move text before images.

**Clicks in roughly right area but miss target**: Enable `enable_zoom: True` for dense UIs; capture at lower DPI; preserve source aspect ratio.

**Model clicks wrong element**: Use specific prompts with positional context; break complex interactions into smaller steps; provide layout context.

**Poor accuracy across board**: Pre-downscale screenshots; for 4K+ sources, Sonnet 4.6 is more robust (or use Opus 4.7); try 1280x720 as baseline.

### Model selection for clicking tasks

"Claude Sonnet 4.6 tends to be more mechanically precise at clicking" while Opus 4.6 brings stronger reasoning. Sonnet 4.6 is more robust when downscaling heavily.

Opus 4.7 narrows this gap with roughly equal clicking precision to Sonnet 4.6, plus a higher resolution budget reducing downscaling needs.

**Recommendation**: Start with Sonnet 4.6 for best balance of accuracy, reasoning, and cost. Choose Opus 4.7 for stronger reasoning with high-resolution images.

### Handling small targets

Click accuracy degrades as targets get smaller. Strategies include:

- **Use zoom for dense UIs**: Enable `enable_zoom: True` in tool configuration
- **Make targets larger**: Increasing size has disproportionate impact on reliability
- **Use keyboard alternatives**: For tiny elements, keyboard shortcuts or tab navigation can be more reliable
- **Consider source image resolution**: 4K+ displays compressed to 720p lose significant detail

### Approaches that didn't help

Internal testing found no consistent uplift from:
- Breaking images into smaller tiles
- Overlaying grid patterns with coordinates
- Specific resize algorithm choices

### Inspecting failures

Log full transcripts and overlay predicted clicks on source screenshots. Some failures aren't about accuracy—certain dropdown menus may invoke system UI the browser viewport doesn't capture. The model should rely on alternative methods: JavaScript execution, keyboard navigation, or DOM manipulation.

## Tuning thinking effort for computer use

Claude supports adaptive thinking, letting Claude decide how much to reason through intermediate steps. For computer use, this enables reasoning about screen content, planning multi-step interactions, and self-correction before acting.

### Claude Opus 4.7

Testing across end-to-end UI automation tasks shows Opus 4.7 outperforms the 4.6 family at equivalent token usage. Setting effort to `high` achieves near-highest success rates while using roughly half the output tokens of `max`.

**Recommendations for effort levels**:
- **Default for most use cases**: `high` — Provides enough reasoning for complex workflows without significant token increase
- **High-throughput/cost-sensitive**: `low` — Lower tokens while providing quality between 4.6's high and max
- **Simple, well-defined workflows/fastest**: Suggest Sonnet 4.6 — Best for low latency priority
- **Complex, one-shot tasks**: `max` — Use when you need to get it right on first attempt

### Claude 4.6 models

**Medium effort is the sweet spot.** It achieves close to highest success rate while using roughly half the output tokens of `high`. With retries, medium and high converge to the same success rate.

**Recommendations for effort levels**:
- **Default for most use cases**: `medium` — Best accuracy-to-cost ratio
- **High-throughput/cost-sensitive**: `low` — More accurate than no thinking with lower token usage
- **Simple, well-defined workflows/fastest**: Thinking disabled — Best for low latency
- **Complex, one-shot tasks**: `high` — Use when challenging and need to get right on first attempt

**Don't use `max` effort.** It provides no accuracy benefit over `high` while increasing output token cost.

### Why more thinking doesn't always help

"UI automation tasks are fundamentally different from coding or math problems. Most computer use actions are perceptual and mechanical: identifying the right element, clicking in the right place, rather than deeply logical."

## Improving safety: leveraging prompt injection classifiers

Computer use agents interact with untrusted content by design. Every screenshot, webpage, or application UI could contain adversarial instructions, hidden text, manipulated images, deceptive UI elements, or social engineering attempts.

### How Claude approaches prompt injection defense

- **Training-time robustness**: Reinforcement learning builds injection resistance into Claude's capabilities
- **Real-time classifiers**: Probes scan content entering Claude's context and flag potential injection attempts
- **Continuous red teaming**: Security researchers continuously probe defenses

### Using Claude's built-in classifiers

When using Claude's official computer use tool via the API, prompt injection classifiers run automatically on every request with approximately zero additional latency and no additional cost.

```
tools = [
    {
        "type": "computer_20251124",
        "name": "computer",
        "display_width_px": 1280,
        "display_height_px": 720,
    }
]
```

### If not using the official computer use tool

Built-in classifiers don't currently run on custom tool implementations. Developers building custom computer/browser use integrations can fill out an interest form to request this capability.

### Best practices regardless of classifier use

- **Implement human-in-the-loop for high-stakes actions**: Pause and request confirmation before irreversible actions
- **Scope the agent's permissions**: Limit what the agent can do to reduce blast radius
- **Monitor and log agent actions**: Track full action sequences and screenshots for anomaly detection
- **Treat all web content as untrusted**: Clearly distinguish between user instructions and encountered content

## Context management for computer use

Screenshots accumulate quickly—each action generates a new image consuming 1,000–1,800 tokens. A 200k context window can fill in under 100 screenshots.

Effective context management has two goals: keeping total tokens bounded and keeping prompt caching effective through consistent prefixes.

### Placing cache breakpoints

The API supports four cache breakpoints total. Recommendations:
- **One on system prompt or trailing tool definitions**: This rarely changes
- **Up to three on most recent tool results**: Advance each turn, clearing previous iterations

Spreading breakpoints across recent positions provides graceful degradation if the most recent is invalidated.

### Approach 1: Rolling buffer (cache-aware)

Keep only the N most recent screenshots in full resolution, replacing older images with short text placeholders like "[Image omitted]".

To maintain cache efficiency, prune in batches:
1. Keep the most recent `keep_n` screenshots in full resolution
2. Once total exceeds `keep_n + interval`, replace oldest `interval` screenshots with placeholders in one pass
3. Between pruning events, the message array remains byte-identical, so cache breakpoints keep hitting

Reasonable defaults: `keep_n = 3`, `interval = 25`. These are tunable based on measuring cache hit rate and total input tokens on representative trajectories.

### Approach 2: LLM-based compaction

Instead of silently dropping old images, summarize the full conversation before discarding it. The summary preserves what happened, what was completed, and where to resume.

A good summarization prompt includes sections for:
- USER INSTRUCTIONS (preserve verbatim)
- TASK TEMPLATE (for repeatable workflows)
- CONSTRAINTS AND RULES
- ACTIONS TAKEN
- ERRORS AND FIXES
- PROGRESS TRACKING
- CURRENT STATE
- NEXT STEP

### Server-side compaction (beta)

The simplest approach is letting the API handle compaction via server-side compaction. Pass a custom summarization prompt as the `instructions` parameter in `context_management`, and the API automatically summarizes when input tokens exceed a trigger threshold.

### Client-side compaction

For models without server-side compaction support, implement it yourself. When total input tokens cross a threshold (e.g., 90% of context window), send the conversation to a summarizer model, replace history with the summary plus recent screenshots, then continue.

### Putting it together

A good default for long-running agents:
- One cache breakpoint on stable prefix, three on trailing results
- Cache-aware rolling buffer with `keep_n = 3` and `interval = 25`
- Server-side compaction around 150k input tokens with custom prompt plus client-side truncation pass

## Experimental settings for improving computer and browser use

### Batch tools

`computer_batch` and `browser_batch` accept lists of sub-actions, executing them in single tool calls. Benefits include efficiency on long-horizon tasks. Risks include compounding error if actions depend on intermediate visual states.

Recommend batch tools for self-contained actions that don't depend on each other's outcomes. Avoid them in exploratory navigation or error-recovery sequences.

### The advisor tool (beta)

The advisor tool pairs an executor model with a higher-intelligence advisor model the executor can consult mid-generation for strategic guidance. This happens server-side in a single request with no extra round trips.

For computer use, this is useful on long-horizon tasks where most turns are mechanical but occasional planning moments benefit from stronger reasoning. Useful controls include:
- **`max_uses`**: Cap advisor calls per request
- **Conversation-wide cap**: Stop offering advisor after some number of uses
- **Advisor-side caching**: Cache the advisor's prefix for efficiency after multiple consults

### Periodic reminder nudges

On long sessions, models can forget which tools are available or which to prefer. Two reminder patterns help:

- **Batch reminder**: Short nudge after a tool result: "Remember you can use `computer_batch` to combine sequential actions"
- **Advisor reminder**: On sessions longer than ~20 turns without an advisor call, append a brief reminder the advisor is available

Both are light-touch context injections costing tens of input tokens per append.

### Debugging patterns in the reference implementation

Three utilities in the reference implementation help when something misbehaves:

- **Trajectory viewer**: Step through agent turns with screenshots, thinking, tool calls, and usage
- **Tool debug panel**: Exercise each tool individually to verify capture pipeline
- **Localization playground**: Upload images and ask the model to identify targets; renders coordinates back on image at both display and native resolution

## Improving reliability: teaching Claude

Instead of iterating on text prompts, show Claude correct behavior by recording demonstrations. Record screenshots, actions, and optional voice narration at each step, then replay that as context when Claude executes the same workflow.

### The core concept: show, don't tell

Users demonstrate the task while the system records actions, screenshots, and voice narration. During playback, Claude receives the demonstration as context and follows the same sequence, adapting to any differences in current UI state.

Playback isn't strict replay—Claude uses the demonstration as a guide while reasoning about the live environment. If a button has moved or menu reorganized, Claude can find the equivalent element rather than blindly clicking at recorded coordinates.

### The data model

The fundamental unit is a "workflow step"—a single action captured during recording bundling what was done, where it happened, and what the screen looked like. Store both selectors and coordinates: selectors are more robust to layout changes, but coordinates provide a visual fallback.

### Recording: what to capture

At minimum: capture click events, keyboard input, navigation changes, and a screenshot at each action. For each click, generate a human-readable description and annotate the screenshot with a visual marker at the click position.

The annotation serves two purposes: it helps users verify the recording captured the right element, and during playback it shows Claude exactly where the action occurred.

### Playback: constructing the prompt

Construct a message containing: the user's intent, a context block explaining the demonstration format, and the recorded screenshots. The context block tells Claude how to interpret annotated screenshots and adapt when the live UI differs.

### Playback modes

Support different levels of adherence:

- **Strict**: Follow steps exactly; stop if UI changed too much (good for compliance-sensitive workflows)
- **Adaptive**: Use demonstration as guide but adapt to UI changes (best default)
- **Goal-oriented**: Focus on end result; treat recorded steps as hints (useful when UI changes frequently)

## Getting started with computer and browser use

These practices reflect current best understanding of what makes computer use integrations reliable in production. They apply to Claude 4.6 family and Opus 4.7, and will be updated as new models and techniques emerge.

"As your integration matures, the patterns that matter most will depend on your specific environment, target applications, and reliability requirements."

Start with the computer use documentation, check out the demo implementation of these best practices, or revisit the original computer use research post for background.
