# ExecPlan: Stage 602 Post-Stage-601 Home Toolbar Scale And Utility Fill Calibration Audit

## Summary
- Audit the Stage 601 Home toolbar calibration pass against the March 25, 2026 Recall homepage screenshot.
- Confirm that the utility cluster now reads closer to Recall in scale and lower-contrast fill rhythm without reopening structure work.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - toolbar cluster
  - Search trigger
  - secondary toolbar row
  - full Home wide-desktop view

## Acceptance
- The audit states clearly whether Stage 601 reduced the remaining Home mismatch without reopening structure work.
- The audit records whether the Search trigger is wider than the Stage 600 baseline and keeps visible `Search...` plus `Ctrl+K`.
- The audit records whether the Add trigger is wider than the Stage 600 baseline.
- The audit records whether the secondary `List` and `Sort` pills are taller and calmer than the Stage 600 baseline.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 601/602 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 601/602 files

## Outcome
- Complete locally on 2026-03-26.
- The live Stage 602 audit confirmed that Stage 601 reduced the remaining toolbar scale and utility fill mismatch without reopening the Stage 563 structure.
- Supporting live Edge evidence recorded a `194px` Search trigger at `41px` height with visible `Search...` plus `Ctrl+K`, a `66.88px` Add trigger at `38.77px` height, `34.53px` `List` plus `Sort` pills with `0.02` fill alpha and `0.043` border alpha, `4` visible toolbar controls, `0` visible day-group count nodes, and `Stage13 Debug 1773482318378` as the original-only `Reader` regression source title while stable `Graph` plus original-only `Reader` captures stayed green in real Windows Edge.
- Final roadmap and handoff sync is complete for the Stage 602 checkpoint.
