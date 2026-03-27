# ExecPlan: Stage 590 Post-Stage-589 Home Add-Tile Halo Glow And Preview-Shell Inner Border Softening Audit

## Summary
- Audit the Stage 589 Home polish pass against the March 25, 2026 Recall homepage screenshot.
- Confirm that the `Add Content` halo glow now reads calmer and that the preview shell inner border sits softer without reopening structure work.
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
- The audit states clearly whether Stage 589 reduced the remaining Home mismatch without reopening structure work.
- The audit records whether the `Add Content` halo glow now reads calmer than the Stage 588 baseline.
- The audit records whether the preview shell inner border now reads softer than the Stage 588 baseline.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 589/590 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 589/590 files

## Outcome
- Complete locally on 2026-03-26.
- The live Stage 590 audit confirmed that Stage 589 reduced the remaining add-tile halo-glow and preview-shell-inner-border mismatch without reopening the Stage 563 structure.
- Supporting live Edge evidence recorded `Add content to Captures`, add-tile halo alpha at `0.11`, preview-shell styling at `rgba(255, 255, 255, 0.035)` border with `13px` radius, `4` visible toolbar controls, and `0` visible day-group count nodes while `Graph` plus original-only `Reader` remained green.
- Final roadmap and handoff sync is complete for the Stage 590 checkpoint.
