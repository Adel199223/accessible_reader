# ExecPlan: Stage 620 Post-Stage-619 Home Canvas-Frame Contrast And Utility-Pill Emphasis Softening Audit

## Summary
- Audit the Stage 619 Home canvas-frame and utility-pill softening pass against the March 25, 2026 Recall homepage screenshot.
- Confirm that the board reads less boxed and the utility pills pull less strongly without reopening the Stage 617 board-start compaction or the Stage 615 width cadence.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - toolbar cluster
  - full Home wide-desktop view

## Acceptance
- The audit states clearly whether Stage 619 reduced the remaining canvas-frame and utility-pill mismatch without reopening structure or card-width work.
- The audit records whether canvas contrast plus Search/List/Sort fill and border emphasis all improved versus Stage 618.
- The audit records whether `4` visible toolbar controls and `0` visible day-group count nodes are preserved.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 619/620 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 619/620 files

## Outcome
- Complete and validated locally.
- The audit confirmed that Stage 619 reduced the remaining canvas-frame and utility-pill mismatch against the March 25, 2026 Recall homepage screenshot without reopening the Stage 617 board-start compaction or the Stage 615 width cadence.
- A supporting live Edge sample recorded `0.82` canvas background alpha, `0.024` canvas border alpha, `0.02` Search fill alpha, `0.035` Search border alpha, `0.01` List/Sort fill alpha, `0.03` List/Sort border alpha, preserved `352px` add-tile/card widths, preserved `203.52px` representative card height, `4` visible toolbar controls, `0` visible day-group count nodes, and stable `Graph` plus original-only `Reader` regression captures while generated-content `Reader` work remained locked.
