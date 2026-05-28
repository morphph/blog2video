# How CodeRabbit Used Claude to Build an Agent Orchestration System

**Publication Date:** May 27, 2026

**Category:** Claude Code

**Reading Time:** 5 min

---

## The Quick Pitch

- **Name:** CodeRabbit
- **Founded:** 2023
- **Founder:** Harjot Gill, CEO
- **Stack:** Claude Platform, Claude Code
- **Scale:** Reviews 2 million PRs per week across 15,000+ customers

---

## Main Content

AI coding tools have accelerated development timelines, but CodeRabbit identified a critical problem: code that compiles and passes tests while failing to solve the intended problem.

David Loker, VP of AI at CodeRabbit, explains the root cause: "As we gain experience as developers, we internalize knowledge. All those things are in our head, and we assume other developers know them too."

Developers often skip documenting obvious requirements, leaving AI systems to fill gaps with plausible but incorrect assumptions. Loker shared a personal example where he built a memory system but forgot to specify a login mechanism—the agent filled that gap during implementation, wasting hours of work.

### Addressing the Internal Knowledge Gap in AI Coding

When CodeRabbit analyzed AI-generated pull requests across customers, the most common failure was functionally correct code that didn't solve the actual problem. Vague prompts force systems to guess at missing context.

### An Orchestration Layer That Runs Before AI Coding Solutions

CodeRabbit inserted a planning system before code generation. The system coordinates multiple Claude models to analyze requirements and surface assumptions, producing a structured execution plan reviewed before implementation begins.

"This planning system is not meant to replace Claude Code's Plan Mode. It's a higher level orchestration that happens before Claude Code, to point it in a really narrow and right direction."

The output is a collaborative product requirements document (PRD) that captures decisions and context, helping teams avoid rework and onboard new engineers.

### Routing Across the Claude Model Family

CodeRabbit optimizes cost and latency by matching models to task complexity:

- **Opus:** Orchestration loop and high-level strategic understanding
- **Sonnet:** Sequences planning steps into structured workflows
- **Haiku:** Narrowly scoped operations like context distillation

"If Haiku does as well as Sonnet on a given task, we use Haiku," Loker states.

### Building an Eval Harness for Plan Quality

CodeRabbit developed evaluation infrastructure specifically for planning output. The system uses:

- Hand-tuned examples and manual inspection
- LLM judges scoring specific plan quality dimensions
- Measurement of generated code functionality, scope creep, and token usage

Finding the right abstraction level required iteration. Plans that were too detailed became stale quickly; overly high-level plans left room for assumptions—recreating the original problem.

### Catching Errors Before Any Code Gets Written

In AI-native workflows, many decisions previously surfacing during code review now occur during planning. "The plan itself becomes a quality gate. If we can make sure the quality of that plan is really good upfront, the downstream effect is very pronounced."

---

## Best Practices from CodeRabbit

1. **Define intended outcomes and measurement:** Be explicit about specifications and the maximum possible product (MPP)

2. **Identify implicit assumptions:** Ask Claude what's missing and what parts emerge as implicit assumptions rather than explicit specifications

3. **Account for edge cases:** Ask Claude to identify workflows or cases that may be overlooked

4. **Validate before rollout:** Create a chronicle of planning artifacts saved and reused to verify output matches intent
