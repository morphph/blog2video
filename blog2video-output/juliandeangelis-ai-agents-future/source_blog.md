# The Spec is the New Code: Spec-Driven Development for AI Coding Agents

**Author:** Julián (@juliandeangeIis)

**Source:** https://x.com/juliandeangeIis/status/2033303156340240481

---

<!-- [IMAGE DESCRIPTION: image_1.jpg] Pixel-art style infographic titled "THE SPEC IS THE NEW CODE". Shows a flow: Specification documents (Spec, Plan, Tasks) → Coding Agent (retro computer with AI brain) → Generated Code (functions, classes, API endpoints) → Program (finished application). Small pixel characters observe the process. Dark grid background with retro tech aesthetic. -->

## The Core Idea: The Spec is the New Code

In the age of AI coding agents, the specification has become the new code. The workflow is:

**Specification** (Spec, Plan, Tasks) → **Coding Agent** → **Generated Code** (functions, classes, APIs) → **Working Program**

The human's primary job is no longer writing code line by line — it's writing clear, detailed specifications. The coding agent takes these specs and generates the actual implementation. The quality of your specification directly determines the quality of the generated code and the final program.

<!-- [IMAGE DESCRIPTION: image_3.jpg] Hand-drawn illustration titled "WHAT IS SDD?" showing four phases in a horizontal flow with a banner: SPECIFY (Define Requirements, Goals, & Scope — cloud with question marks) → PLAN (Design Structure & Timeline — cloud with system architecture, technologies, milestones, resources) → TASKS (Breakdown into Actionable Steps — checklist cards with specific tasks) → IMPLEMENT (Develop & Realize the Solution — robot coding with Code/Test/Build/Deploy steps). Arrow at bottom reads "AMBIGUITY DECREASES →". Soft pastel colors. -->

## What is SDD (Spec-Driven Development)?

SDD is a methodology with four phases, where ambiguity decreases at each step:

### 1. Specify
Define Requirements, Goals, and Scope. This is where you start with vague ideas and questions, and crystallize them into clear requirements.

### 2. Plan
Design Structure and Timeline. Determine the system architecture, technologies to use, milestones, and resources needed.

### 3. Tasks
Breakdown into Actionable Steps. Create concrete, implementable tasks like "Implement API endpoint X", "Design database schema for Y", "Build front-end components for Z". Each task should be specific and measurable.

### 4. Implement
Develop and Realize the Solution. This is where the coding agent (or human developer) executes: Code → Test → Build → Deploy.

**Key insight:** As you move from Specify to Implement, ambiguity decreases. The entire purpose of SDD is to front-load the thinking and reduce ambiguity before any code is written.

<!-- [IMAGE DESCRIPTION: image_2.jpg] Cyberpunk-style infographic titled "UNDERSTANDING THE SPECTRUM OF SDD: PART 2 - THE REAL BOTTLENECK". Left side shows "THE VAGUE PROMPT FLOW": robot confused by vague prompt "Add a feature to manage items from the backoffice", with question marks about which backoffice, API, auth model, error strategy — leading to wrong user access and rework. Right side shows "THE SPEC-FIRST FLOW": developer provides detailed spec with idempotency, admin-only, internal API, JSON schema → correct feature built first time. Neon colors on dark background. -->

## Understanding the Spectrum of SDD: The Real Bottleneck

### The Vague Prompt Flow (What NOT to do)

When you give a coding agent a vague prompt like "Add a feature to manage items from the backoffice," the agent is forced to guess:
- Which backoffice?
- Which API?
- Which auth model?
- What error strategy?

This leads to **ambiguity problems and unfortunate guesses** — wrong user access patterns, incorrect data models, mismatched architecture. The result? Rework, bugs, and wasted time.

### The Spec-First Flow (What TO do)

When you provide a detailed spec — including idempotency requirements, admin-only access controls, internal API constraints, JSON schema definitions — the agent builds the **correct feature the first time**.

No guessing. No rework. The spec eliminates ambiguity upfront.

<!-- [IMAGE DESCRIPTION: image_4.jpg] Cyberpunk cityscape infographic titled "UNDERSTANDING THE SPECTRUM OF SDD". Shows three ascending levels: Level 1: SPEC-FIRST (write a spec before code, discarded after delivery, temporary spec eliminates ambiguity) → Level 2: SPEC-ANCHORED (spec remains in repository even after code, living documentation with no drift) → Level 3: SPEC-AS-SOURCE (spec is the primary artifact, code is regenerated from spec, code derived from spec). Bottom banner: "Start at Level 1. Get the value. Decide when to move deeper." Neon blue/purple colors. -->

## The Three Levels of SDD

SDD exists on a spectrum, from lightweight to fully spec-driven:

### Level 1: Spec-First
Write a spec before code. The spec is a temporary artifact that eliminates ambiguity during development. After delivery, the spec may be discarded. This is the entry point — start here to get immediate value.

### Level 2: Spec-Anchored
The spec remains in the repository even after the code is written. It becomes **living documentation with no drift** — always kept in sync with the codebase. This is more disciplined but provides ongoing value as the project evolves.

### Level 3: Spec-as-Source
The spec IS the primary artifact. Code is derived from the spec, not the other way around. The spec becomes the **source of truth**, and code is regenerated or updated to match it. This is the most advanced level.

**Practical advice:** Start at Level 1. Get the value. Decide when to move deeper.

<!-- [IMAGE DESCRIPTION: image_5.jpg] Split illustration titled "WITHOUT PLAN" vs "WITH SPEC-DRIVEN PLAN". Left side: developers on floating islands in chaos — "Is this NextJS or generic React?", "What are the performance limits?", "UserEntity specs are missing!", "Creating my own data models..." — puzzle pieces don't fit. Right side: structured flow with Technical Implementation Guide containing Architectural Decisions, Data Models, Auth Pattern, MCPs, Performance Constraints — developers happily building aligned components. Watercolor hand-drawn style. -->

## Without Plan vs. With Spec-Driven Plan

### Without a Plan (Chaos)
When a coding agent works without a structured plan, it faces confusion at every turn:
- "Is this NextJS or generic React?"
- "What are the performance limits?"
- "UserEntity specs are missing!"
- "Creating my own data models..." (guessing)

The agent makes inconsistent decisions, creates incompatible components, and the result requires significant rework.

### With a Spec-Driven Plan (Structure)
A spec-driven plan provides a **Technical Implementation Guide** that the agent can scan from the codebase (e.g., a `/plan` directory). This guide includes:

- **Architectural Decisions:** NextJS with App Router
- **Data Models:** Existing UserEntity, add provider field
- **Auth Pattern:** Follow @auth-rules
- **MCPs:** Use Figma MCP for design matching
- **Performance Constraints:** <100ms Login endpoint

With this plan:
- "NextJS components aligned... coherent structure!"
- "Integrating @auth-rules pattern... easy!"
- "Running performance test (<100ms)... passed!"
- "Matching Figma MCP... matched!"

Every piece fits together because the spec removed ambiguity before implementation began.

<!-- [IMAGE DESCRIPTION: image_6.jpg] Infographic titled "TRADEOFFS: SDD FOR CODING AGENTS - A SIMPLIFIED VIEW". Shows a balance scale: left side "SDD INVESTMENT (Higher Cost)" with More Tokens (2-3x), Upfront Planning Time, Spec-Plan-Task Cycle; right side "BETTER RESULTS (Higher Value)" with Dramatic Performance Boost, Reduced Ambiguity, Accurate Complex Features — scale tips toward results. Below: traffic light divides "WHEN NOT TO USE SDD" (Small Changes, Quick Bug Fixes, Config Updates → Use Plan Mode or Prompt Directly) from "WHEN SDD SHINES" (Complex Features, Multi-File Changes, Multi-Domain Logic → Ambiguity Reduction). Clean corporate infographic style. -->

## Tradeoffs: SDD for Coding Agents

### The Investment Side (Higher Cost)
- **More Tokens (2-3x):** Writing detailed specs means more input tokens for the AI agent
- **Upfront Planning Time:** You spend more time before coding starts
- **Spec-Plan-Task Cycle:** There's an overhead of going through the full SDD cycle

### The Results Side (Higher Value)
- **Dramatic Performance Boost:** Agents produce significantly better code with clear specs
- **Reduced Ambiguity:** No guessing means fewer bugs and less rework
- **Accurate Complex Features:** Multi-file, multi-domain changes come out correct the first time

### When NOT to Use SDD
- **Small Changes:** Minor tweaks don't need a full spec
- **Quick Bug Fixes:** Simple bugs can be fixed with a direct prompt
- **Config Updates:** Configuration changes are straightforward

For these cases, use **Plan Mode or Prompt Directly**.

### When SDD Shines
- **Complex Features:** Multi-step features with many requirements
- **Multi-File Changes:** Changes that span multiple files and modules
- **Multi-Domain Logic:** Features that touch authentication, database, API, and frontend

For these cases, SDD's **ambiguity reduction** pays for itself many times over.

---

## Summary

Spec-Driven Development is a paradigm shift for how we work with AI coding agents. Instead of throwing vague prompts at an agent and hoping for the best, SDD front-loads the thinking into detailed specifications. The spec becomes the new code — it's the primary artifact that humans create, and the AI agent handles the implementation.

The key takeaways:
1. **Specifications are the new code** — your job is to specify clearly, not code manually
2. **Ambiguity is the enemy** — every ambiguity in your spec becomes a guess in the code
3. **Start with Level 1** (Spec-First) and move to deeper levels as needed
4. **SDD pays off most** for complex, multi-file, multi-domain features
5. **Skip SDD** for small changes, quick fixes, and config updates
6. **The investment** (2-3x tokens, upfront planning) is worth the dramatically better results
