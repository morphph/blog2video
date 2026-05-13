# The AI Agent Complexity Ratchet: Why 90% Test Coverage Is Required

Author: Garry Tan (@garrytan, President & CEO of Y Combinator)
Date: May 12, 2026
URL: https://x.com/garrytan/status/2054064931515855118
Engagement: 139.7K views, 686 likes, 1,345 bookmarks, 109 reposts, 44 replies

I've been coding with AI for the past year. Not just prompting -- building real software. Two open-source projects: **GStack**, which makes AI coding agents better, and **GBrain**, which turns everything you read and write into a searchable knowledge base your AI can use. Between them, about 970,000 lines of code and 665 test files. Pretty much all written by Claude Code and Codex at my direction (15 simultaneous Conductor sessions most of the time).

Last week I merged **fourteen pull requests in 72 hours**. Nearly **29,000 lines of new code**. Each release was better tested than the one before it.

That's supposed to be impossible. Speed and quality are supposed to trade off. Ship fast, break things. Move slow, ship right. Pick one.

You don't have to pick anymore. The unlock is **90% test coverage** -- and AI agents made it free to get there. For fifty years, that level of verification cost too much human willpower to sustain. Now the agent writes the tests alongside the code. The result is what I call **the complexity ratchet**: a system that can only get better, never worse.

(This is the seventh in a series about building with AI.)

## Software used to be brittle

For fifty years, the whole discipline of software engineering was organized around one idea: prevent errors, because errors are catastrophic.

You had to get the code right the first time. Miss one edge case and you crash in production. Ship a bad database migration and you lose customer data. Write a function that does something subtle, and when the one person who understands it quits, nobody knows why it works. The whole system depended on humans being careful, and humans are not careful. So we built elaborate processes -- code reviews, staging environments, QA teams, release trains -- all designed to catch mistakes before they reached users.

It kind of worked. But it was slow. And it meant that the complexity of any software system had a hard ceiling: the number of things one team could hold in their heads simultaneously.

## Now software is squishy

I don't mean sloppy. I mean resilient in a way that wasn't possible before.

When I say "the models are here," I mean that AI coding agents -- Claude, GPT, Codex, and the ecosystem growing around them -- can now read code, understand context, diagnose errors, and write fixes. Not perfectly. But well enough that the error model for software has changed.

The migration breaks? The agent reads the error message, understands the database schema history across 45 versions, writes the fix, writes the test. The file sync hangs on a million symlinks? Agent diagnoses the parser timeout, bounds it at 30 seconds, ships the fix with tests. An extraction pipeline has an attribution bug? A cross-model evaluation catches it, the prompt gets iterated, enforcement gets added at the database layer.

For most code-level errors -- logic bugs, parsing failures, broken edge cases -- agents can now diagnose and fix them in the next turn. That's genuinely new. The errors that remain catastrophic are the ones that destroy state: bad migrations on production data, security holes exploited before detection, privacy leaks that can't be un-leaked. The ratchet helps here too (good tests catch most of these before production) but the real shift is that the vast majority of errors in a codebase are the fixable kind.

This is a phase change for how software gets built. But it only works if you have the ratchet.

## The Agent Complexity Ratchet

A ratchet is a mechanism that allows motion in one direction only. A socket wrench turns a bolt forward and prevents it from turning back. That's the metaphor.

In agent-coded software, every coding session with an AI agent adds three things to the codebase:

- **Tests** that encode what "correct" means -- automated checks that run every time someone changes the code, and fail loudly if the change breaks something
- **Documentation** that records why decisions were made -- not just what the code does, but the reasoning and tradeoffs behind it
- **Evaluation results** that establish quality thresholds -- structured assessments of output quality with scores, so you know if the next version is better or worse

The next time an agent works on the codebase, it loads all three into its context window (the text the AI can see and reason about). It can't regress below the test suite -- the tests would fail. It can't ignore the documentation -- it's right there in context. It can't ship quality below the evaluation baseline -- the scores are recorded.

**The quality floor goes up with every turn. Forward-only motion. That's the ratchet.**

## What this looks like in practice

I'll make this concrete. GBrain is a knowledge system I'm building -- it gives AI agents long-term memory by storing, indexing, and searching through a person's notes, meetings, conversations, and research. Think of it as a second brain that your AI assistant can actually read.

One of its features is epistemological extraction: it reads through thousands of pages and extracts who believes what, with what confidence, over time. "Garry thinks Bitcoin will hit $300K (confidence: 0.45)." "Jared thinks this startup has strong retention (confidence: 0.80)." Like that, but across 28,000 pages.

The first extraction run pulled 100,720 claims. I used a cross-model evaluation to grade the quality -- I had GPT-5.5 and Claude both independently score the output. Overall: 6.8 out of 10.

The biggest problem? Something I call **holder confusion**. Take the claim "AI will replace 80% of software engineers by 2027." Who holds that belief? Is it the person who wrote it? Is it someone they're quoting? Or is it the system's analysis engine, which inferred it from a podcast transcript? Version 1 got this distinction wrong 35% of the time. That matters -- if you're building a system that tracks what people believe, you need to know WHO believes it.

So the evaluation results got documented. Six specific failure modes got identified. The version 2 prompt addressed all six. Weight rounding (the confidence scores) got enforced at the database layer -- no more false precision like 0.74 when 0.75 is the honest answer. Seventeen tests locked in the contract.

Now no future version of the extraction can ship without those 17 tests passing. Nobody has to remember why weight rounding matters or what holder confusion is. The tests remember.

The quality floor went up permanently. That's one turn of the ratchet.

## Why most vibecoded projects die

"Vibecoding" is Andrej Karpathy's term for coding with AI by describing what you want in natural language and letting the model generate the code. It's powerful and it's how I build. But from what I've seen across YC applications and open-source repos, most vibecoded projects that skip tests start falling apart once they reach moderate complexity -- a few thousand lines, a handful of interacting features.

They skip the ratchet. No tests, no docs, no evals. The agent adds complexity but nothing prevents regression. Every new feature has a chance of breaking an old one, and without tests, you don't find out until a user reports it. By version 0.5 the codebase is a haunted house where every change breaks something unexpected. Then the developer writes a blog post about how AI coding doesn't work.

AI coding works fine. They just didn't build the ratchet.

You could argue that the kind of person who writes tests is also the kind who writes good architecture in the first place. Fair. But the ratchet mechanism isn't about the person -- it's about what happens on the next turn. When a new contributor opens a PR, or when a model version changes, or when you're coding at 2am and your judgment is impaired, the tests catch regressions regardless of who wrote them. The ratchet works even when the human isn't at their best. That's the point.

Without tests, improvement is a noisy process -- agents try to make things better, but without regression signals, good changes and bad changes are equally invisible. With a dense test suite, you get a ratchet on the tested surface: quality can only go up for the behaviors you've encoded. That's most of the system, not all of it. But it's enough to sustain forward motion at speed.

## Tests as institutional memory

In traditional software companies, institutional memory lives in humans. The senior engineer who knows why that caching layer exists. The architect who remembers the migration that almost destroyed the database. The tech lead who can explain the weird edge case in the billing system.

Humans leave. They retire, they get poached, they burn out. When they leave, the knowledge goes with them. Every software company has had the experience of opening a critical file and finding a comment that says `// DO NOT CHANGE THIS -- ask Dave` and Dave left three years ago.

The agent's context window doesn't quit. It doesn't get poached. It doesn't forget. When the test suite encodes "weight rounding must use 0.05 increments" and the documentation explains "because cross-modal eval showed false precision degrades trust in the confidence scores," that knowledge is durable. Any agent, any model, any time can load that context and understand the constraint.

Tests are institutional memory that survives employee turnover. For a one-person project, they're even more critical -- they're the only institutional memory you have.

## Everything harnessable is testable

The ratchet doesn't just work for traditional code. It works for anything a computer can observe.

Think about the layers of a modern system. The OS gives you process trees, file system state, network sockets, cron schedules. The terminal gives you every keystroke, every line of output, every interactive prompt. The browser gives you rendered pages, button states, navigation events. APIs give you structured responses you can parse and validate. And AI agents give you observable behavior -- what they say, what tools they call, what order they do things in, whether they ask before acting.

All of these are harnessable. And if you can harness it, you can observe it. If you can observe it, you can assert on it. If you can assert on it, you can ratchet it.

This is a much bigger surface area than traditional unit tests. Let me show you.

**GStack** is my open-source coding agent framework -- 93,000 GitHub stars, 701,000 lines of code, 46 skills. One of its core features is interactive plan review: you ask it to review your architecture, and it walks through the plan section by section, asking questions, probing edge cases, challenging your assumptions. Like having an engineering manager who actually reads the code.

The problem: Claude Code would sometimes skip the whole interactive part. It would read the plan file, dump every finding in one shot, and exit -- without asking the user a single question. The entire point of the review is the back-and-forth dialogue. Skipping it defeats the purpose.

How do you even test that? You can't unit test "did the AI have a conversation." No traditional testing framework covers this.

So I used Bun's TTY functionality to build a test harness (PR #1354) that literally spawns Claude Code inside a pseudo-terminal, feeds it a specific repo scenario, triggers the review skill, and watches the terminal output in real time. The test observes whether the agent fires an interactive question before finishing. If it dumps findings and exits without asking anything, the test fails.

That's not testing code. That's testing whether an AI agent follows a behavioral contract. At the TTY level. By literally watching it work.

The ratchet response was three layers:

- **STOP gates** in the skill instructions -- explicit rules that say "you MUST ask the user before proceeding to the next section," with anti-rationalization clauses that name the specific failure mode so the model can't talk itself into skipping
- **Anti-shortcut clause** -- "the plan file is the OUTPUT of the interactive review, not a substitute for it." One sentence that closes the exact loophole the model kept exploiting.
- **Gate-tier floor tests** -- the TTY harness tests that spawn Claude Code in controlled scenarios and fail if the agent doesn't ask at least one interactive question

Now when Anthropic ships a new model version, or when I change a skill prompt, the test suite catches any regression in the interactive contract. The agent can't silently stop asking questions. The test watches the terminal and checks.

Or take PR #880, which shipped a new OpenClaw plugin. The test doesn't just check that the code compiles. It builds the plugin from source, spawns a real OpenClaw instance in an isolated profile, installs the plugin via the CLI, runs plugins inspect to verify the runtime loaded it, sets the config slot, validates the config, and runs plugins doctor to confirm zero diagnostics. A full end-to-end round trip across two separate programs. 359 lines of test code. The kind of test a human would almost never write by hand because the setup is too tedious. Claude wrote it in about five minutes. That's the effort wall disappearing in real time.

The principle generalizes. You can test at the OS level: did the migration create the right tables, did the cron job fire, is the process still alive? At the browser level: did the page render, did the agent fill in the form correctly. At the API level: did the model return valid JSON with the right schema. At the behavioral level: did the agent follow the protocol, did it ask before deleting, did it stop when told to stop.

The whole stack is testable. The ratchet applies to all of it. Most people haven't realized this yet because they're still thinking about test coverage as "did my function return the right number." The real test surface is everything the computer can see.

## The 90% number

So what does 90% test coverage actually buy you?

Capers Jones studied over 10,000 software projects and measured defect removal efficiency (DRE) -- the percentage of bugs caught before they reach users. His data from *Applied Software Measurement* shows a nonlinear curve: below 70% coverage, DRE sits around 65-75%. At 85-95% coverage, DRE jumps to 92-97%. The relationship isn't linear. There's a knee in the curve around 85% where defect escapes drop sharply.

The avionics industry figured this out decades ago. DO-178C, the FAA standard for flight-critical software, requires modified condition/decision coverage (MC/DC) for Level A systems -- the ones where a bug means a plane crash. Branch coverage alone misses 10-20% of faults. MC/DC, which is stricter than line coverage, achieves >99% DRE. They don't mandate this because bureaucrats like paperwork. They mandate it because the data showed that below certain coverage thresholds, critical defects escape at rates incompatible with not killing people.

The reliability engineering parallel is clean. Factories use a system called Six Sigma to measure quality. The idea: count how many defects you get per million units produced, then express that as a "sigma level" -- higher sigma means fewer defects. A 3-sigma process produces about 67,000 defects per million (pretty bad). A 4-sigma process produces about 6,200 (ten times better). A 5-sigma process produces 233 (another 27x better). The jump from 4 to 5 sigma is not incremental improvement. It's a phase change.

Test coverage follows the same curve. Going from 70% to 90% coverage isn't 30% better. It's an order of magnitude fewer escapes. The defects that slip through at 70% are hiding in the 30% of untested code. At 90%, the hiding places shrink to 10% and most of the dangerous paths are locked down.

Now, I should be honest about what the research also shows. Mockus, Nagappan, and Dinh-Trong studied Windows Vista and found that while coverage correlates with fewer post-release defects, the effort to reach 90%+ rises sharply. The last 20% of coverage takes disproportionately more work than the first 70%. This has been true for decades. It's why most teams stop at 70-80% and call it good enough.

But something changed: **AI coding agents don't experience effort.**

They don't get bored writing the fourteenth edge-case test. They don't cut corners at 5pm on a Friday. They don't look at a gnarly integration test and think "I'll come back to this later." The effort curve that stopped human teams at 70% doesn't apply to agents. You can ask Claude to write tests for every edge case in a module and it will do it cheerfully, thoroughly, at 2am, without complaining. The brutal last 20% that made 90% coverage impractical for human teams is exactly the kind of work AI agents are best at.

This is the real unlock. It's not that AI lets you write code faster. Plenty of people have noticed that. It's that AI lets you **verify** at a level that was previously too expensive to sustain. The 90% threshold that the data says is magical? It used to cost too much human willpower to reach. Now it's free.

That's the key distinction. The ratchet isn't about line coverage as a vanity metric. It's about tests that encode behavioral contracts -- the holder confusion test, the weight rounding test, the interactive review gate. Each test locks in a specific lesson learned. Coverage is the proxy that tells you how much of the system's behavior is under contract. At 90%, nearly every behavior change triggers a test signal. The agent either passes (safe to ship) or breaks a test (caught immediately).

The remaining 10% is integration points, infrastructure plumbing, and edge cases that are genuinely hard to test. That's fine. The 90% is what turns chaos into a ratchet.

Getting to 90% used to be a heroic effort. Now it's a Tuesday. That's the game change.

## Proof of concept

I started both projects alone. They're not solo anymore.

**GStack** now has 37 contributors. v1.30 incorporated 21 community PRs in a single release. **GBrain** has 25 contributors. v0.31.1.1 landed 22 community fixes in one PR -- auth flow, schema bootstrapping, sync, privacy.

The ratchet is what makes this safe. Every external PR has to pass the existing test suite. A new contributor doesn't need to understand the whole system. They need to make the tests pass.

Last week's GBrain releases tell the story:
- **v0.31.0**: a new facts table for real-time memory, plus a dream consolidation phase that promotes short-term memories into long-term knowledge
- **v0.31.1**: fixed 25 CLI commands that were silently routing to an empty local database instead of the user's actual brain
- **v0.31.1.1**: twenty-two community-reported fixes in one PR
- **v0.31.2**: fixed a code sync that hung forever on large repos with symlinks by adding a 30-second timeout

Each release shipped with more tests than the last. The agent writes the tests alongside the code. The coverage doesn't slip because the effort to maintain it is no longer a human burden.

## The new complexity ceiling

The complexity ceiling for software just got a lot higher.

It used to be bounded by one team's ability to hold the system in their heads. Now it's bounded by one person plus agents who can load the full codebase, schema history, test suite, and documentation into context.

That's a much bigger number. And it keeps growing as context windows get larger and models get better at reasoning about code.

Every software company that doesn't adopt this model -- agents plus taste plus a test suite that only goes up -- is already shipping slower and with less quality than one person who has.

The tools are here. The code is open. Tests are the ratchet. 90% coverage, every PR, no exceptions.

For fifty years, 90% coverage was a luxury reserved for avionics and medical devices -- teams with the budget to throw human hours at the effort wall. AI agents demolished that wall. The coverage threshold that makes software reliable is no longer expensive. It's just a setting. The question isn't whether you can afford 90%. It's whether you can afford not to.

The ratchet, the skills, and the whole knowledge system are open source and free on GitHub. Go build.

My MIT-licensed open source projects:
- GStack — makes Claude Code dramatically better. 93K stars. Free.
- GBrain — your second brain for AI agents. 14K stars. Free.
