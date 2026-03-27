# ExecPlan: Stage 616 Post-Stage-615 Home Board-Column Cadence And Add-Tile/Card-Width Balance Audit

## Summary
- Audit the Stage 615 Home board-column cadence pass against the March 25, 2026 Recall homepage screenshot.
- Confirm that the add tile and first-row cards now use more of the wide-desktop canvas without reopening structure, rail, toolbar, or lower-card rhythm work.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - representative add tile
  - representative card
  - full Home wide-desktop view

## Acceptance
- The audit states clearly whether Stage 615 reduced the remaining board-column cadence mismatch without reopening structure work.
- The audit records whether representative add-tile/card width rose above the Stage 614 baseline and whether first-row right slack dropped below it.
- The audit records whether `4` visible toolbar controls and `0` visible day-group count nodes are preserved.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 615/616 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 615/616 files

## Outcome
- Complete locally on 2026-03-26.
- The live Stage 616 audit confirmed that Stage 615 improved board-column cadence and add-tile/card width balance without reopening the Stage 563 structure or the Stage 613 lower-card rhythm pass.
- Supporting live Edge evidence recorded `352px` add-tile width, `352px` representative card width, `8px` column gap, `110.81px` first-row right slack, preserved `203.52px` representative card height, `3` visible first-row tiles, `4` visible toolbar controls, `0` visible day-group count nodes, and stable original-only `Reader` plus `Graph` regression captures.
- Final roadmap and handoff sync is complete for the Stage 616 checkpoint.
