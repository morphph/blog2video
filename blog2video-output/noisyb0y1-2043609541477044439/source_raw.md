# Google engineer automated 80% of his work with Claude Code. here's the exact system he built.

Author: @noisyb0y1
Source: https://x.com/noisyb0y1/status/2043609541477044439

Google engineer with 11 years of experience automated 80% of his work using Claude Code and a simple dotnet app. 

Now he works 2-3 hours a day instead of 8 and chills the rest of the time while the system runs itself making $28,000 in passive income.

Here's what he knows that you don't.

## Part 1 - CLAUDE.md by Karpathy's rules

Andrej Karpathy - one of the most influential AI researchers in the world - documented the most common mistakes LLMs make when writing code: over-engineering, ignoring existing patterns, adding dependencies nobody asked for.

[Image: https://pbs.twimg.com/media/2043590040559792128.jpg]

Someone took these observations and turned them into a single CLAUDE.md file. 

The result - 15,000 stars on GitHub in a week, you could say 15k people changed their lives

The idea is simple: if mistakes are predictable — they can be prevented with the right instructions. One markdown file in the repo gives Claude Code a structured set of behavioral rules for the entire project.

Four principles inside:

```plaintext
Think Before Coding    → stops wrong assumptions and missed tradeoffs
Simplicity First       → stops over-engineering and bloated abstractions
Surgical Changes       → stops touching code nobody asked to touch
Goal-Driven Execution  → tests first, verified success criteria
```

No frameworks. No complex tooling. One file that changes Claude's behavior at the project level.

Real difference:

```plaintext
Without CLAUDE.md:           Claude breaks conventions in ~40% of cases
With Karpathy CLAUDE.md:     violations drop to ~3%
Setup time:                  5 minutes
```

Command that auto-generates your own CLAUDE.md:

```python
claude -p "Read the entire project and create a CLAUDE.md based on:
Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.
Adapt to the real architecture you see." --allowedTools Bash,Write,Read
```

Replaces: Claude that over-engineers simple tasks, adds dependencies nobody asked for and touches files it shouldn't.

## Part 2 - Everything Claude Code: a full engineering team in one repo

github.com/affaan-m/everything-claude-code ( 153,000+ stars )

This isn't just a prompt collection. It's a complete AI operating system for building products.

[Image: https://pbs.twimg.com/media/2043590658204499968.jpg]

```plaintext
30+ specialized agents:
planner.md           → feature planning
architect.md         → system decisions
tdd-guide.md         → test-driven development
code-reviewer.md     → quality and security review
security-reviewer.md → vulnerability analysis
loop-operator.md     → autonomous loop execution
```

```plaintext
180+ skills:
TDD, security, research, content — all already written
```

```plaintext
AgentShield built in:
1,282 security tests right in the config
productivity AND protection at the same time
```

Works on Claude, Codex, Cursor, OpenCode, Gemini - one system everywhere.

How to install:

```python
/plugin marketplace add affaan-m/everything-claude-code

```

Or manually - copy the components you need into your project's .claude/. Don't load everything at once - 27 agents and 64 skills in context simultaneously will burn your limits faster than you can type your first prompt. Take only what you actually need.

Real difference:

```plaintext
Before:  you chat with AI
After:   you manage a team of AI engineers on autopilot
```

Replaces: weeks of setting up your own agent system, separate tools for planning/review/security, $200-500/month on specialized AI services.

## Part 3 - The hidden scandal: Claude Code v2.1.100 is silently stealing your tokens

Someone set up an HTTP proxy to intercept full API requests across 4 different Claude Code versions. 

Here's what they found:

```plaintext
v2.1.98:   169,514 bytes request → 49,726 tokens charged
v2.1.100:  168,536 bytes request → 69,922 tokens charged
difference: -978 bytes but +20,196 tokens
```

v2.1.100 sends FEWER bytes but charges 20,000 MORE tokens. The inflation is entirely server-side - you can't see it and can't verify it through /context.

[Image: https://pbs.twimg.com/media/2043590203265191936.jpg]

Why this matters beyond billing:

```plaintext
Those 20,000 tokens go into Claude's actual context window.
Which means:

→ your CLAUDE.md instructions get diluted by 20K tokens of hidden content
→ quality degrades faster in long sessions
→ when Claude ignores your rules — you can't figure out why
→ Claude Max limits burn 40% faster than they should
```

Fix takes 30 seconds:

```python
npx claude-code@2.1.98

```

Temporary solution until Anthropic officially fixes the issue. But the difference in sessions is noticeable immediately.

Replaces: guessing why Claude suddenly stopped following your instructions.

Case study: what full automation looks like

An engineer with 11 years of experience built a three-part system:

```plaintext
STEP 1 — Classification:
dotnet app calls GitLab API every 15 minutes
→ Claude reads the issue and decides if it's ready for development
→ if not — posts a draft response on GitLab for review

STEP 2 — Execution:
if issue is ready → subagent starts working
→ pushes to a new branch
→ creates PR for review

STEP 3 — PR workflow:
→ checks if there's a PR for the issue
→ checks for new comments
→ implements comments from PR
```

Result after a week:

```plaintext
Before:  8 hours of coding per day
After:   2-3 hours of review and testing

Code quality:    the same — he reviews everything
Status in Teams: online — mouse moves every minute automatically
Rest of the day: free
```

This isn't magic. It's CLAUDE.md + the right agents + a 15-minute cycle.

Full checklist

```plaintext
STEP 1 — Karpathy CLAUDE.md (5 minutes):
claude -p "Create a CLAUDE.md based on Karpathy's principles for this project"
--allowedTools Bash,Write,Read

STEP 2 — Everything Claude Code (10 minutes):
/plugin marketplace add affaan-m/everything-claude-code
Install only the agents you need — not all at once

STEP 3 — Token fix (30 seconds):
npx claude-code@2.1.98
```

What you get after reading this

```plaintext
Before:  Claude breaks conventions in 40% of cases
After:   violations drop to 3% with Karpathy CLAUDE.md

Before:  you spend weeks setting up agents
After:   27 agents ready to work out of the box

Before:  Claude Max burns out in 2-3 hours
After:   downgrade to v2.1.98 gives 40% of limits back

Before:  8 hours of coding per day
After:   2-3 hours of review while the system runs itself

Setup time:         15-20 minutes
Saved per day:      5-6 hours
Saved per month:    100-120 hours
```

> If your time is worth $30/hr - that's $3,000-3,600/month you're just not seeing right now. 
> If $100/hr - that's $10,000-12,000/month going nowhere while you manually write code Claude could write itself.

Most developers will never reach this level - not because they can't, but because they think it's complicated. In reality between you and full automation there are three commands and one file.

The engineer I described at the beginning isn't a genius or a senior from Google. He just spent one evening on the right setup and now his system does the work while he lives his life.

You can do the same thing tonight. While others argue about whether AI will replace developers - those who already set up the system just collect their pay and chill.

The choice is obvious.

You build your own life - so choose the right path. 
/ If this was useful - follow /

