# ExecPlan: Stage 586 Post-Stage-585 Home Add-Tile Perimeter And Collection-Chip Softening Audit

## Summary
- Audit the Stage 585 Home polish pass against the March 25, 2026 Recall homepage screenshot.
- Confirm that the `Add Content` tile perimeter now reads quieter and that the lower collection chip sits softer without reopening structure work.
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
- The audit states clearly whether Stage 585 reduced the remaining Home mismatch without reopening structure work.
- The audit records whether the `Add Content` tile perimeter now reads quieter than the Stage 584 baseline.
- The audit records whether the lower collection chip now reads softer than the Stage 584 baseline.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 585/586 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 585/586 files

## Outcome
- Complete locally on 2026-03-26.
- The live Stage 586 audit confirmed that Stage 585 reduced the remaining add-tile perimeter and lower collection-chip mismatch without reopening the Stage 563 structure.
- Supporting live Edge evidence recorded `Add content to Captures`, add-tile styling at `rgba(10, 14, 21, 0.88)` background with `rgba(138, 175, 235, 0.17)` dashed border, collection-chip styling at `7.52px` with `rgba(255, 255, 255, 0.008)` background, `rgba(255, 255, 255, 0.024)` border, `rgba(202, 214, 235, 0.44)` text, `4` visible toolbar controls, and `0` visible day-group count nodes while `Graph` plus original-only `Reader` remained green.
- Final roadmap and handoff sync is complete for the Stage 586 checkpoint.
