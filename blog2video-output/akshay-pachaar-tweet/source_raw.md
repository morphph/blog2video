**Author:** Akshay (@akshay_pachaar)
**Source:** https://x.com/akshay_pachaar/status/2041146899319971922
**Title:** The Anatomy of an Agent Harness
**Type:** X Article (long-form) with 8 infographic illustrations
**Date:** April 6, 2026

**Summary:** A deep dive into what Anthropic, OpenAI, Perplexity and LangChain are actually building. Covering the orchestration loop, tools, memory, context management, and everything else that transforms a raw LLM into a useful agent.

---

## 1. "If You're Not the Model, You're the Harness"

The harness is multi-layered, not a single wrapper. It consists of concentric rings around the LLM:

**Center: LLM** — The stateless model (brain). It is stateless; it does not remember between calls.

**Ring 1: Runtime** — The innermost infrastructure layer surrounding the LLM:
- **Orchestration Loop** — The loop keeps running; the core cycle that drives agent behavior
- **Prompt Construction** — Assembles the prompt sent to the LLM each turn
- **Output Parsing** — Parses and classifies LLM output (text vs tool calls)
- **Error Handling** — Catches failures, retries, and recovers gracefully

**Ring 2: Capabilities** — The functional powers the harness provides:
- **Tools** — External capabilities the agent can invoke
- **Memory** — Persistence across turns and sessions
- **Context Management** — Controls what fits in the context window
- **State Management** — Tracks conversation and task state

**Ring 3: Safety & Scale** — The outer protective and scaling layer:
- **Guardrails & Safety** — Input/output filtering, safety checks
- **Verification Loops** — Checking agent work for correctness
- **Subagent Orchestration** — Managing multiple specialized agents
- **Tool Scoping** — Limiting which tools are available when

User request enters through Safety & Scale layers. Tool calls go out through the same layers. The loop keeps running until exit conditions are met.

---

## 2. The Computer Analogy: Harness as Operating System

A raw LLM is a CPU with no operating system. The harness is the OS that makes it useful.

| Computer | LLM Agent |
|----------|-----------|
| CPU | LLM (model weights) |
| RAM | Context Window |
| Hard Disk | Vector DB / Long-term Storage |
| Device Drivers | Tool Integrations |
| **Operating System** | **Agent Harness** ← This is the key layer |
| Application | Agent (emergent behavior) |

Same architecture, new substrate. The harness sits between the raw capability (LLM) and the useful application (Agent), just as an OS sits between hardware and software.

---

## 3. Detailed Harness Architecture

An expanded view of the concentric ring model with all components labeled:

**LLM (center):** Stateless model. Capabilities emerge from the harness, not the model.

**Runtime layer:** Orchestration Loop, Prompt Construction, Output Parsing, Error Handling

**Capabilities layer:** Tools, Memory, Context Management, State Management

**Safety & Scale layer:** Guardrails & Safety, Verification Loops, Subagent Orchestration, Tool Scoping

Two entry/exit points:
- User request enters here (through guardrails)
- Tool calls go out (through guardrails)
- The loop keeps running continuously

The harness is multi-layered, not a single wrapper. Each layer has distinct responsibilities.

---

## 4. The Agent Loop: Simple Mechanically, Complex in Every Step

The loop is simple mechanically, but each step involves significant infrastructure.

**7-step cycle:**

1. **Prompt Assembly** — System prompt + Tools + Memory + History + User message are composed into the prompt
2. **LLM Inference** — Model generates output
3. **Classify Output** — Is it a tool call? If no tool calls → Final Answer (done). If tool calls → continue to step 4
4. **Tool Execution** — Permissions checked here. Validate, sandbox, execute the tool call
5. **Result Packaging** — Format results as messages. Errors returned too
6. **Context Update** — Append to history. Compaction of near-full context happens here
7. **Loop back** — Return to step 1

**Exit conditions:**
- Max turns exceeded
- Token budget exhausted
- Guardrail triggers
- User interrupt

---

## 5. Framework Comparison: Same Pattern, Different Bets

Frameworks have converged on the same core pattern but diverge in philosophy. Same different bets on where control should live.

| Dimension | Claude Agent SDK | OpenAI Agents SDK | LangGraph | CrewAI | AutoGen |
|-----------|-----------------|-------------------|-----------|--------|---------|
| **Loop** | Dumb loop, smart model | Runner class | State graph | Sequential / Hierarchical | Conversation-driven |
| **State** | Git commits | 4 strategies | Typed dicts + checkpoints | Task results | Message history |
| **Multi-Agent** | Teamwork / Worktree | Agents-as-tools / Handoffs | Nested graphs | Agent-Task-Crew | 5 orchestration patterns |
| **Philosophy** | Thin harness, trust the model | Code-first | Graph-based control | Role-based collaboration | Conversation as protocol |

---

## 6. The Scaffolding Metaphor

Three key elements in agent systems:

**The Agent** — The emergent behavior users interact with
**The LLM** — Does the actual work (the construction worker)
**The Harness** — Temporary infrastructure that enables construction (the scaffolding)

Key insights:
- Scaffolding doesn't do the construction. But without it, workers can't reach the upper floors.
- The harness is removed once the building is complete (i.e., as models get smarter, harness complexity decreases)
- But the worker trained on THIS scaffolding. Change it, and performance drops.
- Models get retrained 5 times, each time requiring removal and reconstruction of scaffolding
- As models improve, harness complexity decreases — the scaffolding did its job

---

## 7. Thin vs Thick: The Harness Spectrum

Harness thickness is a core architectural bet about how much to trust the model versus encode in code.

**Thin end (left):** Bet on model improvement
- **Claude Agent SDK** — Tools + Context + Permissions. Model makes all decisions. Trust the model.
- **OpenAI Agents SDK** — Trust the model (similar thin philosophy)

**Middle:** Hybrid approaches

**Thick end (right):** Bet on explicit control
- **CrewAI Flows** — Control the flow
- **LangGraph** — Explicit routing, planning steps, multi-agent strategies. Harness encodes the logic.

As models improve, the bar shifts left (toward thinner harnesses).

---

## 8. Seven Design Decisions for Your Agent Harness

These seven decisions form the design space of agent harness architecture. There is no universal right answer — only trade-offs.

1. **Agent Count**
   - Single Agent: Simpler, fewer LLM calls
   - Multi-Agent: Isolation, specialization

2. **Reasoning Strategy**
   - ReAct: Flexible, higher cost
   - Plan-and-Execute: 3-6x faster, less adaptive

3. **Context Strategy**
   - Aggressive compaction: Save tokens
   - Rich context: Better result, more expensive

4. **Verification**
   - Computational: Tests, linters (deterministic)
   - Inferential: LLM-as-judge (semantic)

5. **Permissions**
   - Permissive: Fast but risky
   - Restrictive: Safe but slow

6. **Tool Scoping**
   - Full toolkit always: Flexible
   - Minimal per step: Better performance. Yercel uses 80% fewer tools

7. **Harness Thickness**
   - Thin: Trust the model
   - Thick: Encode control in code

---

## Images

![image_1.jpg](images/image_1.jpg)

![image_2.jpg](images/image_2.jpg)

![image_3.jpg](images/image_3.jpg)

![image_4.jpg](images/image_4.jpg)

![image_5.jpg](images/image_5.jpg)

![image_6.jpg](images/image_6.jpg)

![image_7.jpg](images/image_7.jpg)

![image_8.jpg](images/image_8.jpg)
