# ExecPlan: Stage 612 Post-Stage-611 Home Lower-Card Source-Row And Collection-Chip Cadence Audit

## Summary
- Audit the Stage 611 Home lower-card cadence rebalance against the March 25, 2026 Recall homepage screenshot.
- Confirm that the source row and collection chip now read slightly more like Recall cards without reopening structure, toolbar, or poster work.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - representative card
  - full Home wide-desktop view

## Acceptance
- The audit states clearly whether Stage 611 reduced the remaining lower-card source/chip mismatch without reopening structure work.
- The audit records whether the representative source row and collection chip now land slightly more legible than the Stage 610 baseline while keeping a compact card height.
- The audit records whether `4` visible toolbar controls and `0` visible day-group count nodes are preserved.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 611/612 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 611/612 files

## Outcome
- Complete locally on 2026-03-26.
- The live Stage 612 audit confirmed that Stage 611 improved the lower card source-row and collection-chip cadence without reopening the Stage 563 structure or the Stage 610 toolbar/rail restraint pass.
- Supporting live Edge evidence recorded slightly more legible lower-card source/chip styling, preserved compact card height, preserved `4` visible toolbar controls, preserved `0` visible day-group count nodes, and stable original-only `Reader` plus `Graph` regression captures.
- Final roadmap and handoff sync is complete for the Stage 612 checkpoint.
