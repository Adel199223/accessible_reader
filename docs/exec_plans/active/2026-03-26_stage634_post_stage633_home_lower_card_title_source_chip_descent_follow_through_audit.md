# ExecPlan: Stage 634 Post-Stage-633 Home Lower-Card Title-Source-Chip Descent Follow-Through Audit

## Summary
- Audit the Stage 633 lower-card title/source/chip descent follow-through pass against the March 25, 2026 Recall homepage screenshot.
- Confirm that the lower title/source/chip seam now reads slightly cleaner than the Stage 631 baseline without reopening the Stage 563 structure, the Stage 615 width cadence, or the Stage 617 earlier first-row start.
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
- The audit states clearly whether Stage 633 reduced the remaining lower-card hierarchy mismatch without reopening shell, rail, toolbar, or width-cadence work.
- The audit records whether preview ratio fell below the Stage 631 baseline and copy ratio rose above it.
- The audit records whether title/source/chip spacing and descent improved while source and chip legibility stayed in or above the Stage 631 band.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 633/634 harness pair
- real Windows Edge audit run against the working WSL host `http://172.27.18.251:8002` because Windows localhost forwarding was unavailable in this session
- targeted `git diff --check -- ...` over the touched Stage 633/634 files

## Outcome
- Complete locally after the real Windows Edge Stage 634 audit against the working WSL host `http://172.27.18.251:8002`, because Windows localhost forwarding was unavailable in this session.
- The audit confirmed that Stage 633 succeeded overall: wide desktop `Home` keeps the Stage 563 structure while the lower title/source/chip seam now reads slightly cleaner and less poster-led than the Stage 631 baseline without reopening shell, rail, toolbar, or board-width work.
- A supporting live Edge sample recorded a `0.5989` preview ratio, a `0.2853` copy ratio, an `18.30px` title line-height, a `4.44px` title-to-source gap, a `3.73px` source-to-chip gap, `10.46px` source text at `0.71` alpha, a `7.78px` chip at `0.54` alpha, preserved `352px` representative card width, preserved `203.52px` representative card height, preserved the Stage 617 `90.98px` first day-group top offset and `115.36px` first-row grid top offset, `4` visible toolbar controls, `0` visible day-group count nodes, and `Stage13 Debug 1773482318378` as the original-only Reader regression source title.
