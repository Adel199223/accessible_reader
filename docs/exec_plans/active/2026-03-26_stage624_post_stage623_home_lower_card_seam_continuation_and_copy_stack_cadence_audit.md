# ExecPlan: Stage 624 Post-Stage-623 Home Lower-Card Seam Continuation And Copy-Stack Cadence Audit

## Summary
- Audit the Stage 623 lower-card seam continuation pass against the March 25, 2026 Recall homepage screenshot.
- Confirm that the lower title/source/chip seam owns slightly more of the card rhythm than the Stage 621 baseline without reopening the Stage 563 structure, the Stage 615 width cadence, or the Stage 617 earlier first-row start.
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
- The audit states clearly whether Stage 623 reduced the remaining lower-card seam mismatch without reopening shell, rail, toolbar, or width-cadence work.
- The audit records whether preview ratio fell below the Stage 621 baseline and copy ratio rose above it.
- The audit records whether title/source/chip spacing improved while source and chip legibility stayed in the Stage 621 band.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 623/624 harness pair
- real Windows Edge audit run against the working WSL host `http://172.27.18.251:8002` because Windows localhost forwarding was unavailable in this session
- targeted `git diff --check -- ...` over the touched Stage 623/624 files

## Outcome
- Complete and validated locally.
- The audit confirmed that Stage 623 reduced the remaining lower-card seam mismatch against the March 25, 2026 Recall homepage screenshot without reopening the Stage 563 structure, the Stage 615 width cadence, or the Stage 617 earlier first-row start.
- A supporting live Edge sample recorded a `0.6271` preview ratio, a `0.2625` copy ratio, a `16.78px` title line-height, a `3.27px` title-to-source gap, a `2.47px` source-to-chip gap, `10.37px` source text at `0.67` alpha, a `7.65px` chip at `0.5` alpha, preserved `352px` representative card width, preserved `203.52px` representative card height, `4` visible toolbar controls, `0` visible day-group count nodes, and stable `Graph` plus original-only `Reader` regression captures while generated-content `Reader` work remained locked.
