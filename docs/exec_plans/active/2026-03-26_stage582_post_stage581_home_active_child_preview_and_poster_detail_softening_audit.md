# ExecPlan: Stage 582 Post-Stage-581 Home Active Child-Preview And Poster Detail Softening Audit

## Summary
- Audit the Stage 581 Home polish pass against the March 25, 2026 Recall homepage screenshot.
- Confirm that the active child-preview row now reads quieter and that poster detail lines sit calmer without reopening structure work.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - left collection rail with the active child preview
  - representative board card preview
  - full Home wide-desktop view

## Acceptance
- The audit states clearly whether Stage 581 reduced the remaining Home mismatch without reopening structure work.
- The audit records whether active child-preview chrome now reads quieter than the Stage 580 baseline.
- The audit records whether poster detail lines now read calmer than the Stage 580 baseline.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 581/582 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 581/582 files

## Outcome
- Complete.
- The audit confirmed that Stage 581 reduced the remaining March 25, 2026 Home mismatch without reopening the Stage 563 structure: the active child-preview seam now reads quieter and poster detail lines sit calmer inside the source-aware cards.
- Live Stage 582 Edge evidence recorded `Captures collection canvas` as the active canvas aria-label, `Local captures` as the active selected-row support text, child-preview styling at `9.6px` with `rgba(190, 205, 229, 0.48)`, child-preview mark styling at `3.83px` with `rgba(169, 184, 209, 0.32)`, preview detail styling at `8.96px` with `rgba(219, 227, 240, 0.62)` for `Local capture`, preview note styling at `8.32px` with `rgba(214, 224, 239, 0.54)` for `Saved locally`, `4` visible toolbar controls, `0` visible day-group count nodes, `...` as the organizer trigger text, and `Stage13 Debug 1773482318378` as the original-only Reader regression source title.
- `Graph` and original-only `Reader` refreshed without a new blocker, and generated-content `Reader` work remained locked.
