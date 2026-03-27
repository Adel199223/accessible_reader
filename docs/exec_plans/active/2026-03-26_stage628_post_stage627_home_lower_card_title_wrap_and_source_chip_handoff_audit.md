# ExecPlan: Stage 628 Post-Stage-627 Home Lower-Card Title-Wrap And Source-Chip Handoff Audit

## Summary
- Audit the Stage 627 lower-card title-wrap and source/chip handoff refinement pass against the March 25, 2026 Recall homepage screenshot.
- Confirm that the title line wraps a little more calmly and the source/chip handoff reads slightly steadier than the Stage 625 baseline without reopening the Stage 563 structure, the Stage 615 width cadence, or the Stage 617 earlier first-row start.
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
- The audit states clearly whether Stage 627 reduced the remaining lower-card title-wrap and source/chip handoff mismatch without reopening shell, rail, toolbar, or width-cadence work.
- The audit records whether preview ratio fell below the Stage 625 baseline and copy ratio rose above it.
- The audit records whether title/source/chip spacing improved while source and chip legibility stayed in the Stage 625 band.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 627/628 harness pair
- real Windows Edge audit run against the working WSL host `http://172.27.18.251:8002` because Windows localhost forwarding was unavailable in this session
- targeted `git diff --check -- ...` over the touched Stage 627/628 files

## Outcome
- Complete and validated locally.
- The audit confirmed that Stage 627 reduced the remaining lower-card title-wrap and source/chip handoff mismatch against the March 25, 2026 Recall homepage screenshot without reopening the Stage 563 structure, the Stage 615 width cadence, or the Stage 617 earlier first-row start.
- A supporting live Edge sample recorded a `0.6149` preview ratio, a `0.2726` copy ratio, a `17.46px` title line-height, a `3.8px` title-to-source gap, a `3.03px` source-to-chip gap, `10.42px` source text at `0.68` alpha, a `7.7px` chip at `0.51` alpha, preserved `352px` representative card width, preserved `203.52px` representative card height, preserved the Stage 617 `90.98px` first day-group top offset and `115.36px` first-row grid top offset, `4` visible toolbar controls, `0` visible day-group count nodes, and stable `Graph` plus original-only `Reader` regression captures while generated-content `Reader` work remained locked.
