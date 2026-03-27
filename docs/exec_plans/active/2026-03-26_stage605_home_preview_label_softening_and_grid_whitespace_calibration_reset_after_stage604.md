# ExecPlan: Stage 605 Home Preview-Label Softening And Grid-Whitespace Calibration Reset After Stage 604

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Reduce the remaining March 25, 2026 Recall homepage mismatch by softening poster detail labels and tightening day-group plus card-grid whitespace.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- No backend, storage, routing, or schema changes.
- No toolbar, rail-ownership, or organizer-behavior changes.
- No generated-content `Reader` work.

## Acceptance
- The visible Home toolbar stays limited to `Search`, `Add`, `List`, and `Sort`.
- Poster detail and note text stay visible, but they read quieter than the Stage 604 baseline.
- Day-group and card-grid spacing land slightly tighter than the Stage 604 baseline without reopening structure work.
- The Stage 604 lower-card seam stays intact: title, source row, and collection chip remain visible beneath the poster.
- The Stage 563 structural baseline remains intact: selected collection rail, date-grouped canvas, first-group `Add Content` tile, and current source-aware card treatments.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check scripts/playwright/stage605_home_preview_label_softening_and_grid_whitespace_calibration_reset_after_stage604.mjs scripts/playwright/stage606_post_stage605_home_preview_label_softening_and_grid_whitespace_calibration_audit.mjs`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 605 run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the Stage 605/606 touched set

## Outcome
- Complete locally on 2026-03-26.
- The Home board kept the Stage 563 selected-collection rail and day-grouped canvas intact, but the live Stage 605 validation reduced day-group spacing to `10.88px`, per-group stack spacing to `8px`, and card-grid spacing to `8.96px` while preserving the Stage 604 lower-card compression.
- Poster labels stayed visible, but the live Stage 605 validation reduced the preview detail seam to `8px` at `0.46` alpha and the preview note seam to `7.52px` at `0.4` alpha.
- Targeted frontend validation, live Windows Edge Stage 605 evidence, and the follow-up Stage 606 audit all passed.
