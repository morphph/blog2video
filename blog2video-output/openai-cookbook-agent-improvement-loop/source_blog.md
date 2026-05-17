# Build an Agent Improvement Loop with Traces, Evals, and Codex

## Overview

This cookbook demonstrates "an improvement flywheel for an agent" that combines real traces, human feedback, LLM-generated feedback, and automated evals into concrete harness changes. The workflow preserves learnings through each iteration rather than leaving them as disconnected comments.

## Key Components

**The Improvement Loop consists of:**

1. Creating an OpenAI Agents SDK-backed financial analyst
2. Running it on synthetic company data and capturing traces
3. Adding human and LLM feedback to those runs
4. Converting feedback into Promptfoo evals for reusability
5. Using HALO optimization to rank recommended harness changes
6. Generating a Codex-ready handoff document

The "harness" encompasses the full contract: instructions, tools, routing, output requirements, and validation checks.

## Synthetic Diligence Scenario

The agent reviews fictional acquisition materials including:
- Structured CSV/JSON exports (ARR bridge, customer data, KPIs)
- Narrative documents (board deck, product strategy, legal summaries)
- Supporting artifacts (org chart, pipeline notes, Q&A log)

The agent must decide which sources deserve weight when they conflict, prefer structured data over narratives when disagreeing, and surface unresolved questions.

## Agent Configuration

The system defines three key structures:

**ModelSettings:** Agent model and reasoning effort level

**AgentConfig:** System prompt, model settings, tool policy, and eval metadata

**ToolPolicy:** Allowed data roots, writable output directories, required artifacts, evidence preferences

### Required Artifacts

The agent writes six outputs:
- `summary_answer.md` — concise answer for users
- `investment_memo.md` — fuller review artifact
- `risk_register.json` — structured risks with evidence
- `open_questions.md` — missing evidence or unresolved items
- `citations.json` — machine-readable claim-to-source mapping
- `evidence_table.csv` — tabular audit trail

## Validation Tools

Two Python scripts run inside the workspace:

**check_evidence_coverage.py:** Audits whether drafted claims cite actual dataroom files before finalizing answers

**validate_output_contract.py:** Verifies required artifacts exist, have expected JSON/CSV structure, and reference valid source files

## Trace Export and HALO Integration

The workflow uses a custom `HaloJsonlTraceProcessor` that converts OpenAI Agents SDK spans into OpenTelemetry-style JSONL format for later analysis. Each span includes:
- Resource attributes (service name, version, deployment environment)
- Observation kind mapping (AGENT, LLM, TOOL, etc.)
- Token counts and cost data
- Custom agent workflow metadata

## Execution Model

The `run_sdk_agent()` function:
- Mounts the dataset as a sandboxed workspace
- Attaches tracing infrastructure
- Executes the agent with reasoning enabled
- Collects output artifacts
- Exports traces to HALO-readable JSONL

## Question Bank and Tracing

The notebook uses five traced runs covering distinct failure modes:
- Financing risk analysis from burn and runway
- Revenue quality assessment with ARR reconciliation
- Customer concentration after parent-account rollups
- Enterprise security readiness given SOC 2 status
- Unsupported metrics that should not be inferred

Each trace generates a unique ID, captures the agent's response, and preserves all required artifacts for later analysis.

## Integration Points

The loop connects to:
- **Promptfoo:** For rerunning evals and validation gates
- **HALO:** For analyzing traces, feedback, and optimization recommendations
- **Codex:** For implementing proposed harness changes as pull requests

## Prerequisites

- Python with OpenAI SDK and `openai-agents` package
- Node.js with `npx` for Promptfoo
- Valid `OPENAI_API_KEY`
- Approximately 20 minutes runtime with default settings

The notebook is designed as a live-only demonstration where each step uses fresh model outputs to show the actual loop rather than a scripted preview.
