# ExecPlan: Stage 406 Post-Stage-405 Home Tag-Tree Control Surface Audit

## Summary
- Audit the Stage 405 `Home` tag-tree control-surface reset against the current Recall library direction.
- Judge `Home` first on wide desktop, then verify `Graph` and original-only `Reader` as regression surfaces.
- Generated-content `Reader` views remain out of scope and must not be used in the audit evidence.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting Home crops:
  - organizer rail
  - selected-group board
  - pinned reopen shelf
  - primary-flow crop showing the slimmer board header and earlier card-field start
- Focused regressions second:
  - only if needed to confirm the shared shell stayed coherent

## Acceptance
- The audit states clearly whether Stage 405 moved `Home` closer to Recall's current tag-tree-driven homepage direction.
- The audit records whether `Graph` and original-only `Reader` remained visually stable behind the Home reset.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 405/406 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
