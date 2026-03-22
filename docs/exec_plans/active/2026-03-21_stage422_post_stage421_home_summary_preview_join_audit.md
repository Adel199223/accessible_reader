# ExecPlan: Stage 422 Post-Stage-421 Home Summary-Preview Join Audit

## Summary
- Audit the Stage 421 `Home` organizer summary-preview join tightening reset against the current Recall homepage direction.
- Judge `Home` first on wide desktop, then verify `Graph` and original-only `Reader` as regression surfaces.
- Generated-content `Reader` views remain out of scope and must not be used in the audit evidence.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting Home crops:
  - top control seam
  - organizer rail
  - selected organizer-state crop showing the tighter summary-to-preview handoff
  - primary-flow crop
  - pinned reopen shelf
- Focused regressions second:
  - only if needed to confirm the shared shell stayed coherent

## Acceptance
- The audit states clearly whether Stage 421 moved `Home` closer to Recall's current lean utility-first organizer-rail direction.
- The audit records whether `Graph` and original-only `Reader` remained visually stable behind the Home summary-preview join reset.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 421/422 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
