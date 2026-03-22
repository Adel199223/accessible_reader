# ExecPlan: Stage 420 Post-Stage-419 Home Organizer Preview Grouping Audit

## Summary
- Audit the Stage 419 `Home` organizer preview-grouping deflation reset against the current Recall homepage direction.
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
  - selected organizer-state crop showing the flatter attached-preview treatment
  - primary-flow crop
  - pinned reopen shelf
- Focused regressions second:
  - only if needed to confirm the shared shell stayed coherent

## Acceptance
- The audit states clearly whether Stage 419 moved `Home` closer to Recall's current lean utility-first organizer-rail direction.
- The audit records whether `Graph` and original-only `Reader` remained visually stable behind the Home preview-grouping reset.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 419/420 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
