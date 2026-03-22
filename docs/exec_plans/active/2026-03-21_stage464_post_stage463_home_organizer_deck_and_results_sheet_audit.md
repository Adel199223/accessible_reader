# ExecPlan: Stage 464 Post-Stage-463 Home Organizer Deck And Results Sheet Audit

## Summary
- Audit the Stage 463 `Home` organizer-deck and board-header reset against Recall's current organizer-led library direction.
- Judge `Home` first on wide desktop, then verify `Graph` and original-only `Reader` as regression surfaces.
- Generated-content `Reader` views remain out of scope and must not be used in the audit evidence.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting Home crops:
  - wide top
  - organizer deck
  - organizer list start
  - inline reopen strip
  - active board top
  - filtered-results top

## Acceptance
- The audit states clearly whether Stage 463 moved `Home` closer to Recall's current organizer-deck and direct-results-sheet model.
- The audit records whether the organizer rail now starts faster as the primary control surface.
- The audit records whether the right side now begins sooner as the actual working board instead of a staged header stack.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 463/464 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
