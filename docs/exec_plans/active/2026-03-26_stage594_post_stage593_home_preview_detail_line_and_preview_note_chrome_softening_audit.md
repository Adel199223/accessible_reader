# ExecPlan: Stage 594 Post-Stage-593 Home Preview Detail Line And Preview Note Chrome Softening Audit

## Summary
- Audit the Stage 593 Home polish pass against the March 25, 2026 Recall homepage screenshot.
- Confirm that the preview detail line now reads quieter and that the preview note chrome sits softer without reopening structure work.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - `Add Content` tile
  - representative board card
  - full Home wide-desktop view

## Acceptance
- The audit states clearly whether Stage 593 reduced the remaining Home mismatch without reopening structure work.
- The audit records whether the preview detail line now reads quieter than the Stage 592 baseline.
- The audit records whether the preview note chrome now reads softer than the Stage 592 baseline.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 593/594 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 593/594 files

## Outcome
- Complete locally on 2026-03-26.
- The live Stage 594 audit confirmed that Stage 593 reduced the remaining preview-detail-line and preview-note-chrome mismatch without reopening the Stage 563 structure.
- Supporting live Edge evidence recorded preview-detail styling at `0.54` alpha with `8.64px` size, preview-note styling at `0.46` alpha with `8px` size, `Local capture` as the representative detail text, `Saved locally` as the representative preview-note text, `4` visible toolbar controls, `0` visible day-group count nodes, and `Stage13 Debug 1773482318378` as the original-only Reader regression source title.
- Final roadmap and handoff sync is complete for the Stage 594 checkpoint.
