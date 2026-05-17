# Build Iterative Repair Loops with Codex

## Overview

This cookbook demonstrates closed-loop agent workflows where agents produce output, validate it, and use feedback to improve subsequent iterations. The example focuses on a documentation reliability workflow that detects, repairs, and validates API and SDK examples using intentionally stale notebooks.

## Workflow Architecture

The process consists of three distinct phases:

**Review Phase:** Inspects artifacts and returns structured findings without editing files.

**Repair Phase:** Applies focused edits to copied artifacts using findings and validation feedback.

**Validation Phase:** Runs relevant checks and reports remaining issues for the next cycle.

## Key Components

### Setup Requirements

The notebook requires:
- Codex CLI installation via npm
- OpenAI API key configuration
- Companion sample notebooks in a `data/docs/` folder
- Python environment with dependencies for notebook execution

### Business Rules Definition

Before repair begins, define a contract specifying quality standards:
- Preferred models and APIs
- Modernization targets
- Reader experience expectations
- Self-containment requirements

### Structured Output Schemas

Each phase exchanges machine-readable JSON:
- Review returns findings with issue types and severity levels
- Repair returns change summaries and updated artifact paths
- Validation returns execution status and remaining deltas

## Validation Strategy

Validation employs multiple checks:
- **API Modernization:** Verifies current patterns and model names
- **Setup Reproducibility:** Confirms fresh-environment executability
- **Artifact Integrity:** Ensures teaching flow preservation

For notebooks, execution testing reveals runtime issues before publication.

## Results from Example Run

The three-notebook demonstration showed convergence across iterations:
- Iteration 1: One notebook passed; two required continued work
- Iteration 2: Second notebook cleared; deep case narrowed scope
- Iteration 3: All notebooks achieved passing status

## Generalization Beyond Documentation

The pattern applies wherever agent output requires measurable validation:
- Protocol optimization with safety constraints
- Regulatory content updates with compliance checks
- Code modernization with test validation
- Support knowledge refresh against product behavior

## Key Insight

"The important signal is not that Codex made edits. The important signal is that the remaining validation delta gets smaller as the loop runs."

## Production Considerations

Effective loops require:
- Clear stop conditions (passing validation, max attempts, delta plateauing)
- Complete audit trails for every iteration
- Structured record-keeping of review findings, repairs, and validation results
- Human review checkpoints when needed
