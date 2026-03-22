# ExecPlan: Stage 414 Post-Stage-413 Home Organizer-Selection Continuity Audit

## Summary
- Audit the Stage 413 `Home` organizer-selection continuity reset against the current Recall library direction.
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
  - selected organizer-state crop showing the continuity between the active row and its attached previews
  - primary-flow crop
  - pinned reopen shelf
- Focused regressions second:
  - only if needed to confirm the shared shell stayed coherent

## Acceptance
- The audit states clearly whether Stage 413 moved `Home` closer to Recall's current continuous tag-list-driven homepage direction.
- The audit records whether `Graph` and original-only `Reader` remained visually stable behind the Home selection reset.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 413/414 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
