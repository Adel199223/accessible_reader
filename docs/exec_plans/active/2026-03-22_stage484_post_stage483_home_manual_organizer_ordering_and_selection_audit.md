# ExecPlan: Stage 484 Post-Stage-483 Home Manual Organizer Ordering And Selection Audit

## Summary
- Audit the Stage 483 `Home` manual-organizer reset against Recall's current tag-tree workbench direction.
- Judge whether wide desktop `Home` now behaves more like an active organizer surface with custom ordering and desktop selection instead of a well-styled but mostly passive filter rail.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - default organizer state
  - manual mode with reordered top-level groups
  - manual mode with reordered branch cards
  - organizer selection bar state

## Acceptance
- The audit states clearly whether Stage 483 materially reduced the remaining mismatch between Recall's current tag-tree benchmark and our local Home organizer model.
- The audit records whether `Manual` now feels like a true work mode instead of just another sort label.
- The audit records whether organizer selection and the bottom selection bar now make the left panel feel active before the right board opens deeper work.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 483/484 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
