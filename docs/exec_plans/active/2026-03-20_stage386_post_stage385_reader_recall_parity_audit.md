# ExecPlan: Stage 386 Post-Stage-385 Reader Recall-Parity Audit

## Summary
- Audit the Stage 385 original-only `Reader` reset against the current Recall benchmark direction.
- Judge original-only `Reader` first on wide desktop, then verify `Graph` and `Home` as regression surfaces.
- Generated-content `Reader` views remain out of scope for this track and must not be used in the audit evidence.

## Audit Scope
- Wide desktop captures first:
  - original-only `Reader`
  - `Graph`
  - `Home`
- Supporting Reader crops:
  - compressed top seam
  - dominant article lane
  - attached support dock with source-library and notes presence
- Focused regressions second:
  - original-only focused Reader view if needed to confirm no shared-shell regression

## Acceptance
- The audit states clearly whether Stage 385 moved original-only `Reader` closer to Recall’s reading-first, notebook-adjacent direction.
- The audit records whether `Graph` and `Home` remained visually stable behind the Reader pass.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 385/386 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
