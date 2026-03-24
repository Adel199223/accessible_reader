# ExecPlan: Stage 522 Post-Stage-521 Home Selected-Group Title-Wrap And Row-Height Audit

## Summary
- Audit the Stage 521 `Home` selected-group title-wrap and row-height continuity deflation reset against Recall's current organized-library direction.
- Confirm that longer selected-group titles now sit more calmly inside the board without recreating a jagged row edge.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - selected-group title-wrap treatment
  - selected-group first-row row-height continuity
  - selected-group follow-through after the calmer title-wrap treatment

## Acceptance
- The audit states clearly whether Stage 521 materially reduced the remaining selected-group title-wrap and row-height mismatch between Recall's current `Home` benchmark and our local board.
- The audit records whether longer selected-group titles now sit more calmly without blurring source identity.
- The audit records whether the visible board row now reads more evenly instead of stepping through a jagged title rhythm.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 521/522 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
