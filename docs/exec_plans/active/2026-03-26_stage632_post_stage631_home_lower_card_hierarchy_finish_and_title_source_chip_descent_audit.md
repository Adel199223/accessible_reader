# ExecPlan: Stage 632 Post-Stage-631 Home Lower-Card Hierarchy Finish And Title-Source-Chip Descent Audit

## Summary
- Audit the Stage 631 lower-card hierarchy finish and title/source/chip descent pass against the March 25, 2026 Recall homepage screenshot.
- Confirm that the lower title/source/chip seam now reads slightly calmer and less poster-led than the Stage 629 baseline without reopening the Stage 563 structure, the Stage 615 width cadence, or the Stage 617 earlier first-row start.
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
- The audit states clearly whether Stage 631 reduced the remaining lower-card hierarchy mismatch without reopening shell, rail, toolbar, or width-cadence work.
- The audit records whether preview ratio fell below the Stage 629 baseline and copy ratio rose above it.
- The audit records whether title/source/chip spacing and descent improved while source and chip legibility stayed in or above the Stage 629 band.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 631/632 harness pair
- real Windows Edge audit run against the working WSL host `http://172.27.18.251:8002` because Windows localhost forwarding was unavailable in this session
- targeted `git diff --check -- ...` over the touched Stage 631/632 files

## Outcome
- Complete and validated locally.
- The audit confirmed that Stage 631 reduced the remaining lower-card hierarchy mismatch against the March 25, 2026 Recall homepage screenshot without reopening the Stage 563 structure, the Stage 615 width cadence, or the Stage 617 earlier first-row start.
- A supporting live Edge sample recorded a `0.6041` preview ratio, a `0.2812` copy ratio, an `18.03px` title line-height, a `4.22px` title-to-source gap, a `3.52px` source-to-chip gap, `10.45px` source text at `0.7` alpha, a `7.76px` chip at `0.53` alpha, preserved `352px` representative card width, preserved `203.52px` representative card height, preserved the Stage 617 `90.98px` first day-group top offset and `115.36px` first-row grid top offset, `4` visible toolbar controls, `0` visible day-group count nodes, and stable `Graph` plus original-only `Reader` regression captures while generated-content `Reader` work remained locked.
