# ExecPlan: Stage 468 Post-Stage-467 Home Organizer Sorting And Board View Audit

## Summary
- Audit the Stage 467 `Home` organizer-control reset against Recall's current organization model.
- Judge `Home` first on wide desktop, then verify `Graph` and original-only `Reader` as regression surfaces.
- Generated-content `Reader` views remain out of scope and must not be used in the audit evidence.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting Home crops:
  - wide top
  - organizer control deck
  - list-view state
  - filtered-results state
  - organizer-hidden compact-control state

## Acceptance
- The audit states clearly whether Stage 467 moved `Home` closer to Recall's current organizer-led control and board-view direction.
- The audit records whether the organizer now reads more like a true organization panel with richer sort behavior instead of a thin filter strip.
- The audit records whether list/board switching and richer sorting materially change the working board while keeping reopen continuity and search in the same Home workspace.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 467/468 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
