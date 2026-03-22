# ExecPlan: Stage 456 Post-Stage-455 Home Direct Board And Organizer Audit

## Summary
- Audit the Stage 455 `Home` organizer-and-board hierarchy reset against Recall's current tag-tree-driven library direction.
- Judge `Home` first on wide desktop, then verify `Graph` and original-only `Reader` as regression surfaces.
- Generated-content `Reader` views remain out of scope and must not be used in the audit evidence.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting Home crops:
  - wide top
  - organizer rail top
  - selected organizer branch
  - direct board top
  - filtered-results top

## Acceptance
- The audit states clearly whether Stage 455 moved `Home` closer to Recall's current organizer-led direct-board model.
- The audit records whether the organizer now more clearly owns navigation and filtering state.
- The audit records whether the right side now reads like the real filtered card board instead of a featured next-source composition.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 455/456 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
