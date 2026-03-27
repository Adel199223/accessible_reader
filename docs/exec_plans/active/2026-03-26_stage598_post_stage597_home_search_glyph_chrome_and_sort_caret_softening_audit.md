# ExecPlan: Stage 598 Post-Stage-597 Home Search Glyph Chrome And Sort Caret Softening Audit

## Summary
- Audit the Stage 597 Home polish pass against the March 25, 2026 Recall homepage screenshot.
- Confirm that the Search glyph chrome now reads quieter and that the visible Sort caret sits softer without reopening structure work.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - toolbar cluster
  - `Add Content` tile
  - representative board card
  - full Home wide-desktop view

## Acceptance
- The audit states clearly whether Stage 597 reduced the remaining Home mismatch without reopening structure work.
- The audit records whether the Search glyph chrome now reads quieter than the Stage 596 baseline.
- The audit records whether the visible Sort caret now reads softer than the Stage 596 baseline.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 597/598 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 597/598 files

## Outcome
- Complete locally on 2026-03-26.
- The live Stage 598 audit confirmed that Stage 597 reduced the remaining Search-glyph and Sort-caret mismatch without reopening the Stage 563 structure.
- Supporting live Edge evidence recorded Search-glyph styling at `0.64` border alpha plus `0.64` handle alpha at an `11.19px` square with a `4.31px` handle width, a Sort caret at `10.88px` with `0.64` opacity and visible `v` text, `4` visible toolbar controls, `0` visible day-group count nodes, and `Stage13 Debug 1773482318378` as the original-only Reader regression source title.
- Final roadmap and handoff sync is complete for the Stage 598 checkpoint.
