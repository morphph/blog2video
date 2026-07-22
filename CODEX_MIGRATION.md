# CODEX_MIGRATION.md — blog2video

## Locations
- **Old directory:** `/Users/yufanp/Desktop/Project/blog2video` (left untouched — not moved/renamed/deleted)
- **New directory:** `/Users/yufanp/Developer/blog2video`
- **GitHub:** https://github.com/morphph/blog2video.git
- **Branch:** `main`
- **Tip commit:** `d294153` (new clone tip == old repo `main` == `origin/main`, exact match)

## Clone method (why it differs from a plain `git clone`)
This repo carries ~300 MB of committed generated media under `blog2video-output/` (3,991 tracked files). A full clone exceeded the sandbox's per-command time budget, so the new clone was created as:
- `git clone --filter=blob:none --no-checkout` (blobless, full ref/history graph), then
- a sparse checkout of everything **except** `/blog2video-output/`.

Result: a valid, clean, pushable `main` clone (125 MB on disk) with all source/config materialized. The `blog2video-output/` artifacts remain fully tracked in git; to materialize them locally run:
```bash
git sparse-checkout disable
```
Nothing was removed from git history.

## Codex files created / modified
- **AGENTS.md** — extended with a "Codex Quick Reference" block: repository structure, setup & dev commands, lint/typecheck/test/build, safety constraints, and Definition of Done. Existing detailed pipeline docs preserved.
- **CODEX_MIGRATION.md** — this report.
- **.codex/hooks.json** — updated two stale `~/Desktop/Project/obsidian-vault-starter` paths to `~/Developer/obsidian-vault-starter`. (Content otherwise unchanged.)

## Old-path cleanup (git-tracked, execution-affecting only)
| File | Change |
|------|--------|
| `.claude/skills/blog2video/prompts/scene-generator.md` | `cd /Users/yufanp/Desktop/Project/blog2video` → `cd "$(git rev-parse --show-toplevel)"` (2 occurrences, repo-relative) |
| `.claude/skills/blog2video/prompts/script-writer-tutor.md` | Mac probe path `~/Desktop/Project/content-ops/...` → `~/Developer/content-ops/...` |
| `.codex/hooks.json` | see above |

**Deliberately NOT changed** (content/artifacts, not execution paths): `HANDOFF-*.md` notes, and the historical `blog2video-output/**/*.json` / `*.log` artifacts that embed old paths — these are generated records, per the migration rules.

## Claude Code capability analysis
- `.claude/commands/` — 7 slash commands (`/blog2video` and friends). Claude-Code specific; left intact for continued Claude Code use.
- `.claude/skills/blog2video/` — pipeline orchestration + per-stage prompt specs. Left intact.
- `.claude/settings.json`, `settings.local.json` — Claude Code settings; not migrated to Codex (tool-specific).
- `.codex/hooks.json` — uses **Claude-Code hook schema** (`PostToolUse`/`PreCompact`/`SessionStart`). OpenAI Codex does not consume this schema, so it is effectively inert for Codex today. It also contains a `PostToolUse` hook that runs `scripts/auto-deliver-ec2.sh` (a deploy) on every Bash call — **manual review recommended before enabling any hook runner.**
- General engineering rules from CLAUDE.md were distilled into AGENTS.md; the two files are kept in sync per the repo's own convention.

## Migrated
- Engineering conventions, pipeline architecture, delivery rules → already in AGENTS.md (kept), augmented with setup/validation/safety/DoD.
- Stale execution paths → repo-relative or new-location.

## Not migrated (and why)
- `.claude/` commands/skills/settings — Claude-Code-specific; kept for Claude Code, not duplicated into Codex config (no functional Codex equivalent needed).
- `.codex/hooks.json` deploy/session hooks — left as-is (only path-corrected); flagged for manual review, not activated.
- No `.codex/config.toml` was created — none is required for this repo; an empty/boilerplate one would add no value.

## Validation (safe, local, no external side effects)
| Check | Result |
|-------|--------|
| Clone integrity: `git status` | clean (`## main...origin/main`, no changes besides migration edits) |
| Tip SHA vs `origin/main` | `d294153` == `d294153` ✅ |
| Write/delete in new dir (EPERM probe) | create + delete succeed ✅ (no `Operation not permitted`) |
| Root `.js/.mjs` syntax (`node --check`) | OK (generate-covers.js/.mjs, regen-obsidian.js) |
| `npm install --ignore-scripts` (root deps) | OK |
| `npm run build` (`tsc` → dist) | **exit 0**, dist emitted ✅ |

Publishing/upload/scheduler commands were intentionally **not run** (external side effects): `publish:*`, `wechat:intake`, `watch`, `scheduler`, `login:*`, `sync-to-gdrive.sh`, `upload.sh`, `auto-deliver-ec2.sh`.

## TCC / EPERM status
- Old location (`~/Desktop/...`) reproduced the problem: `git fetch` there threw `unable to unlink '.git/objects/...': Operation not permitted`.
- New location (`~/Developer/blog2video`) is fully read/write/delete capable — **no TCC/EPERM risk observed.**

## Ready for Codex?
**Yes.** Source builds, repo is clean and synced, AGENTS.md is Codex-ready. Two manual notes: (1) run `npm install` (and `blog2video-remotion/ npm install`) on the Mac for full local dev; (2) review `.codex/hooks.json` before using any hook runner (it contains a deploy hook).
