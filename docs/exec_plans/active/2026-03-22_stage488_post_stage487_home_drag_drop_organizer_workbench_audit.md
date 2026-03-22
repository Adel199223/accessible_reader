# ExecPlan: Stage 488 Post-Stage-487 Home Drag-Drop Organizer Workbench Audit

## Summary
- Audit the Stage 487 `Home` organizer-interaction reset against Recall's current organization direction.
- Judge whether manual mode now feels like direct manipulation instead of a button-driven reorder utility.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - default grouped-overview state
  - manual-mode organizer with drag handles visible
  - post-drag reordered organizer state
  - organizer selection bar with batch move actions visible

## Acceptance
- The audit states clearly whether Stage 487 materially reduced the remaining mismatch between Recall's current Home benchmark and our local organizer workflow.
- The audit records whether drag-and-drop now makes organizer ordering feel believable and direct.
- The audit records whether the organizer selection bar behaves like a real batch-action rail instead of mostly a status strip.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 487/488 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
