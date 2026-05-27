# Follow a Goal - Codex Use Case

**Source:** https://developers.openai.com/codex/use-cases/follow-goals

## Overview

This page documents Codex's `/goal` feature, an advanced experimental capability for long-running, objective-driven work.

## Key Information

**Difficulty Level:** Advanced
**Time Horizon:** Long-running

### Purpose

The `/goal` command enables Codex to maintain focus on "a durable objective for long-running work" across multiple turns toward a "verifiable stopping condition."

### Best Use Cases

- Code migrations with clear success criteria
- Large refactors with validation loops
- Long-running experiments, games, and prototypes
- Deployment retry loops where progress is measurable

### Core Principle

As stated in the guide: "A good goal is bigger than one prompt but smaller" than an open-ended backlog. The work requires defined objectives, stopping conditions, and validation methods.

## Setup Requirements

1. Enable via `/experimental` or add `goals = true` to config
2. Define objective and stopping condition clearly
3. Point to relevant files and documentation
4. Establish commands/artifacts proving progress
5. Request checkpoints and progress logging

## Operating Model

Codex works independently for hours without intervention. Users can inspect status via `/goal`, and pause/resume/clear as needed. Progress reports should identify "the current checkpoint, what was verified, what remains, and whether Codex is blocked."

## Example Applications

- **Migrations:** Moving codebases between frameworks with visual parity verification
- **Prototypes:** Implementing specifications with tests at each milestone
- **Optimization:** Iterating prompts against eval suites until target performance

---

**Related resources:** CLI slash commands, Codex workflows, code migration guidance
