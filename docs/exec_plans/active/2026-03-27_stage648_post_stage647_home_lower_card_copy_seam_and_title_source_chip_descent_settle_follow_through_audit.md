# ExecPlan: Stage 648 Post-Stage-647 Home Lower-Card Copy-Seam And Title-Source-Chip Descent Settle Follow-Through Audit

## Summary
- Audit the Stage 647 lower-card copy-seam and title/source/chip settle follow-through pass against the March 25, 2026 Recall homepage screenshot.
- Confirm that the lower title/source/chip seam now reads slightly cleaner than the Stage 645 finish baseline without reopening the Stage 563 structure, the Stage 615 width cadence, or the Stage 617 earlier first-row start.
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
- The audit states clearly whether Stage 647 reduced the remaining lower-card hierarchy mismatch without reopening shell, rail, toolbar, or width-cadence work.
- The audit records whether preview ratio fell below the Stage 645 baseline and copy ratio rose above it.
- The audit records whether title/source/chip spacing and descent improved while source and chip legibility stayed in or above the Stage 645 band.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 647/648 harness pair
- real Windows Edge audit run against the repo-owned launcher path `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 647/648 files

## Outcome
- Complete locally after the Stage 648 audit and validation ladder.
- The audit confirmed that Stage 647 succeeded overall: wide desktop `Home` keeps the Stage 563 selected-collection rail and day-grouped canvas, and the lower copy seam plus title/source/chip settle read cleaner and less poster-led than the Stage 645 finish baseline without reopening shell, rail, toolbar, or width-cadence work.
- Live Edge evidence recorded a `0.5635` preview ratio, a `0.3139` copy ratio, a `20.25px` title line-height, a `5.97px` title-to-source gap, a `5.30px` source-to-chip gap, `10.576px` source text at `0.78` alpha, a `7.888px` chip at `0.61` alpha, preserved `352px` representative card width, preserved `203.52px` representative card height, preserved the Stage 617 `90.98px` first day-group top offset and `115.36px` first-row grid top offset, `4` visible toolbar controls, and `0` visible day-group count nodes.
- `Graph` and original-only `Reader` refreshed in real Windows Edge without surfacing a new blocker, and the Reader regression capture stayed locked to an asserted `Original` tab selection so generated-content work remained out of scope.
