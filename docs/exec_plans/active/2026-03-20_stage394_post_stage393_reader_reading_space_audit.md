# ExecPlan: Stage 394 Post-Stage-393 Reader Reading-Space Audit

## Summary
- Audit the Stage 393 original-only Reader reset against the current Recall reading benchmark direction.
- Judge original-only `Reader` first on wide desktop, then verify `Home` and `Graph` as regression surfaces.
- Generated-content `Reader` views remain out of scope for this track and must not be used in the audit evidence.

## Audit Scope
- Wide desktop captures first:
  - original-only `Reader`
  - `Home`
  - `Graph`
- Supporting Reader crops:
  - compressed top seam
  - article-lane start
  - attached dock shell
  - one dock tab state if needed to prove the sidecar still works cleanly
- Focused regressions second:
  - original-only focused/narrow Reader only if needed to confirm the shared Reader shell stayed coherent

## Acceptance
- The audit states clearly whether Stage 393 moved original-only `Reader` closer to Recall’s current reading direction.
- The audit records whether `Home` and `Graph` remained visually stable behind the Reader reset.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 393/394 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
