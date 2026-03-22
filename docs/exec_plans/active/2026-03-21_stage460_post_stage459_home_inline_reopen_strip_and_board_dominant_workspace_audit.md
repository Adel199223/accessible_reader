# ExecPlan: Stage 460 Post-Stage-459 Home Inline Reopen Strip And Board-Dominant Workspace Audit

## Summary
- Audit the Stage 459 `Home` board-dominant workspace reset against Recall's current organizer-led library direction.
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
  - board-top inline reopen strip
  - filtered-results top

## Acceptance
- The audit states clearly whether Stage 459 moved `Home` closer to Recall's current organizer-led, board-dominant workspace model.
- The audit records whether the pinned reopen continuity now reads like an attached continuation strip instead of a competing side lane.
- The audit records whether the active board now begins sooner and holds more of the visible right-side workspace.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 459/460 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
