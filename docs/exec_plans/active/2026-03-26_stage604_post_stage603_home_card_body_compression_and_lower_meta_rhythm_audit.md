# ExecPlan: Stage 604 Post-Stage-603 Home Card-Body Compression And Lower-Meta Rhythm Audit

## Summary
- Audit the Stage 603 Home card-body compression pass against the March 25, 2026 Recall homepage screenshot.
- Confirm that the cards now read denser and calmer beneath the poster without reopening structure work.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - `Add Content` tile
  - representative board card
  - full Home wide-desktop view

## Acceptance
- The audit states clearly whether Stage 603 reduced the remaining Home card-body mismatch without reopening structure work.
- The audit records whether the `Add Content` tile is shorter than the Stage 602 baseline.
- The audit records whether representative board cards are shorter and tighter than the Stage 602 baseline.
- The audit records whether the title, source row, and collection chip remain visible while landing calmer than the Stage 602 baseline.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 603/604 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 603/604 files

## Outcome
- Complete locally on 2026-03-26.
- The live Stage 604 audit confirmed that Stage 603 reduced the remaining lower-card-body and lower-meta mismatch without reopening the Stage 563 structure.
- Supporting live Edge evidence recorded a `203.52px` `Add Content` tile height, a matching `203.52px` representative board-card height, `7.36px` top/bottom card padding, a `4.16px` lower-seam row gap, `13.44px` title text at `680` weight with `14.5152px` line height, a `9.76px` source row at `rgba(190, 205, 229, 0.56)`, a `7.04px` collection chip at `rgba(202, 214, 235, 0.38)`, `4` visible toolbar controls, `0` visible day-group count nodes, and `Stage13 Debug 1773482318378` as the original-only Reader regression source title.
- Final roadmap and handoff sync is complete for the Stage 604 checkpoint.
