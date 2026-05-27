# Run Long Horizon Tasks with Codex

**Author:** Derrick Choi
**Date:** Feb 23, 2026
**Category:** Codex
**Source:** https://developers.openai.com/blog/run-long-horizon-tasks-with-codex

## Overview

This article documents an experimental 25-hour Codex session using GPT-5.3-Codex at "Extra High" reasoning to build a design tool from scratch. The agent generated approximately 30,000 lines of code while consuming 13 million tokens, demonstrating capabilities in extended autonomous work with coherent execution.

## What a Long-Run Codex Session Looks Like

The experiment produced session summaries showing CLI stats and token usage tracking. The session included parallel planning, implementation, validation, and repair cycles executed continuously without manual intervention.

## The Real Shift Is Time Horizon

The practical advancement centers on duration rather than singular intelligence. As noted: "agentic coding is increasingly about time horizon, not just one-shot intelligence." Models demonstrate improved capacity to maintain coherence across extended tasks, complete larger work segments end-to-end, and recover from errors without losing context.

Recent GPT-5.3-Codex improvements focus on:
- Multi-step execution (plan → implement → validate → repair)
- Mid-flight steering without resetting entire runs

## Why Codex Stays Coherent on Long Tasks

The agent loop provides structure through:

1. Planning
2. Code editing
3. Running tools (tests/build/lint)
4. Observing results
5. Repairing failures
6. Updating documentation
7. Repeating cycles

This framework succeeds because it supplies real feedback, externalizes state across repositories and files, and enables course corrections based on outcomes rather than isolated prompt engineering.

## The Experimental Setup

The designer selected a design tool as the test subject, requiring UI development, data modeling, editing operations, and edge-case handling. Specifications were provided through structured markdown files rather than a single monolithic prompt.

### Key Documentation Files

**Prompt.md** — Contained specifications and deliverables, establishing the project target and preventing architectural drift.

**Plan.md** — Defined milestones with acceptance criteria and validation commands, enabling checkpoint-based verification.

**Implement.md** — Served as operational instructions, directing the agent to follow plans, maintain scoped diffs, and continuously validate.

**Documentation.md** — Functioned as status tracking and decision logging, maintaining transparency throughout extended execution.

## Verification at Every Milestone

Rather than write-and-hope approaches, the agent executed quality commands including linting, type checking, testing, and building after each milestone, repairing failures before continuation.

## What the Agent Built

Implemented capabilities included:

- Canvas editing (frames, groups, shapes, text, images, buttons, charts)
- Live collaboration with presence and cursor synchronization
- Inspector controls for geometry and styling
- Layer management with search and reordering
- Alignment guides and snapping
- History snapshots with restore functionality
- Timeline replay with branching
- Prototype mode with navigation
- Comment threads with resolution tracking
- Export capabilities (JSON, React + Tailwind)

## Takeaways for Long-Horizon Tasks

Success depended on combining:

- Clear specifications and constraints
- Checkpointed milestones with acceptance criteria
- Documented operational procedures
- Continuous verification routines
- Live status logs maintaining inspectability

The direction emphasizes delegating complex work with guardrails rather than continuous micromanagement.

## Getting Started

Recommended resources:
- Codex overview
- Codex quickstart
- Codex models documentation
- Codex app features guide
