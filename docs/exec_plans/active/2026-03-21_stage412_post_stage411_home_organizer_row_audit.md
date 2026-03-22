# ExecPlan: Stage 412 Post-Stage-411 Home Organizer-Row Audit

## Summary
- Audit the Stage 411 `Home` organizer-row flattening against the current Recall library direction.
- Judge `Home` first on wide desktop, then verify `Graph` and original-only `Reader` as regression surfaces.
- Generated-content `Reader` views remain out of scope and must not be used in the audit evidence.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting Home crops:
  - top control seam
  - organizer rail
  - focused organizer-row crop showing the flatter group rhythm and lighter preview children
  - primary-flow crop
  - pinned reopen shelf
- Focused regressions second:
  - only if needed to confirm the shared shell stayed coherent

## Acceptance
- The audit states clearly whether Stage 411 moved `Home` closer to Recall's current lean, tag-list-driven homepage direction.
- The audit records whether `Graph` and original-only `Reader` remained visually stable behind the Home row reset.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 411/412 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
