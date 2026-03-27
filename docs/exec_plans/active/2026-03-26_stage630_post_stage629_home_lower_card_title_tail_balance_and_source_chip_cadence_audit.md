# ExecPlan: Stage 630 Post-Stage-629 Home Lower-Card Title-Tail Balance And Source-Chip Cadence Audit

## Summary
- Audit the Stage 629 lower-card title-tail balance and source/chip cadence refinement pass against the March 25, 2026 Recall homepage screenshot.
- Confirm that the lower title tail reads more evenly and the source/chip cadence reads slightly steadier than the Stage 627 baseline without reopening the Stage 563 structure, the Stage 615 width cadence, or the Stage 617 earlier first-row start.
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
- The audit states clearly whether Stage 629 reduced the remaining lower-card title-tail and source/chip cadence mismatch without reopening shell, rail, toolbar, or width-cadence work.
- The audit records whether preview ratio fell below the Stage 627 baseline and copy ratio rose above it.
- The audit records whether title/source/chip spacing improved while source and chip legibility stayed in the Stage 627 band.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 629/630 harness pair
- real Windows Edge audit run against the working WSL host `http://172.27.18.251:8002` because Windows localhost forwarding was unavailable in this session
- targeted `git diff --check -- ...` over the touched Stage 629/630 files

## Outcome
- Complete and validated locally.
- The audit confirmed that Stage 629 reduced the remaining lower-card title-tail and source/chip cadence mismatch against the March 25, 2026 Recall homepage screenshot without reopening the Stage 563 structure, the Stage 615 width cadence, or the Stage 617 earlier first-row start.
- A supporting live Edge sample recorded a `0.6091` preview ratio, a `0.2773` copy ratio, a `17.74px` title line-height, a `4.03px` title-to-source gap, a `3.31px` source-to-chip gap, `10.43px` source text at `0.69` alpha, a `7.73px` chip at `0.52` alpha, preserved `352px` representative card width, preserved `203.52px` representative card height, preserved the Stage 617 `90.98px` first day-group top offset and `115.36px` first-row grid top offset, `4` visible toolbar controls, `0` visible day-group count nodes, and stable `Graph` plus original-only `Reader` regression captures while generated-content `Reader` work remained locked.
