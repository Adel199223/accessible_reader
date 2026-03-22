# ExecPlan: Stage 452 Post-Stage-451 Home Compact Reopen Rail And Board-Top Audit

## Summary
- Audit the Stage 451 `Home` compact reopen rail and board-top hierarchy reset against Recall's current organization direction.
- Judge `Home` first on wide desktop, then verify `Graph` and original-only `Reader` as regression surfaces.
- Generated-content `Reader` views remain out of scope and must not be used in the audit evidence.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting Home crops:
  - wide top
  - organizer rail
  - compact reopen rail
  - primary board shell
  - active board state

## Acceptance
- The audit states clearly whether Stage 451 moved `Home` closer to Recall's current compact, organizer-led board direction.
- The audit records whether the pinned reopen area now reads like a compact working rail instead of a featured hero, and whether the active board starts earlier than the Stage 450 baseline.
- The audit records whether `Graph` and original-only `Reader` remained visually stable behind the Home pass.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 451/452 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
