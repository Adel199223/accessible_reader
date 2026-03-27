# ExecPlan: Stage 592 Post-Stage-591 Home Preview Overlay Texture And Poster Mark Chrome Softening Audit

## Summary
- Audit the Stage 591 Home polish pass against the March 25, 2026 Recall homepage screenshot.
- Confirm that the preview overlay texture now reads calmer and that the poster mark chrome sits softer without reopening structure work.
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
- The audit states clearly whether Stage 591 reduced the remaining Home mismatch without reopening structure work.
- The audit records whether the preview overlay texture now reads calmer than the Stage 590 baseline.
- The audit records whether the poster mark chrome now reads softer than the Stage 590 baseline.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 591/592 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 591/592 files

## Outcome
- Complete locally on 2026-03-26.
- The live Stage 592 audit confirmed that Stage 591 reduced the remaining preview-overlay-texture and poster-mark-chrome mismatch without reopening the Stage 563 structure.
- Supporting live Edge evidence recorded preview-overlay styling at `0.19` opacity with `0.06` maximum texture alpha, poster-mark styling at `0.22` maximum background alpha with a `0.15` border alpha, `ST` as the representative poster-mark text, `4` visible toolbar controls, `0` visible day-group count nodes, and `Stage13 Debug 1773482318378` as the original-only Reader regression source title.
- Final roadmap and handoff sync is complete for the Stage 592 checkpoint.
