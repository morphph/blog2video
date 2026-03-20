# 5 Agent Skill Design Patterns Every ADK Developer Should Know

**Author:** Google Cloud Tech (@GoogleCloudTech)

**Source:** https://x.com/GoogleCloudTech/status/2033953579824758855

---

## What Are Agent Skills?

An Agent Skill is a self-contained unit of functionality that an ADK (Agent Development Kit) agent can use to perform a specific task. Skills encapsulate instructions, resources, and tools following the Agent Skill specification, with incremental loading to minimize context window impact.

Skills are NOT tools — they don't execute code or call APIs. A skill is a **knowledge package** that teaches the agent how to behave in specific situations.

### The Three-Level Architecture

Skills operate through **progressive disclosure**:

1. **L1 — Metadata** (always visible): Skill name and description in YAML frontmatter, used for discovery
2. **L2 — Instructions** (loaded on demand): Full behavioral guidelines in the SKILL.md body
3. **L3 — Resources** (fetched as needed): Extended documentation in `references/`, templates in `assets/`

### The SkillToolset

ADK implements Skills through the `SkillToolset` class, which provides three core functions:
- `list_skills` — discover available skills
- `load_skill` — retrieve full instructions for a skill
- `load_skill_resource` — fetch specific reference or asset files

Each skill directory follows this structure:

```
my_skill/
├── SKILL.md          # YAML frontmatter + instructions
├── references/       # Optional glossaries, documentation, conventions
└── assets/           # Optional templates, schemas, examples
```

---

## The 5 Design Patterns

Here are five proven patterns for structuring your SKILL.md files, each suited to different types of agent capabilities.

[IMAGE DESCRIPTION: Overview diagram showing all 5 patterns — Tool Wrapper, Generator, Reviewer, Inversion, Pipeline — connected to the ADK SkillToolset (list_skills | load_skill | load_skill_resource)]

---

## Pattern 1: Tool Wrapper

**"Teach the agent a library"**

The Tool Wrapper pattern is the simplest form of a skill. It gives your agent domain expertise on demand — no scripts, no templates, just pure knowledge.

**How it works:**

1. `SKILL.md` defines trigger keywords in its description and provides review + write instructions
2. When triggered, the agent calls `load_skill_resource` to load `references/conventions.md` containing best practices and rules
3. The agent applies these rules as a domain expert

**Key insight:** No scripts, no templates — pure knowledge. The skill simply makes the agent behave as if it deeply understands a specific library, framework, or domain.

**Example use cases:**
- Teaching an agent the conventions of a specific library (e.g., React, Terraform, Kubernetes)
- Encoding coding standards and best practices
- Domain-specific terminology and patterns

[IMAGE DESCRIPTION: Flow diagram showing SKILL.md (trigger keywords, review + write instructions) → load_skill_resource → references/conventions.md (best practices & rules) → Agent applies rules (domain expert behavior when skill is loaded)]

---

## Pattern 2: Generator

**"Produce structured output from templates"**

The Generator pattern is for when you need the agent to create consistent, structured output following a specific format.

**How it works:**

1. `SKILL.md` defines a step-by-step generation process
2. It loads **HOW to write** from `references/style-guide.md` (tone, formatting rules)
3. It loads **WHAT to produce** from `assets/report-template.md` (output structure)
4. The agent fills the template following the style guide to produce structured output

**Key insight:** Template enforces structure, style guide enforces quality. By separating the "how" from the "what," you get consistent, high-quality outputs every time.

**Example use cases:**
- Generating reports, documentation, or configuration files
- Creating standardized code from specifications
- Producing consistent marketing copy or technical writing

[IMAGE DESCRIPTION: Flow diagram showing SKILL.md (step-by-step generation process) splitting into HOW to write (references/style-guide.md — tone, formatting rules) and WHAT to produce (assets/report-template.md — output structure), both converging to produce Structured Output (report, doc, or config filled from template)]

---

## Pattern 3: Reviewer

**"Evaluate against a standard"**

The Reviewer pattern turns your agent into a quality gate that evaluates input against a defined checklist of rules.

**How it works:**

1. The user submits their code (or any artifact) for review
2. `SKILL.md` defines the review protocol: Load rules, Apply rules, Report findings
3. The agent loads `references/review-checklist.md` containing rules organized by severity
4. The agent produces a Review Report with findings by severity, scores, and recommendations

**Key insight:** Swap the checklist to get a different review type. The same review protocol works for security audits, code reviews, accessibility checks, or any evaluation — just change the checklist.

**Example use cases:**
- Code review against team standards
- Security vulnerability assessment
- Accessibility compliance checking
- Documentation quality review

[IMAGE DESCRIPTION: Flow diagram showing User's Code (input to review) → Submit → SKILL.md (review protocol: Load, Apply, Report) → two outputs: (1) Load rules from references/review-checklist.md (rules by severity) and (2) Produce Review Report (findings by severity, score + recommendations)]

---

## Pattern 4: Inversion

**"The skill interviews you"**

The Inversion pattern flips the typical interaction model. Instead of the user telling the agent what to do, the skill drives the conversation by asking structured questions before taking action.

**How it works:**

1. **Phase 1 — Discovery:** The agent asks foundational questions (Q1: What problem are you solving? Q2: Who are the users? Q3: What's the scale?)
2. **Phase 2 — Constraints:** The agent asks technical questions (Q4: What platform? Q5: What tech stack? Q6: What requirements?)
3. **Phase 3 — Synthesis:** Once all answers are gathered, the agent loads a template, fills it from answers, and confirms with the user

**Key insight:** Agent asks, user answers — skill drives the conversation. This pattern is essential when the agent needs information it can't infer from context before it can act effectively.

**Example use cases:**
- Project scaffolding or initialization wizards
- Requirements gathering for complex tasks
- Configuration generation that needs user preferences
- Onboarding workflows that adapt to user responses

[IMAGE DESCRIPTION: Three-phase flowchart — Phase 1: Discovery (Q1: Problem? Q2: Users? Q3: Scale?) → All answered → Phase 2: Constraints (Q4: Platform? Q5: Tech stack? Q6: Requirements?) → All answered → Phase 3: Synthesis (Load template, Fill from answers, Confirm with user)]

---

## Pattern 5: Pipeline

**"Enforce a multi-step workflow with gates"**

The Pipeline pattern structures complex operations as a series of sequential steps with explicit validation gates between them. This ensures quality at each stage before moving forward.

**How it works:**

1. **Step 1:** `search_code` — Parse & Inventory the codebase
2. **Gate 1:** User confirms the inventory is correct
3. **Step 2:** `edit_document` — Generate docstrings based on the inventory
4. **Gate 2:** User approves the generated documentation
5. **Step 3:** `merge_documents` — Assemble the final documentation
6. **Step 4:** `verified` — Quality check on the assembled output

**Key insight:** Gate conditions prevent skipping validation. By inserting human approval checkpoints between steps, you prevent the agent from racing ahead with incorrect assumptions.

**Example use cases:**
- Multi-file code refactoring with review checkpoints
- Documentation generation pipelines
- Data migration workflows
- Multi-stage deployment processes

[IMAGE DESCRIPTION: Linear pipeline diagram — Step 1: search_code (Parse & Inventory) → Gate 1: User confirms? → Step 2: edit_document (Generate Docstrings) → Gate 2: User approves? → Step 3: merge_documents (Assemble Docs) → Step 4: verified (Quality Check)]

---

## Choosing the Right Pattern

A decision guide for SKILL.md design:

**Start here: Does the skill produce output?**

- **Yes → From a template?**
  - **Yes →** Use the **Generator** pattern (document_create)
  - **No →** Use the **Tool Wrapper** pattern (book_open)

- **No → Does it evaluate existing input?**
  - **Yes →** Use the **Reviewer** pattern (checklist)
  - **No → Needs user input first?**
    - **Yes →** Use the **Inversion** pattern (chat_question)
    - **No → Has ordered steps?**
      - **Yes →** Use the **Pipeline** pattern (workflow_steps)
      - **No →** Use the **Tool Wrapper** pattern (book_open)

[IMAGE DESCRIPTION: Decision flowchart for choosing among the 5 patterns based on whether the skill produces output, uses templates, evaluates input, needs user input, or has ordered steps]

---

## Integration with ADK

Loading skills into your agent is straightforward:

```python
from google.adk.skills import load_skill_from_dir, SkillToolset

weather_skill = load_skill_from_dir(pathlib.Path("skills/weather"))
my_skill_toolset = SkillToolset(skills=[weather_skill])
root_agent = Agent(
    name="my_agent",
    tools=[my_skill_toolset]
)
```

Skills deliver the most value when your agent is a generalist that goes deep on demand. Instead of cramming complex and fragile instructions into a single system prompt, you break workflows down, apply the right structural pattern, and build reliable agents.

## Key Takeaways

1. **Tool Wrapper** — Pure knowledge injection. Teach domain expertise without scripts or templates.
2. **Generator** — Template-driven output. Separate "how to write" from "what to produce."
3. **Reviewer** — Quality evaluation. Swap checklists for different review types.
4. **Inversion** — Agent-driven interviews. Gather requirements before acting.
5. **Pipeline** — Gated multi-step workflows. Prevent skipping validation.

Stop trying to cram everything into a single prompt. Break it down, apply the right pattern, and build agents that actually work.
