# ExecPlan: Stage 588 Post-Stage-587 Home Add-Tile Icon Weight And Card Shell Edge Softening Audit

## Summary
- Audit the Stage 587 Home polish pass against the March 25, 2026 Recall homepage screenshot.
- Confirm that the `Add Content` plus-mark weight now reads calmer and that the outer board-card shell edge sits softer without reopening structure work.
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
- The audit states clearly whether Stage 587 reduced the remaining Home mismatch without reopening structure work.
- The audit records whether the `Add Content` plus-mark weight now reads calmer than the Stage 586 baseline.
- The audit records whether the outer board-card shell edge now reads softer than the Stage 586 baseline.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 587/588 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 587/588 files

## Outcome
- Complete locally on 2026-03-26.
- The live Stage 588 audit confirmed that Stage 587 reduced the remaining add-tile icon-weight and card-shell-edge mismatch without reopening the Stage 563 structure.
- Supporting live Edge evidence recorded `Add content to Captures`, add-tile mark styling at `33.92px` with `500` weight, `44.47px` width/height, `rgba(163, 196, 255, 0.9)` text, card-shell styling at `rgba(11, 16, 24, 0.96)` background with `rgba(255, 255, 255, 0.043)` border, `15px` radius, `4` visible toolbar controls, and `0` visible day-group count nodes while `Graph` plus original-only `Reader` remained green.
- Final roadmap and handoff sync is complete for the Stage 588 checkpoint.
