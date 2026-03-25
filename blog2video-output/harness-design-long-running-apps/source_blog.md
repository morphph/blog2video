# Harness Design for Long-Running Application Development

**Published:** Mar 24, 2026

## Overview

This article explores how Anthropic engineer Prithvi Rajasekaran improved Claude's ability to produce high-quality frontend designs and build complete applications autonomously through novel harness design patterns inspired by Generative Adversarial Networks (GANs).

## Key Findings

### The Generator-Evaluator Pattern

The core innovation separates evaluation from generation. As the author notes, "when asked to evaluate work they've produced, agents tend to respond by confidently praising the work—even when, to a human observer, the quality is obviously mediocre."

By introducing an independent evaluator agent, the system creates a feedback loop that:
- Forces the generator to iterate against concrete criteria
- Makes it easier to tune skepticism in a standalone evaluator than to make a generator self-critical
- Drives outputs toward higher quality through external feedback

### Frontend Design Application

Four grading criteria transformed subjective design into measurable outcomes:

1. **Design Quality:** Coherence and distinctive mood
2. **Originality:** Evidence of custom decisions vs. AI patterns
3. **Craft:** Technical execution (typography, spacing, color)
4. **Functionality:** Usability and task completion

The system ran 5-15 iterations per generation, with the evaluator actively interacting with live pages via Playwright before scoring.

### Full-Stack Coding Architecture

The final system uses three specialized agents:

**Planner:** Converts brief prompts (1-4 sentences) into comprehensive product specs, emphasizing ambition and high-level design while avoiding over-specification that could cascade errors downstream.

**Generator:** Implements features incrementally using React, Vite, FastAPI, and PostgreSQL. Self-evaluates before QA handoff.

**Evaluator:** Uses Playwright to test functionality like a real user, identifying bugs against agreed sprint contracts with specific, actionable findings.

## Performance Comparison

Testing with a retro game maker prompt showed dramatic differences:

- **Solo run:** 20 minutes, $9 cost → Core gameplay broken, poor UX
- **Full harness:** 6 hours, $200 cost → Fully functional with polish and AI integration

[IMAGE DESCRIPTION: Solo run result — "Retro Game Maker" app with basic dark UI and green neon accents. Shows a simple project landing page with empty state. The sprite editor only has basic pixel-art tools with a cyan smiley face sprite.]

[IMAGE DESCRIPTION: Full harness result — "RetroForge" app with polished dark teal theme. Shows: (1) Professional project creation dialog with canvas resolution, tile size, and color palette options; (2) Enhanced sprite editor with "AI Generate" button, multi-zoom preview, and extensive color palette; (3) Level editor featuring an "AI Level Assistant" that generates game levels from text descriptions like "create a castle with sprites guarding it"; (4) Working gameplay with a platformer character navigating a castle structure, complete with physics, debug overlay, and game controls.]

The harness version featured proper physics, working entity controls, intuitive workflows, and embedded Claude integration for AI-assisted game design.

### Model Evolution Impact

When Opus 4.6 released, the harness simplified significantly:

- **Removed:** Sprint decomposition (model now handles longer coherent work)
- **Changed:** Evaluator moved to end-of-run single pass instead of per-sprint
- **Maintained:** Planner and evaluator, as both continued adding demonstrable value

The DAW (Digital Audio Workstation) example ran approximately 4 hours at $125, producing a functional music production tool with autonomous agent integration.

## Critical Insights

**Context Handling:** Claude Sonnet 4.5 exhibited "context anxiety," wrapping up prematurely near perceived limits. Context resets—completely clearing and restarting with structured handoffs—proved essential. Compaction alone proved insufficient.

**Self-Evaluation Failure:** Agents reliably overpraise their own work. Separation of concerns makes calibration tractable because evaluators can be prompted to skepticism more effectively than generators can be prompted to self-criticism.

**Harness Simplification:** Each component encodes assumptions about model limitations. As models improve, these assumptions warrant testing. The author advocates: "find the simplest solution possible, and only increase complexity when needed."

**Prompt Engineering Effects:** Wording choices shaped outputs unexpectedly. Phrases like "museum quality" steered designs toward particular aesthetic convergence, demonstrating how criteria language directly influences generation character.

## Lessons for AI Engineering

- Experiment constantly against the specific model you're targeting
- Read execution traces on realistic problems to identify bottlenecks
- Expect harness landscapes to shift as models improve
- Treat decomposition and specialized agents as performance tools, not permanent requirements
- Calibrate evaluators through few-shot examples to align with specific preferences

## Technical Stack

- **Frontend:** React, Vite, HTML/CSS/JS
- **Backend:** FastAPI
- **Database:** SQLite, PostgreSQL
- **Tools:** Claude Agent SDK, Playwright MCP, Git
- **Models tested:** Opus 4.5, Opus 4.6, Sonnet 4.5

## Conclusion

The research demonstrates that as models become more capable, the space for sophisticated harness design expands rather than contracts. The meaningful work for AI engineers involves continuously identifying novel agent combinations and stripping away scaffolding that no longer bears weight on performance.

---

*Acknowledgments: Mike Krieger, Michael Agaby, Justin Young, Jeremy Hadfield, David Hershey, Julius Tarng, Xiaoyi Zhang, Barry Zhang, Orowa Sidker, Michael Tingley, Ibrahim Madha, Martina Long, and Canyon Robbins contributed to this work.*
