# ExecPlan: Stage 584 Post-Stage-583 Home Collection Header Summary And Poster Badge Softening Audit

## Summary
- Audit the Stage 583 Home polish pass against the March 25, 2026 Recall homepage screenshot.
- Confirm that the rail header summary line now reads quieter and that poster badge chrome sits subtler without reopening structure work.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - left collection rail with the header summary
  - representative board card preview
  - full Home wide-desktop view

## Acceptance
- The audit states clearly whether Stage 583 reduced the remaining Home mismatch without reopening structure work.
- The audit records whether the rail header summary line now reads quieter than the Stage 582 baseline.
- The audit records whether poster badge chrome now reads subtler than the Stage 582 baseline.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 583/584 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 583/584 files

## Outcome
- Complete.
- The audit confirmed that Stage 583 reduced the remaining March 25, 2026 Home mismatch without reopening the Stage 563 structure: the rail header summary line now reads quieter and poster badge chrome no longer stops the eye as hard inside the card preview.
- Live Stage 584 Edge evidence recorded `Captures collection canvas` as the active canvas aria-label, `Local captures` as the active selected-row support text, `34 sources` as the quiet rail summary line, rail heading-meta styling at `9.76px` with `rgba(196, 207, 226, 0.38)`, rail summary styling at `10.08px` with `rgba(176, 190, 211, 0.46)`, poster badge styling at `8.48px` with `rgba(13, 17, 25, 0.54)` background, `rgba(255, 255, 255, 0.05)` border, `rgba(220, 230, 246, 0.78)` text, `4` visible toolbar controls, `0` visible day-group count nodes, `...` as the organizer trigger text, and `Stage13 Debug 1773482318378` as the original-only Reader regression source title.
- `Graph` and original-only `Reader` refreshed without a new blocker, and generated-content `Reader` work remained locked.
