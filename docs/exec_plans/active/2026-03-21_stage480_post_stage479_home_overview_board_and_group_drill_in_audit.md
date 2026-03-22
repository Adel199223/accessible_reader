# ExecPlan: Stage 480 Post-Stage-479 Home Overview Board And Group Drill-In Audit

## Summary
- Audit the Stage 479 `Home` overview-board reset against Recall's current organizer-led homepage direction.
- Judge whether the organizer now behaves more like a left-side filter tree that drives the right-side card workspace, rather than just decorating a preselected collection board.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - organizer overview/reset row
  - grouped overview workspace on the right
  - focused single-branch drill-in state
  - organizer-hidden compact-controls fallback

## Acceptance
- The audit states clearly whether Stage 479 materially reduced the remaining mismatch between Recall's current organizer-home benchmark and our local Home browsing model.
- The audit records whether the right side now begins as a broader grouped workspace instead of defaulting to one branch board.
- The audit records whether focused branch drill-in still feels coherent after the overview reset.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 479/480 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
