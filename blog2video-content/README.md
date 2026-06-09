# blog2video-content — agent-native CLI

A stable, machine-readable CLI contract over the Blog2Video production worker, for
the **Hermes** orchestrator. Hermes calls these verbs; it does **not** need to
understand this repo's internals.

```
bin/blog2video-content <verb> [--flags]
# or
node blog2video-content/cli.mjs <verb> [--flags]
# or
npm run b2v -- <verb> [--flags]
```

## Design boundaries (load-bearing)

- **Never bypass the human review checkpoint.** `script --review-only` stops
  before rendering; `render` refuses without a matching human approval.
- **`render` is hard-gated** on `--approved-hash == review_hash`. A stale
  approval (content changed since sign-off) is rejected with `stale_approval`.
- **No auto-publish.** `package` builds a local manifest only; it never uploads
  to Drive / WeChat / X / Xiaohongshu and never pushes git.
- **No central ledger writes.** State lives in a CLI-owned file ledger
  (`<output-dir>/.b2v-task.json`), never the Hermes SQLite ledger.
- **No implicit LLM.** Narration is produced by the Claude Code skill. The CLI
  only *packetizes* existing narration. `--generate` is an explicit, opt-in
  extension point (see below).

## Verbs

| Verb | Purpose | Renders? | LLM? |
|------|---------|----------|------|
| `assess` | Heuristic: is this source video-worthy? | no | no |
| `script --review-only` | Build content-hashed review packet from narration | no | no* |
| `revise-script` | Record human feedback; invalidate prior approval | no | no |
| `render` | Render MP4 — only with a matching approved hash | **yes (gated)** | no |
| `package` | Build `meta.json` + delivery manifest (no upload) | no | no |

\* unless `--generate` is passed and `B2V_GENERATOR_CMD` is set.

### `assess`
Pure heuristic on source markdown (length, sections, code blocks, references,
lists). No writes, no LLM — keeps the video-worthiness judgment inside this repo
instead of Hermes.
```
bin/blog2video-content assess --source path/to/source.md [--threshold 50]
```
`data`: `{ verdict: "video_worthy"|"skip", score, threshold, signals, est_minutes, reasons }`

### `script --review-only`
Establishes the task workspace (`blog2video-output/<slug>/`), copies the source,
and packetizes **existing** narration into a review packet, then stops.
```
bin/blog2video-content script --review-only --source src.md --slug my-slug \
  [--narration narration.md] [--output-dir DIR] [--generate] [--force]
```
- Narration resolution order: `--narration` → existing `<dir>/narration.md` →
  (only if `--generate` **and** `B2V_GENERATOR_CMD` set) configured generator.
- If no narration exists → `ok:false`, `errors:["narration_missing"]`,
  `state:"needs_script"`, and `data.next_action` tells you to run the Claude
  skill `/blog2video-script <output-dir>` first.
- On success: writes `review_packet.json` + `review_packet.md`, sets
  `state:"awaiting_review"`, and returns `data.review_hash` (the approval token).

### `revise-script`
Records human feedback, bumps the revision, and **invalidates the prior
`review_hash`** so any in-flight approval is rejected.
```
bin/blog2video-content revise-script --task b2v_xxx --feedback "开头更口语化" \
  [--narration revised.md]
```
- Without `--narration`: `state:"needs_script"` — regenerate via the Claude skill
  incorporating feedback, then re-run `script --review-only`.
- With `--narration`: re-packets immediately, back to `awaiting_review`.

### `render` (human-gated)
```
bin/blog2video-content render --task b2v_xxx --approved-hash <review_hash> \
  [--dry-run] [--video N] [--force]
```
- Refuses unless `--approved-hash == current review_hash`:
  - no packet yet → `errors:["not_reviewed"]`
  - hash mismatch → `errors:["stale_approval"]` with `expected`/`got`
- `--dry-run`: validates the gate, renders nothing (`data.would_render`).
- On pass: shells to `blog2video-remotion/scripts/render-all.mjs <output-dir>`.
- Idempotent: re-running with the same approved hash and an existing MP4 skips
  (warning `already_rendered`) unless `--force`.

### `package` (no upload)
```
bin/blog2video-content package --task b2v_xxx [--dry-run] [--force]
```
- Writes `meta.json` if missing (**never** `title`/`description`/`tags` — those
  are generated server-side by Claudiny) and `package_manifest.json` applying the
  authoritative delivery exclusion list from `CLAUDE.md`.
- `data.ready_for_delivery` is true only when MP4s and cover photos are present.
- Distribution stays human-gated — this verb prints the `upload_command` but
  never runs it.

## JSON output shape

Every verb prints exactly one envelope on **stdout** (human logs → stderr):
```json
{
  "contract_version": "1.0",
  "ok": true,
  "verb": "script",
  "task_id": "b2v_1899fd4dcc6ed134",
  "artifacts": [{ "name": "...", "path": "...", "role": "...", "exists": true, "content_hash": "..." }],
  "content_hash": "ba27dd03f6754fd7",
  "warnings": [],
  "errors": [],
  "data": { "state": "awaiting_review", "review_hash": "ba27dd03f6754fd7", "output_dir": "..." }
}
```
`content_hash` is the verb's primary version anchor: source hash (`assess`),
review hash (`script`/`revise-script`), approved hash (`render`), delivery-set
hash (`package`). Review packets are content-versioned via `review_hash`, so
Hermes can reject stale approvals.

## Exit codes

| Code | Meaning |
|------|---------|
| `0` | `ok:true` |
| `1` | `ok:false` — gate refusal / business error (`narration_missing`, `stale_approval`, `not_reviewed`, render failure) |
| `2` | usage / argument error (missing/invalid flags, unknown verb) |
| `3` | unexpected exception (envelope still emitted) |

## Idempotency

- `assess` — pure: same input → same output.
- `script --review-only` — unchanged content + existing packet → no rewrite
  (warning `unchanged`).
- `revise-script` — identical feedback as last entry → no-op (warning `unchanged`).
- `render` — same approved hash + existing MP4 → skip (warning `already_rendered`).
- `package` — deterministic manifest; reuses existing `meta.json` unless `--force`.

## Dry-run

`render --dry-run` and `package --dry-run` validate gates / compute results
without side effects (no render, no file writes).

## How Hermes should call this CLI

```
1. assess           → if verdict != video_worthy, stop.
2. (Claude skill)   → /blog2video-script produces narration.md   # expensive LLM, run explicitly
3. script --review-only --source S --slug SLUG
                    → capture data.review_hash, send review_packet.md to human.
4a. human approves  → render --task T --approved-hash <review_hash>
4b. human edits     → revise-script --task T --feedback "...";
                      regenerate narration via Claude skill; back to step 3.
5. package --task T → hand package_manifest.json to the human for distribution.
```
Hermes persists `task_id` + the `review_hash` it showed the human. Passing that
hash to `render` is the approval. If the content changed in between, the hash no
longer matches and `render` refuses — no stale renders.

## Smoke checks
```
bash blog2video-content/smoke.sh   # 14 assertions across all verbs + gates
```
