# How to Write Great Claude Code Skills: 9 Principles for Durable, Effective Custom Skills

**Author:** Thariq (@trq212)

---

Claude Code skills let you extend Claude with reusable, domain-specific capabilities via SKILL.md files. But there's a big difference between a skill that barely works and one that becomes indispensable. After building dozens of skills across billing, deployment, incident response, and business automation, here are 9 principles that separate great skills from mediocre ones.

## The Landscape: 9 Categories of Durable Skills

The best skills fit cleanly into one category. Here are the nine that I've found most valuable:

### 1. Library & API Reference
Internal libs, CLIs, SDKs, gotchas. Examples: `billing-lib`, `platform-cli`, `events`.

### 2. Product Verification
Drive the running product to verify. Examples: `signup-driver`, `checkout`, `admin`.

### 3. Data & Analysis
IDs, field names, query patterns. Examples: `funnel-query`, `grafana`, `datadog`.

### 4. Business Automation
Multi-tool workflows → one command. Examples: `standup`, `tickets`, `weekly-recap`.

### 5. Scaffolding & Templates
Framework-correct boilerplate. Examples: `new-app`, `migration`, `workflow`.

### 6. Code Quality & Review
Methodology that ships better code. Examples: `adversarial`, `hypothesis`, `bughunt`.

### 7. CI/CD & Deployment
Commit, push, deploy safely. Examples: `babysit-pr`, `deploy`, `cherry-pick`.

### 8. Incident Runbooks
Symptom → investigation → report. Examples: `oncall`, `correlator`, `queue-debug`.

### 9. Infrastructure Ops
Safety-gated cleanup & maintenance. Examples: `orphans`, `deps`, `cost-investigation`.

---

## 9 Principles for Writing Great Skills

### Principle 1: Skip the Obvious

Claude already has defaults. Don't waste SKILL.md space restating what Claude already knows — like how to use git, how to format code, or basic language syntax. Your skill should contain only information that Claude can't figure out on its own. Focus on what's unique to your codebase, your team's conventions, and your specific domain.

### Principle 2: Build a Gotchas Section

The highest-signal content in any skill is the Gotchas section. This is where you capture the hard-won knowledge — the things that Claude (and new engineers) consistently get wrong.

For example, a billing library skill might start on Day 1 with just a basic description: "How to use the internal billing library. See the lib README for full API docs."

By Week 2, you've added the first gotcha: "Proration rounds DOWN, not to nearest cent."

By Month 3, the Gotchas section has grown to capture every landmine:
- Proration rounds DOWN.
- test-mode skips the invoice.finalized hook.
- idempotency keys expire after 24h, not 7d.
- refunds need charge ID, not invoice ID.

**Add a line each time Claude trips on something.** The Gotchas section is a living document that grows more valuable over time.

### Principle 3: Progressive Disclosure

It's a folder, not a file. Large skills should use a hub-and-spoke pattern. The SKILL.md file is the hub — keep it short (~30 lines) and use it to dispatch to spoke files that do the real work.

For example, a `queue-debugging/` skill folder might contain:
```
queue-debugging/
├── SKILL.md          ← hub
├── stuck-jobs.md
├── dead-letters.md
├── retry-storms.md
└── consumer-lag.md
```

The SKILL.md hub uses a symptom table to route Claude to the right spoke file:

| Symptom | Read |
|---|---|
| Jobs sit pending, never run | stuck-jobs.md |
| Messages in DLQ, no retries | dead-letters.md |
| Same job retried in a loop | retry-storms.md |
| Queue depth keeps climbing | consumer-lag.md |

~30 lines total — the hub dispatches, spoke files do the work. This way Claude only loads the context it needs for the specific problem at hand.

### Principle 4: Don't Railroad

Leave room to adapt. Skills that are too prescriptive — listing every step in excruciating detail — actually hurt Claude's performance. Claude is smart enough to figure out intermediate steps; what it needs is intent and constraints.

**Too prescriptive:**
```
Step 1: Run git log to find the commit.
Step 2: Run git cherry-pick <hash>.
Step 3: If there are conflicts, run git status to list them.
Step 4: Open each conflicting file.
Step 5: For each <<< marker, decide which side to keep.
Step 6: Run git add on each resolved file, then...
```

**Better:**
```
Cherry-pick the commit onto a clean branch. Resolve conflicts preserving intent. If it can't land cleanly, explain why.
```

Give Claude the goal and the constraints, not a script. Let it use its intelligence to find the right path.

### Principle 5: Description = Trigger

Write the description for the model, not for humans. The `description` field in the SKILL.md frontmatter is what Claude uses to decide whether to activate the skill. It should contain the exact phrases a user is likely to say.

**Generic (bad):**
```
name: babysit-pr
description: A comprehensive tool for monitoring pull request status across the development lifecycle.
```

**Trigger-optimized (good):**
```
name: babysit-pr
description: Monitors a PR until it merges. Trigger on 'babysit', 'watch CI', 'make sure this lands'.
```

The second version explicitly lists the trigger phrases. When a user says "watch CI" or "babysit this PR", Claude knows exactly which skill to load.

### Principle 6: Think Through Setup

Cache first-run answers. Skills that need configuration (like which Slack channel to post to, or what format to use) should check for saved config first and only ask on the first run.

For example, a `standup-post` skill:
```
## Your config
!`cat ${CLAUDE_SKILL_DIR}/config.json 2>/dev/null || echo "NOT_CONFIGURED"`

## Instructions
If the config above is NOT_CONFIGURED, ask the user:
- Which Slack channel?
- Paste a sample standup you liked
Then write the answers to ${CLAUDE_SKILL_DIR}/config.json.

Otherwise, post to the saved channel using the saved format.
```

The `!`...`` line runs as a shell command before Claude reads the prompt. This lets you inject dynamic context — like existing config — directly into the skill prompt.

### Principle 7: Store Data

Use `${CLAUDE_PLUGIN_DATA}` for persistence. Skills can store data across sessions using the plugin data directory. This is powerful for skills that need memory — like tracking past standups, accumulating metrics, or maintaining a log.

For example, the standup-post skill can append each standup to `${CLAUDE_PLUGIN_DATA}/standups.log` after posting. This folder persists across skill upgrades.

On each run:
- read the log to see what changed since yesterday
- write today's entry after sending to Slack

### Principle 8: Give It Code

Compose, don't reconstruct. Instead of describing complex logic in natural language, give Claude actual code to work with. Put helper functions in a `lib/` directory with gotchas embedded in docstrings.

For example, `lib/signups.py`:
```python
def fetch(day):
    """Signups from events.raw for one day.
        - event='signup_completed', NOT 'signup_started'
        - dedupe by anonymous_id — user_id is null until after signup"""

def by_referrer(df):
    """Group by traffic source.
        - '(direct)' and '' and None all mean organic"""

def by_landing_page(df):
    """Group by entry page.
        - '/', '/index', '/home' are all the homepage
        - strips query params so UTM'd links collapse"""
```

Then when Claude needs to investigate a signups drop, it can generate code like:

```python
# investigate.py · generated by Claude

from lib.signups import fetch, by_referrer, by_landing_page

mon, tue = fetch("2024-03-11"), fetch("2024-03-12")

print(by_referrer(tue) - by_referrer(mon))      # organic -60%, paid flat
print(by_landing_page(tue) - by_landing_page(mon))  # homepage specifically

# → something broke on / on Tuesday
```

Claude composes the existing code rather than reconstructing the query logic from scratch. The gotchas are right there in the docstrings, so it doesn't need to rediscover them.

### Principle 9: On-Demand Hooks

Session-scoped guardrails. Hooks let you add safety checks that run automatically — like preventing pushes to main, validating SQL before execution, or confirming destructive operations. The key insight is that these should be session-scoped: active when needed, not always-on overhead.

---

## Key Takeaways

The best Claude Code skills share a few traits:
1. **They capture knowledge Claude can't derive from code alone** — gotchas, conventions, tribal knowledge
2. **They're structured for progressive disclosure** — small hub, detailed spokes
3. **They give Claude goals, not scripts** — intent over procedure
4. **They include executable code** — compose, don't describe
5. **They handle setup gracefully** — config once, run forever
6. **Their descriptions are trigger-optimized** — written for the model, not for documentation

Skills are a living system. Start small, add a gotcha every time something goes wrong, and let the skill grow organically. The best skill you'll ever write is the one you keep updating.
