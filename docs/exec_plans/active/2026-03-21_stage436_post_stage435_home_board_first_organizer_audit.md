# ExecPlan: Stage 436 Post-Stage-435 Home Board-First Organizer Audit

## Summary
- Audit the Stage 435 `Home` organizer reset against the current Recall library/tagging direction.
- Judge `Home` first on wide desktop, then verify `Graph` and original-only `Reader` as regression surfaces.
- Generated-content `Reader` views remain out of scope and must not be used in the audit evidence.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting Home crops:
  - wide top with organizer visible
  - slimmer control seam
  - organizer rail
  - dominant board area
  - merged reopen cluster inside the board workspace

## Acceptance
- The audit states clearly whether Stage 435 moved `Home` closer to Recall's organizer-led, board-first direction.
- The audit records whether `Graph` and original-only `Reader` remained visually stable behind the Home pass.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 435/436 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
