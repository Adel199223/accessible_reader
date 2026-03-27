# ExecPlan: Stage 608 Post-Stage-607 Home Card-Identity Seam Rebalance Audit

## Summary
- Audit the Stage 607 Home lower-card identity rebalance against the March 25, 2026 Recall homepage screenshot.
- Confirm that the card body now reads less anonymous beneath the poster while keeping the Stage 603 density and Stage 605 spacing gains.
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
- The audit states clearly whether Stage 607 reduced the remaining lower-card identity mismatch without reopening structure work.
- The audit records whether title, source row, and chip sizes sit above the Stage 604 baseline while remaining below the Stage 602 ceiling.
- The audit records whether the card height stays below the Stage 602 ceiling.
- The audit records whether the Stage 605 spacing and poster-label restraint remain intact.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 607/608 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 607/608 files

## Outcome
- Complete locally on 2026-03-26.
- The live Stage 608 audit confirmed that Stage 607 reduced the remaining lower-card identity mismatch without reopening the Stage 563 structure, the Stage 603 card-body compression, or the Stage 605 spacing pass.
- Supporting live Edge evidence recorded a representative title, source row, and collection chip that now land between the Stage 604 calm baseline and the Stage 602 pre-compression ceiling, preserved `4` visible toolbar controls, preserved `0` visible day-group count nodes, and kept original-only `Reader` locked to `Original`.
- Final roadmap and handoff sync is complete for the Stage 608 checkpoint.
