# ExecPlan: Stage 448 Post-Stage-447 Home Organizer-Owned Navigation Audit

## Summary
- Audit the Stage 447 `Home` organizer-owned navigation reset against Recall's current organization direction.
- Judge `Home` first on wide desktop, then verify `Graph` and original-only `Reader` as regression surfaces.
- Generated-content `Reader` views remain out of scope and must not be used in the audit evidence.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting Home crops:
  - wide top
  - shell-status seam
  - organizer control header
  - organizer list state
  - primary board shell
  - active board state

## Acceptance
- The audit states clearly whether Stage 447 moved `Home` closer to Recall's current organizer-owned navigation direction.
- The audit records whether the organizer now more clearly owns search, sorting, collapse/hide behavior and whether the right-side board reads quieter than the Stage 444 baseline.
- The audit records whether `Graph` and original-only `Reader` remained visually stable behind the Home pass.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 447/448 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
