# Effective Harnesses for Long-Running Agents

## Introduction

As AI agents become increasingly capable, developers are asking them to handle complex tasks spanning hours or days. However, maintaining consistent progress across multiple context windows remains challenging.

The core issue: agents work in discrete sessions with no memory of previous work. Like engineers on shifts with no handoff documentation, agents struggle to bridge gaps between coding sessions due to limited context windows.

## Solution Overview

Anthropic developed a two-part approach using the Claude Agent SDK:

1. **Initializer Agent** - Sets up the environment on first run
2. **Coding Agent** - Makes incremental progress while leaving clear artifacts for the next session

Code examples are available in the quickstart repository.

## The Long-Running Agent Problem

Even frontier models like Opus 4.5 struggle with high-level prompts like "build a claude.ai clone" across multiple context windows. Two failure patterns emerged:

**Pattern 1:** Agents attempt too much at once, running out of context mid-implementation, leaving features undocumented and forcing subsequent sessions to troubleshoot rather than progress.

**Pattern 2:** Later agent instances declare projects complete after seeing progress, without finishing all required features.

The solution decomposes into two parts: establish an initial environment supporting *all* required features, and prompt each agent to make incremental progress while maintaining clean, mergeable code.

## Environment Management

### Feature List

The initializer agent creates a comprehensive JSON file with 200+ features marked as "failing":

```json
{
    "category": "functional",
    "description": "New chat button creates a fresh conversation",
    "steps": [
      "Navigate to main interface",
      "Click the 'New Chat' button",
      "Verify a new conversation is created",
      "Check that chat area shows welcome state",
      "Verify conversation appears in sidebar"
    ],
    "passes": false
}
```

Instructions emphasize: "It is unacceptable to remove or edit tests because this could lead to missing or buggy functionality." JSON format reduces inappropriate model modifications versus Markdown.

### Incremental Progress

Coding agents work on one feature at a time. Clean state is maintained through:
- Git commits with descriptive messages
- Progress file summaries
- Ability to revert failed changes

This eliminates wasted time guessing at prior work.

### Testing

Claude initially marked features complete without proper end-to-end testing. Explicit prompting to use browser automation tools (Puppeteer MCP) dramatically improved verification. Agents tested like human users rather than relying on unit tests or curl commands.

Limitations remain: Claude cannot see browser-native alert modals through Puppeteer, making features relying on these modals buggier.

## Getting Up to Speed

Each session follows these steps:

1. Run `pwd` to verify working directory
2. Read git logs and progress files for recent context
3. Review feature list and select highest-priority incomplete feature

An `init.sh` script runs the development server, and agents perform basic end-to-end testing before implementing new features.

Typical session start:
```
[Assistant] I'll start by getting my bearings and understanding the current state of the project.
[Tool Use] bash - pwd
[Tool Use] read - claude-progress.txt
[Tool Use] read - feature_list.json
[Assistant] Let me check the git log to see recent work.
[Tool Use] bash - git log --oneline -20
```

## Agent Failure Modes and Solutions

| Problem | Initializer Agent Behavior | Coding Agent Behavior |
|---------|---------------------------|----------------------|
| Declares victory too early | Set up feature list file with end-to-end descriptions | Read feature list at session start; work on single features |
| Leaves buggy code | Create git repo and progress notes file | Read progress/logs; run basic tests; commit with updates |
| Marks features done prematurely | Set up feature list file | Self-verify all features before marking passing |
| Wastes time figuring out app setup | Write init.sh script | Start session by reading init.sh |

## Future Work

Key open questions remain:

- Does a single general-purpose agent outperform specialized agents (testing, QA, cleanup)?
- Can these findings generalize beyond web app development to scientific research or financial modeling?

The approach is optimized for full-stack development but offers lessons applicable across domains requiring long-running autonomous work.

## Acknowledgements

Written by Justin Young. The work reflects efforts from Anthropic's code RL and Claude Code teams.

Footnote: The initializer and coding agents differ only in initial prompts; system prompts, tools, and harness are identical.
