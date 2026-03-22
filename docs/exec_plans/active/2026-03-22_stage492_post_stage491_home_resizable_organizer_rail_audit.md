# ExecPlan: Stage 492 Post-Stage-491 Home Resizable Organizer Rail Audit

## Summary
- Audit the Stage 491 `Home` organizer-rail reset against Recall's current left-menu and organizer direction.
- Judge whether the organizer now behaves like a real working rail instead of a fixed narrow strip.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - default wide organizer state
  - widened organizer state
  - organizer-hidden compact fallback
  - active branch with long source names visible in the rail

## Acceptance
- The audit states clearly whether Stage 491 materially reduced the remaining mismatch between Recall's current Home organizer benchmark and our fixed-width rail.
- The audit records whether the organizer now feels adjustable and usable for longer collection/source names.
- The audit records whether the board still stays primary while the organizer widens.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 491/492 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
