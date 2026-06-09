#!/usr/bin/env bash
# Smoke checks for the blog2video-content CLI contract.
# Runs every verb against a throwaway fixture and asserts the gate behavior.
# Usage: bash blog2video-content/smoke.sh
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLI="node $ROOT/blog2video-content/cli.mjs"
TMP="$(mktemp -d)"
SLUG="b2v-smoke-fixture"
OUT="$ROOT/blog2video-output/$SLUG"
trap 'rm -rf "$TMP"; rm -rf "$OUT"' EXIT

pass=0; fail=0
check() { # check <label> <jq-expr-expected-true> <json>
  if echo "$3" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);process.exit($2?0:1)})" 2>/dev/null; then
    echo "  PASS: $1"; pass=$((pass+1))
  else
    echo "  FAIL: $1"; echo "$3" | head -20; fail=$((fail+1))
  fi
}
# helper predicate uses `j` as the parsed object
j() { node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);console.log(j.$1)})"; }

# Fixture source
cat > "$TMP/source.md" <<'MD'
# Building Agent Harnesses

A long-running agent needs a harness. Here is why it matters and how to build one.

## Why
Agents drift without structure. We use a ledger and a review gate.

## How
```js
const x = 1;
```

- step one
- step two
- step three

See [the docs](https://example.com) for more.
MD

echo "== 1. assess (expect video_worthy) =="
R=$($CLI assess --source "$TMP/source.md")
check "assess ok"            "j.ok===true" "$R"
check "assess video_worthy"  "j.data.verdict==='video_worthy'" "$R"
check "has contract_version" "j.contract_version==='1.0'" "$R"

echo "== 2. script --review-only WITHOUT narration (expect ok:false needs_script) =="
R=$($CLI script --review-only --source "$TMP/source.md" --slug "$SLUG")
check "script blocked"       "j.ok===false && j.errors[0]==='narration_missing'" "$R"
check "state needs_script"   "j.data.state==='needs_script'" "$R"

echo "== 3. provide narration, build packet =="
cat > "$TMP/narration.md" <<'MD'
# 大家好

今天我们聊聊长时间运行的智能体需要什么样的脚手架。这个话题很有意思，因为很多人忽略了结构的重要性。我会从原理讲到实践，带你一步步理解。
MD
R=$($CLI script --review-only --source "$TMP/source.md" --slug "$SLUG" --narration "$TMP/narration.md")
check "script ok"            "j.ok===true" "$R"
check "awaiting_review"      "j.data.state==='awaiting_review'" "$R"
RH=$(echo "$R" | j data.review_hash)
echo "  review_hash=$RH"

echo "== 4. render with WRONG hash (expect stale_approval) =="
R=$($CLI render --slug "$SLUG" --approved-hash deadbeef)
check "stale rejected"       "j.ok===false && j.errors[0]==='stale_approval'" "$R"

echo "== 5. render --dry-run with correct hash (gate passes, no render) =="
R=$($CLI render --slug "$SLUG" --approved-hash "$RH" --dry-run)
check "dry-run passes gate"  "j.ok===true && j.data.would_render===true" "$R"

echo "== 6. revise-script invalidates approval =="
R=$($CLI revise-script --slug "$SLUG" --feedback "开头再口语化一点")
check "revise ok"            "j.ok===true" "$R"
check "needs_script again"   "j.data.state==='needs_script'" "$R"
R=$($CLI render --slug "$SLUG" --approved-hash "$RH" --dry-run)
check "old hash now stale"   "j.ok===false && j.errors[0]==='not_reviewed'" "$R"

echo "== 7. package --dry-run (no upload, builds manifest in-memory) =="
$CLI script --review-only --source "$TMP/source.md" --slug "$SLUG" --narration "$TMP/narration.md" >/dev/null
R=$($CLI package --slug "$SLUG" --dry-run)
check "package ok"           "j.ok===true" "$R"
check "dry_run true"         "j.data.dry_run===true" "$R"

echo
echo "RESULT: $pass passed, $fail failed"
[ "$fail" -eq 0 ]
