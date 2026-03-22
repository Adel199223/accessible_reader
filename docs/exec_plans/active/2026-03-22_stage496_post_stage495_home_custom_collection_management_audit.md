# ExecPlan: Stage 496 Post-Stage-495 Home Custom Collection Management Audit

## Summary
- Audit the Stage 495 `Home` custom-collection reset against Recall's current organizer and tagging direction.
- Confirm that the new organizer behavior reads like a real collection-management workbench instead of a static browse tree.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - default collections overview
  - create-collection state
  - bulk assignment state
  - renamed custom collection selected in the board
  - explicit `Untagged` branch state

## Acceptance
- The audit states clearly whether Stage 495 materially reduced the remaining mismatch between Recall's current `Home` benchmark and our organizer workflow.
- The audit records whether custom collections now feel organizer-owned rather than decorative.
- The audit records whether bulk assignment and the `Untagged` path are discoverable in the organizer itself.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 495/496 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
