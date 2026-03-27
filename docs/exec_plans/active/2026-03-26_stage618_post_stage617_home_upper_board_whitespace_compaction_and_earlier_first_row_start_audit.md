# ExecPlan: Stage 618 Post-Stage-617 Home Upper-Board Whitespace Compaction And Earlier First-Row Start Audit

## Summary
- Audit the Stage 617 Home upper-board whitespace pass against the March 25, 2026 Recall homepage screenshot.
- Confirm that the first day label and first row now begin earlier inside the canvas without reopening the Stage 615 board-width cadence pass.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - toolbar cluster
  - first day-group block
  - full Home wide-desktop view

## Acceptance
- The audit states clearly whether Stage 617 reduced the remaining upper-board whitespace mismatch without reopening structure or card-width work.
- The audit records whether canvas top padding, canvas gap, heading top offset, and first-row grid top offset all improved versus Stage 616.
- The audit records whether `4` visible toolbar controls and `0` visible day-group count nodes are preserved.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 617/618 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 617/618 files

## Outcome
- Complete locally on 2026-03-26.
- The live Stage 618 audit confirmed that Stage 617 reduced the remaining upper-board whitespace mismatch without reopening the Stage 615 board-column cadence pass or the Stage 563 structure.
- Supporting live Edge evidence recorded `6.4px` canvas top padding, `6.4px` canvas gap, a `90.98px` heading top offset, a `115.36px` first-row grid top offset, `6.39px` toolbar-to-heading and heading-to-grid seams, preserved `352px` add-tile/card widths, preserved `203.52px` representative card height, `3` visible first-row tiles, `4` visible toolbar controls, `0` visible day-group count nodes, and stable `Graph` plus original-only `Reader` regression captures.
- Final roadmap and handoff sync is complete for the Stage 618 checkpoint.
