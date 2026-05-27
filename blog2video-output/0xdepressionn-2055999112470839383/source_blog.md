# Karpathy's CLAUDE.md hit #1 on GitHub with 82,000 stars. Most devs still haven't read it.

A file named CLAUDE.md hit #1 on GitHub Trending. 82,000 stars. 7,800 forks.

It started with Andrej Karpathy. Former Director of AI at Tesla. Founding member of OpenAI. He identified 4 behaviors that make Claude Code fail and wrote them down in a single file.

A developer took those 4 rules, expanded them, published the file. It went viral.

The reason: coding accuracy went from 65% to 94%.

Most developers using Claude Code daily have never set this up. They're starting from zero every session. Re-explaining the same context. Cleaning up unwanted scope changes. Reverting refactors nobody asked for.

This is the full file.

![CLAUDE.md viral file overview](images/image_1.jpg)

## The setup most devs missed

Every time you open Claude Code, it starts with nothing.

It doesn't know your stack. Your standards. Your project context. What you've already tried. What you explicitly decided not to do three sessions ago.

So it guesses. And when it guesses, it refactors code you didn't ask it to touch. It suggests frameworks that break your existing architecture. It deletes files without asking. It contradicts decisions you already made.

CLAUDE.md is a plain text file you place in your project root. Claude Code reads it automatically at the start of every session.

One setup. Zero repeated explanations. Three categories of expensive mistakes fixed.

## 1 / 3 | DEFAULTS: $375/week you're spending to repeat yourself

The average developer spends 30 minutes per day re-explaining context to Claude.

Stack. Coding standards. Project background. What's already been tried. None of it persists between sessions unless you write it down once and let Claude read it every time.

30 minutes per day at $150/hour developer rate: $375/week. Per developer.

For a team of 5: $1,875/week gone.

![Defaults section cost breakdown](images/image_2.jpg)

These 7 rules go at the top of your CLAUDE.md file.

**Kill the filler:** Never open responses with filler phrases like "Great question!", "Of course!", "Certainly!", or similar warmups. Start every response with the actual answer. No preamble, no acknowledgment of the question.

**Match length to the task:** Match response length to task complexity. Simple questions get direct, short answers. Complex tasks get full, detailed responses. Never pad responses with restatements of the question or closing sentences that repeat what you just said.

**Show options before acting:** Before any significant task, show me 2-3 ways you could approach this work. Wait for me to choose before proceeding.

**Admit uncertainty before it costs me:** If you are uncertain about any fact, statistic, date, or piece of technical information: say so explicitly before including it. Never fill gaps in your knowledge with plausible-sounding information.

**Who I am and what I know:** About me: [Name] / Role / Background / Strong in / Still learning. Adjust the depth of every response to match this. Never over-explain what I already know. Never skip context I need.

**Current project context:** What I'm working on / Goal / Audience / Stack constraints / What to avoid. Apply this context to every task.

**Lock your voice:** My writing style — always match this. Sentence length, words I use, words I never use, format. When writing anything on my behalf, match this exactly. Do not default to your own patterns.

> Time spent re-explaining context per day: 30 min. At $150/hour developer rate: $75/day. Per week: $375/week per developer. Team of 5: $1,875/week. CLAUDE.md setup for this section: 45 minutes total.

**Mistake to avoid:** Don't write your CLAUDE.md from scratch. Use this prompt first, then edit the output: "Based on what I've told you about myself, my project, and how I want to work: write me a complete CLAUDE.md file. Be specific. Plain text. Under 500 words."

## 2 / 3 | BEHAVIOR: the $150/hour changes you didn't authorize

You ask Claude to fix one function.

It refactors three files, renames your variables, reorganizes imports, and rewrites comments you spent time crafting. All without asking.

1 hour to review and revert unwanted changes: $150. Three times a week: $450/week. Per developer.

For a team of 5: $2,250/week spent cleaning up changes nobody authorized.

![Behavior section cost breakdown](images/image_3.jpg)

These 7 rules go in the behavior section of your CLAUDE.md.

**Stay in scope:** Only modify files, functions, and lines of code directly related to the current task. Do not refactor, rename, reorganize, reformat, or "improve" anything I did not explicitly ask you to change. If you notice something worth fixing elsewhere, mention it in a note at the end. Do not touch it. Ever.

**Ask before big changes:** Before making any change that significantly alters content I've already created: stop. Describe exactly what you're about to change and why. Wait for my confirmation before proceeding.

**Confirm before anything destructive:** Before deleting any file, overwriting existing code, dropping database records, or removing dependencies: stop. List exactly what will be affected. Ask for explicit confirmation. Only proceed after I say yes in the current message. "You mentioned this earlier" is not confirmation.

**Hard stops for production:** The following require explicit in-session confirmation, no exceptions: deploying or pushing to any environment, running migrations or schema changes, sending any external API call, executing any command with irreversible side effects.

**Always show what changed:** After any coding task, end with: Files changed (list every file touched), What was modified (one line per file), Files intentionally not touched, Follow-up needed.

**Never act without explicit confirmation:** Never send, post, publish, share, or schedule anything on my behalf without my explicit confirmation in the current message.

**Think before you write code:** For any task involving architecture decisions, debugging complex issues, or non-trivial features: work through the problem step by step before writing any code. Show your reasoning. Identify where you're uncertain. Then implement.

> 1 hour/week reverting unwanted scope changes: $150/week. 30 min/week doing manual diffs after each task: $75/week. Total behavior-related waste per developer: $225/week. Team of 5: $1,125/week. CLAUDE.md behavior section setup: 30 minutes.

## 3 / 3 | MEMORY + STACK: the setup that makes Claude Code actually reliable

Claude forgets everything between sessions.

Every decision you made. Every approach that failed. The reason you chose Prisma over Drizzle six months ago. The constraint that exists because of a specific client requirement.

It forgets. Then it suggests exactly what you already ruled out.

This section gives Claude the closest thing to real memory that currently exists. And locks your tech stack so it stops proposing tools that break your existing architecture.

![Memory and stack section cost breakdown](images/image_4.jpg)

**MEMORY.md decision log:** Maintain a file called MEMORY.md in this project. After any significant decision, add an entry: What was decided / Why / What was rejected and why. Read MEMORY.md at the start of every session. Never contradict a logged decision without flagging it first.

**Session end summary:** When I say "session end", "wrapping up", or "let's stop here": write a session summary to MEMORY.md. Include: Worked on / Completed / In progress / Decisions made / Next session priorities.

**ERRORS.md failure log:** Maintain a file called ERRORS.md. When an approach takes more than 2 attempts to work, log it: What didn't work / What worked instead / Note for next time. Check ERRORS.md before suggesting approaches to similar tasks.

**Permanent facts list:** These facts are always true for this project. Apply them to every session without exception. If any task conflicts with one of these, flag it before proceeding.

**Lock your tech stack:** Tech stack for this project. Always use these. Never suggest alternatives unless I ask: Language, Framework, Package manager, Database, Testing, Styling. If something seems like the wrong tool, flag it. But use the defined stack unless I explicitly say otherwise.

**Extended Thinking for hard decisions:** For questions involving system architecture, performance tradeoffs, database design, or long-term technical decisions: use extended thinking mode. Work through the problem step by step. Surface tradeoffs I haven't considered. Flag assumptions that might not hold at scale. Then give your recommendation.

**The 4 rules that went viral:** Karpathy identified 4 behaviors that make Claude Code fail. A developer distilled them into these 4 lines. Coding accuracy went from 65% to 94%.

1. **Ask, don't assume.** If something is unclear, ask before writing a single line. Never make silent assumptions about intent, architecture, or requirements.
2. **Simplest solution first.** Always implement the simplest thing that could work. Do not add abstractions or flexibility that weren't explicitly requested.
3. **Don't touch unrelated code.** If a file or function is not directly part of the current task, do not modify it, even if you think it could be improved.
4. **Flag uncertainty explicitly.** If you are not confident about an approach or technical detail, say so before proceeding. Confidence without certainty causes more damage than admitting a gap.

> 2 hours/week recovering from forgotten decisions and wrong suggestions: $300/week per dev. Wrong stack recommendations and incompatible tools: $75/week. Total memory-related waste per developer: $375/week. Team of 5: $1,875/week. MEMORY.md + ERRORS.md + stack setup: 20 minutes.

## CONCLUSION

Here's the full math.

> $375/week re-explaining context every session. $225/week reverting unauthorized changes. $375/week recovering from forgotten decisions. Total waste per developer: $975/week.

> Team of 5 developers: $4,875/week. Per year: $253,500.

> CLAUDE.md setup: 2 hours total. Karpathy's 4 rules alone: 65% to 94% coding accuracy.

One plain text file. 21 rules. Two hours of work.

The developers who set this up are working with a version of Claude that remembers decisions, stays in scope, confirms before destroying anything, never suggests a framework that breaks your architecture.

The ones who haven't are spending $975/week to repeat themselves.

![Total cost summary](images/image_5.jpg)

P.S. Start with Karpathy's 4 rules. Just those 4. Paste them into a new file called CLAUDE.md in your project root right now. It takes 2 minutes. Add the rest one week at a time as you notice what's missing.
