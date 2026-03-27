# ExecPlan: Stage 606 Post-Stage-605 Home Preview-Label Softening And Grid-Whitespace Calibration Audit

## Summary
- Audit the Stage 605 Home preview-label and grid-whitespace pass against the March 25, 2026 Recall homepage screenshot.
- Confirm that poster labels now yield more cleanly and that day-group plus card-grid spacing read slightly tighter without reopening structure work.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - representative board card
  - full Home wide-desktop view

## Acceptance
- The audit states clearly whether Stage 605 reduced the remaining poster-label and grid-whitespace mismatch without reopening structure work.
- The audit records whether day-group and grid spacing are tighter than the Stage 604 baseline.
- The audit records whether the poster detail and note seams remain visible while landing quieter than the Stage 604 baseline.
- The audit records whether the Stage 604 lower-card seam remains intact beneath the poster.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 605/606 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 605/606 files

## Outcome
- Complete locally on 2026-03-26.
- The live Stage 606 audit confirmed that Stage 605 reduced the remaining poster-label and grid-whitespace mismatch without reopening the Stage 563 structure.
- Supporting live Edge evidence recorded day-group spacing at `10.88px`, per-group stack spacing at `8px`, grid spacing at `8.96px`, preview detail styling at `8px` with `0.46` alpha, preview note styling at `7.52px` with `0.4` alpha, `Local capture` plus `Saved locally` as the representative poster labels, `4` visible toolbar controls, `0` visible day-group count nodes, and `Stage13 Debug 1773482318378` as the original-only Reader regression source title.
- Final roadmap and handoff sync is complete for the Stage 606 checkpoint.
