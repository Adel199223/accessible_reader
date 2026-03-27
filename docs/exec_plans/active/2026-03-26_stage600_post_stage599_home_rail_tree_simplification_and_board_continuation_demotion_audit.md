# ExecPlan: Stage 600 Post-Stage-599 Home Rail Tree Simplification And Board Continuation Demotion Audit

## Summary
- Audit the Stage 599 Home hierarchy pass against the March 25, 2026 Recall homepage screenshot.
- Confirm that the active rail selection now reads flatter, the attached child preview sits thinner, and the board continuation footer reads quieter without reopening structure work.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - selected row plus attached child preview
  - left rail
  - `Add Content` tile
  - footer continuation
  - full Home wide-desktop view

## Acceptance
- The audit states clearly whether Stage 599 reduced the remaining Home mismatch without reopening structure work.
- The audit records whether the active selected row now reads flatter than the Stage 580 active-row baseline.
- The audit records whether the attached child preview now reads thinner than the earlier Stage 571 preview-height baseline while remaining quieter than the Stage 582 preview-font and chrome baselines.
- The audit records whether the footer continuation now hides the numeric total visually while preserving it in accessible naming.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 599/600 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 599/600 files

## Outcome
- Complete locally on 2026-03-26.
- The live Stage 600 audit confirmed that Stage 599 reduced the remaining rail-selection and board-continuation mismatch without reopening the Stage 563 structure.
- Supporting live Edge evidence recorded active-row styling at `0.66` background alpha, `0.05` border alpha, and `0.01` inset-glow alpha, a `13.58px` attached child-preview seam with `8.96px` type and `0.42` text alpha, visible footer label `Show all captures`, hidden accessible footer total `, 34 total sources`, `0` visible numeric footer-count nodes, `4` visible toolbar controls, `0` visible day-group count nodes, and `Stage13 Debug 1773482318378` as the original-only Reader regression source title.
- Final roadmap and handoff sync is complete for the Stage 600 checkpoint.
