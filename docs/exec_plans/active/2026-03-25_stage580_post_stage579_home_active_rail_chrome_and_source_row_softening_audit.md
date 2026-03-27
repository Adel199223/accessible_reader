# ExecPlan: Stage 580 Post-Stage-579 Home Active-Rail Chrome And Source-Row Softening Audit

## Summary
- Audit the Stage 579 Home polish pass against the March 25, 2026 Recall homepage screenshot.
- Confirm that the active selected row now reads calmer and that board-card source rows sit quieter without reopening structure work.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - left collection rail with the active row
  - representative board card
  - full Home wide-desktop view

## Acceptance
- The audit states clearly whether Stage 579 reduced the remaining Home mismatch without reopening structure work.
- The audit records whether active-rail highlight chrome now reads calmer than the Stage 578 baseline.
- The audit records whether board-card source-row styling now reads softer than the Stage 578 baseline.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 579/580 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 579/580 files

## Outcome
- Complete.
- The audit confirmed that Stage 579 reduced the remaining March 25, 2026 Home mismatch without reopening the Stage 563 structure: the active selected row now reads calmer and board-card source rows sit softer beneath the title.
- Live Stage 580 Edge evidence recorded `Captures collection canvas` as the active canvas aria-label, `Local captures` as the active selected-row support text, active-rail styling at `rgba(17, 23, 34, 0.82)` background with `rgba(112, 167, 255, 0.082)` border and `rgba(112, 167, 255, 0.024)` inset box-shadow, board-card source-row styling at `10.24px` with `rgba(190, 205, 229, 0.62)`, `4` visible toolbar controls, `0` visible day-group count nodes, `...` as the organizer trigger text, and `Stage13 Debug 1773482318378` as the original-only Reader regression source title.
- `Graph` and original-only `Reader` refreshed without a new blocker, and generated-content `Reader` work remained locked.
