# Introducing Routines in Claude Code

Anthropic has launched routines in Claude Code (research preview). A routine is a saved Claude Code configuration — a prompt, one or more repositories, and a set of connectors — packaged once and run automatically. Routines execute on Anthropic-managed cloud infrastructure, so they keep working when your laptop is closed.

Each routine can have one or more triggers attached to it:

- **Scheduled** — run on a recurring cadence like hourly, nightly, or weekly
- **API** — trigger on demand by sending an HTTP POST to a per-routine endpoint with a bearer token
- **GitHub** — run automatically in response to repository events such as pull requests or releases

A single routine can combine triggers. For example, a PR review routine can run nightly, trigger from a deploy script, and also react to every new PR.

Routines are available on Pro, Max, Team, and Enterprise plans with Claude Code on the web enabled. Create and manage them at claude.ai/code/routines, or from the CLI with `/schedule`.

## Example Use Cases

Each example pairs a trigger type with the kind of work routines are suited to: unattended, repeatable, and tied to a clear outcome.

**Backlog maintenance.** A schedule trigger runs every weeknight against your issue tracker via a connector. The routine reads issues opened since the last run, applies labels, assigns owners based on the area of code referenced, and posts a summary to Slack so the team starts the day with a groomed queue.

**Alert triage.** Your monitoring tool calls the routine's API endpoint when an error threshold is crossed, passing the alert body as `text`. The routine pulls the stack trace, correlates it with recent commits in the repository, and opens a draft pull request with a proposed fix and a link back to the alert. On-call reviews the PR instead of starting from a blank terminal.

**Bespoke code review.** A GitHub trigger runs on `pull_request.opened`. The routine applies your team's own review checklist, leaves inline comments for security, performance, and style issues, and adds a summary comment so human reviewers can focus on design instead of mechanical checks.

**Deploy verification.** Your CD pipeline calls the routine's API endpoint after each production deploy. The routine runs smoke checks against the new build, scans error logs for regressions, and posts a go or no-go to the release channel before the deploy window closes.

**Docs drift.** A schedule trigger runs weekly. The routine scans merged PRs since the last run, flags documentation that references changed APIs, and opens update PRs against the docs repository for an editor to review.

**Library port.** A GitHub trigger runs on `pull_request.closed` filtered to merged PRs in one SDK repository. The routine ports the change to a parallel SDK in another language and opens a matching PR, keeping the two libraries in step without a human re-implementing each change.

## Creating a Routine

Create a routine from the web, the Desktop app, or the CLI. All three surfaces write to the same cloud account, so a routine you create in the CLI shows up at claude.ai/code/routines immediately. In the Desktop app, click **New task** and choose **New remote task**; choosing **New local task** instead creates a local Desktop scheduled task, which runs on your machine and is not a routine.

Routines run autonomously as full Claude Code cloud sessions: there is no permission-mode picker and no approval prompts during a run. The session can run shell commands, use skills committed to the cloned repository, and call any connectors you include. What a routine can reach is determined by the repositories you select and their branch-push setting, the environment's network access and variables, and the connectors you include. Scope each of those to what the routine actually needs.

Routines belong to your individual claude.ai account. They are not shared with teammates, and they count against your account's daily run allowance. Anything a routine does through your connected GitHub identity or connectors appears as you: commits and pull requests carry your GitHub user, and Slack messages, Linear tickets, or other connector actions use your linked accounts for those services.

### Create from the Web

1. **Open the creation form**: Visit claude.ai/code/routines and click **New routine**.

2. **Name the routine and write the prompt**: Give the routine a descriptive name and write the prompt Claude runs each time. The prompt is the most important part: the routine runs autonomously, so the prompt must be self-contained and explicit about what to do and what success looks like. The prompt input includes a model selector. Claude uses the selected model on every run.

3. **Select repositories**: Add one or more GitHub repositories for Claude to work in. Each repository is cloned at the start of a run, starting from the default branch. Claude creates `claude/`-prefixed branches for its changes. To allow pushes to any branch, enable **Allow unrestricted branch pushes** for that repository.

4. **Select an environment**: Pick a cloud environment for the routine. Environments control what the cloud session has access to:
   - **Network access**: set the level of internet access available during each run
   - **Environment variables**: provide API keys, tokens, or other secrets Claude can use
   - **Setup script**: run install commands before each session starts, like installing dependencies or configuring tools

   A **Default** environment is provided. To use a custom environment, create one before creating the routine.

5. **Select a trigger**: Under **Select a trigger**, choose how the routine starts. You can pick one trigger type or combine several.
   - **Schedule**: Pick a preset frequency — hourly, daily, weekdays, or weekly.
   - **GitHub event**: Select the repository, the event to react to, and optional filters.
   - **API**: Select API here, then save the routine. The URL and token are generated after the routine is saved.

6. **Review connectors**: All of your connected MCP connectors are included by default. Remove any that the routine doesn't need. Connectors give Claude access to external services like Slack, Linear, or Google Drive during each run.

7. **Create the routine**: Click **Create**. The routine appears in the list and runs the next time one of its triggers matches. To start a run immediately, click **Run now** on the routine's detail page.

### Create from the CLI

Run `/schedule` in any session to create a scheduled routine conversationally. You can also pass a description directly, as in `/schedule daily PR review at 9am`. Claude walks through the same information the web form collects, then saves the routine to your account.

`/schedule` in the CLI creates scheduled routines only. To add an API or GitHub trigger, edit the routine on the web at claude.ai/code/routines.

The CLI also supports managing existing routines. Run `/schedule list` to see all routines, `/schedule update` to change one, or `/schedule run` to trigger it immediately.

## Configure Triggers

A routine starts when one of its triggers matches. You can attach any combination of schedule, API, and GitHub triggers to the same routine, and add or remove them at any time.

### Schedule Trigger

A schedule trigger runs the routine on a recurring cadence. Pick a preset frequency: hourly, daily, weekdays, or weekly. Times are entered in your local zone and converted automatically, so the routine runs at that wall-clock time regardless of where the cloud infrastructure is located.

Runs may start a few minutes after the scheduled time due to stagger. The offset is consistent for each routine.

For a custom interval such as every two hours or the first of each month, pick the closest preset in the form, then run `/schedule update` in the CLI to set a specific cron expression. The minimum interval is one hour; expressions that run more frequently are rejected.

### API Trigger

An API trigger gives a routine a dedicated HTTP endpoint. POSTing to the endpoint with the routine's bearer token starts a new session and returns a session URL. Use this to wire Claude Code into alerting systems, deploy pipelines, internal tools, or anywhere you can make an authenticated HTTP request.

To trigger a routine via API:

```bash
curl -X POST https://api.anthropic.com/v1/claude_code/routines/trig_01ABCDEFGHJKLMNOPQRSTUVW/fire \
  -H "Authorization: Bearer sk-ant-oat01-xxxxx" \
  -H "anthropic-beta: experimental-cc-routine-2026-04-01" \
  -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{"text": "Sentry alert SEN-4521 fired in prod. Stack trace attached."}'
```

A successful request returns:

```json
{
  "type": "routine_fire",
  "claude_code_session_id": "session_01HJKLMNOPQRSTUVWXYZ",
  "claude_code_session_url": "https://claude.ai/code/session_01HJKLMNOPQRSTUVWXYZ"
}
```

Each routine has its own token, scoped to triggering that routine only. To rotate or revoke it, return to the same modal and click **Regenerate** or **Revoke**.

### GitHub Trigger

A GitHub trigger starts a new session automatically when a matching event occurs on a connected repository. Each matching event starts its own session.

GitHub triggers can subscribe to:

| Event        | Triggers when                                                                 |
| :----------- | :---------------------------------------------------------------------------- |
| Pull request | A PR is opened, closed, assigned, labeled, synchronized, or otherwise updated |
| Release      | A release is created, published, edited, or deleted                           |

#### Filtering Pull Requests

Use filters to narrow which pull requests start a new session. All filter conditions must match.

| Filter      | Matches                          |
| :---------- | :------------------------------- |
| Author      | PR author's GitHub username      |
| Title       | PR title text                    |
| Body        | PR description text              |
| Base branch | Branch the PR targets            |
| Head branch | Branch the PR comes from         |
| Labels      | Labels applied to the PR         |
| Is draft    | Whether the PR is in draft state |
| Is merged   | Whether the PR has been merged   |
| From fork   | Whether the PR comes from a fork |

Example filter combinations:

- **Auth module review**: base branch `main`, head branch contains `auth-provider`.
- **External contributor triage**: from fork is `true`.
- **Ready-for-review only**: is draft is `false`.
- **Label-gated backport**: labels include `needs-backport`.

Each matching GitHub event starts a new session. Session reuse across events is not available.

## Managing Routines

Click a routine in the list to open its detail page showing repositories, connectors, prompt, schedule, API tokens, GitHub triggers, and past runs.

### View and Interact with Runs

Click any run to open it as a full session. From there you can see what Claude did, review changes, create a pull request, or continue the conversation.

### Edit and Control Routines

- Click **Run now** to start a run immediately
- Use the toggle to pause or resume the schedule
- Click the pencil icon to edit name, prompt, repositories, environment, connectors, or triggers
- Click the delete icon to remove the routine (past sessions remain)

### Repositories and Branch Permissions

Each repository is cloned on every run. Claude starts from the default branch. By default, Claude can only push to branches prefixed with `claude/`. Enable **Allow unrestricted branch pushes** to remove this restriction.

### Connectors

Routines can use connected MCP connectors to read from and write to external services. All connectors are included by default; remove any that aren't needed.

### Environments

Each routine runs in a cloud environment controlling network access, environment variables, and setup scripts.

## Usage and Limits

Routines draw down subscription usage the same way interactive sessions do. Daily caps:

| Plan              | Daily routine runs |
| :---------------- | :----------------- |
| Pro               | 5                  |
| Max               | 15                 |
| Team / Enterprise | 25                 |

When a routine hits the daily cap or subscription usage limit, organizations with extra usage enabled can keep running routines on metered overage.
