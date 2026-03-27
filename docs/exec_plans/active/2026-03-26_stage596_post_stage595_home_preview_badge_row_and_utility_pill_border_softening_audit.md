# ExecPlan: Stage 596 Post-Stage-595 Home Preview Badge Row And Utility Pill Border Softening Audit

## Summary
- Audit the Stage 595 Home polish pass against the March 25, 2026 Recall homepage screenshot.
- Confirm that the preview badge row now reads quieter and that the visible utility-pill borders sit lighter without reopening structure work.
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
- The audit states clearly whether Stage 595 reduced the remaining Home mismatch without reopening structure work.
- The audit records whether the preview badge row now reads quieter than the Stage 594 baseline.
- The audit records whether the visible utility-pill borders now read lighter than the Stage 594 baseline.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 595/596 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 595/596 files

## Outcome
- Complete locally on 2026-03-26.
- The live Stage 596 audit confirmed that Stage 595 reduced the remaining preview-badge-row and utility-pill-border mismatch without reopening the Stage 563 structure.
- Supporting live Edge evidence recorded preview-badge styling at `0.46` background alpha with `0.04` border alpha and `8.16px` size, `Paste` as the representative badge text, `0.05` border alpha across the visible Search, List, and Sort pills, `4` visible toolbar controls, `0` visible day-group count nodes, and `Stage13 Debug 1773482318378` as the original-only Reader regression source title.
- Final roadmap and handoff sync is complete for the Stage 596 checkpoint.
