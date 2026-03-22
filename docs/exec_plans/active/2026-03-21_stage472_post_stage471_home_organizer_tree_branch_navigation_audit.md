# ExecPlan: Stage 472 Post-Stage-471 Home Organizer Tree-Branch Navigation Audit

## Summary
- Audit the Stage 471 `Home` organizer-tree reset against Recall's current organization model.
- Judge `Home` first on wide desktop, then verify `Graph` and original-only `Reader` as regression surfaces.
- Generated-content `Reader` views remain out of scope and must not be used in the audit evidence.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting Home crops:
  - wide top
  - organizer tree expanded state
  - selected-branch board state
  - organizer-hidden compact-control fallback

## Acceptance
- The audit states clearly whether Stage 471 moved `Home` closer to Recall's current tree-driven organizer direction.
- The audit records whether the organizer now carries more of the active-branch navigation work instead of behaving like a small preview rail.
- The audit records whether the right board now starts cleaner and less like a competing reopen shelf when the organizer is visible.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 471/472 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
