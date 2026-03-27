# ExecPlan: Stage 640 Post-Stage-639 Home Lower-Card Copy-Seam And Title-Source-Chip Descent Finish Audit

## Summary
- Audit the Stage 639 lower-card copy-seam and title/source/chip descent finish pass against the March 25, 2026 Recall homepage screenshot.
- Confirm that the lower title/source/chip seam now reads slightly cleaner than the Stage 637 baseline without reopening the Stage 563 structure, the Stage 615 width cadence, or the Stage 617 earlier first-row start.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - representative paste card
  - representative web card
  - full Home wide-desktop view

## Acceptance
- The audit states clearly whether Stage 639 reduced the remaining lower-card hierarchy mismatch without reopening shell, rail, toolbar, or width-cadence work.
- The audit records whether preview ratio fell below the Stage 637 baseline and copy ratio rose above it.
- The audit records whether title/source/chip spacing and descent improved while source and chip legibility stayed in or above the Stage 637 band.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 639/640 harness pair
- real Windows Edge audit run against the repo-owned launcher path `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 639/640 files

## Outcome
- Complete locally after the Stage 640 audit and validation ladder.
- The audit confirmed that Stage 639 succeeded overall: wide desktop `Home` keeps the Stage 563 selected-collection rail and day-grouped canvas, but the lower copy seam and title/source/chip descent now read cleaner and less poster-led than the Stage 637 baseline without reopening shell, rail, toolbar, or width-cadence work.
- A supporting live Edge sample recorded a `0.5838` preview ratio, a `0.2974` copy ratio, a `19.15px` title line-height, a `5.08px` title-to-source gap, a `4.41px` source-to-chip gap, `10.51px` source text at `0.74` alpha, a `7.82px` chip at `0.57` alpha, preserved `352px` representative card width, preserved `203.52px` representative card height, preserved the Stage 617 `90.98px` first day-group top offset and `115.36px` first-row grid top offset, `4` visible toolbar controls, `0` visible day-group count nodes, and `Stage13 Debug 1773482318378` as the original-only Reader regression source title.
- `Graph` and original-only `Reader` refreshed in real Windows Edge without surfacing a new blocker, and the Reader regression capture stayed locked to an asserted `Original` tab selection so generated-content work remained out of scope.
