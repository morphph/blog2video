# Harness Design for Long-Running Application Development

**Published:** March 24, 2026
**Author:** Prithvi Rajasekaran, Anthropic Labs
**Source:** https://www.anthropic.com/engineering/harness-design-long-running-apps

## Overview

This article explores how multi-agent architectures inspired by Generative Adversarial Networks (GANs) can improve Claude's performance on complex, long-running coding tasks. The work demonstrates techniques that successfully bridge the gap between baseline model capabilities and production-quality applications.

## Core Challenge: Why Naive Approaches Fall Short

Two persistent failure modes plague long-running agentic coding:

**Context Window Degradation**: Models lose coherence as context fills, with some exhibiting "context anxiety"—prematurely wrapping up work as they perceive approaching limits. Context resets (clearing and restarting with structured handoffs) proved more effective than compaction for Claude Sonnet 4.5.

**Self-Evaluation Bias**: When evaluating their own work, agents confidently praise mediocre outputs. This problem intensifies for subjective tasks lacking binary verification criteria. Separating generation from evaluation creates leverage for improvement.

## Frontend Design: Quantifying Subjective Quality

The author developed a generator-evaluator loop with four gradable criteria:

- **Design Quality**: Coherent visual identity across colors, typography, and layout
- **Originality**: Evidence of deliberate choices versus template defaults and recognizable AI patterns
- **Craft**: Technical execution of typography, spacing, color harmony, and contrast
- **Functionality**: Usability independent of aesthetics

The evaluator, equipped with Playwright MCP, actively navigated pages before scoring. Over 5-15 iterations, this approach pushed outputs toward distinctive aesthetics. A notable example: after initial safe designs, the model reimagined a museum website as a 3D CSS-rendered gallery with spatial navigation.

## Full-Stack Coding Architecture

A three-agent system addressed identified gaps:

**Planner**: Transforms brief prompts (1-4 sentences) into ambitious product specifications, emphasizing deliverables over implementation details. Identifies opportunities to integrate AI features.

**Generator**: Works in feature-focused sprints using React, Vite, FastAPI, and SQLite/PostgreSQL. Performs self-evaluation before QA handoff. Maintains version control via git.

**Evaluator**: Uses Playwright MCP to exercise running applications like users would. Tests UI features, API endpoints, and database states. Negotiates sprint contracts defining success criteria before implementation begins.

## Performance Comparison: Solo vs. Harness

Testing with a "retro game maker" prompt:

| Approach | Duration | Cost |
|----------|----------|------|
| Solo agent | 20 min | $9 |
| Full harness | 6 hours | $200 |

The solo output exhibited broken core functionality—entities appeared but didn't respond to input. The harness version delivered a functional game with polished interfaces, though with minor workflow and physics edge cases.

## Key Issues the Evaluator Caught

Examples from DAW (Digital Audio Workstation) testing:

- Rectangle fill tool triggered only at drag endpoints instead of filling regions
- Delete key handler required simultaneous condition satisfaction that clicking couldn't trigger
- Route matching order caused `/frames/reorder` to be interpreted as a frame ID parameter

## Iterating Toward Simplicity

As Claude Opus 4.6 improved, assumptions about necessary scaffolding became testable. Removing the sprint construct entirely—relying on continuous sessions with automatic compaction—worked for higher-capability models. The evaluator remained valuable for tasks at the edge of what the model could reliably accomplish solo, but became overhead for simpler assignments.

## Key Findings

1. **Decomposition matters**: Breaking problems into specialization (planning, generation, evaluation) outperforms monolithic approaches by significant margins.

2. **Criteria shape behavior**: Prompting language around evaluation criteria directly influences output character, even before feedback loops activate.

3. **External evaluation beats self-criticism**: Tuning a separate evaluator to be skeptical proves far more effective than making generators critical of their own work.

4. **Assumptions expire**: As models improve, regularly strip away components that are no longer load-bearing rather than assuming harness complexity remains necessary.

5. **Evaluation tuning is real work**: Out-of-the-box Claude QA agents approve mediocre work. Multiple iteration cycles calibrating against human judgment are required for reliable evaluation.

## Broader Implications

The author emphasizes that improved models don't eliminate harness design—they shift the frontier of what's possible. The space of interesting architectural combinations expands rather than contracts as capabilities grow, creating new opportunities for specialized agent configurations addressing previously intractable problems.
