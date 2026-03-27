# ExecPlan: Stage 601 Home Toolbar Scale And Utility Fill Calibration Reset After Stage 600

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Reduce the remaining March 25, 2026 Recall homepage mismatch by calibrating the top-right utility cluster so `Search`, `Add`, `List`, and `Sort` read closer to Recall in width, height, and fill contrast.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- No backend, storage, routing, or schema changes.
- No card-preview, grouping, or organizer-behavior changes.
- No generated-content `Reader` work.

## Acceptance
- The visible Home toolbar stays limited to `Search`, `Add`, `List`, and `Sort`.
- The Search trigger stays recognizable and clickable, but reads wider and more like a real control than the Stage 600 baseline while keeping visible `Search...` and `Ctrl+K`.
- The Add trigger stays dominant and grows slightly wider than the Stage 600 baseline.
- The secondary `List` and `Sort` pills stay darker and calmer than the Stage 600 baseline while growing slightly taller so the two-row cluster reads as one deliberate unit.
- The Stage 563 structural baseline remains intact: selected collection rail, date-grouped canvas, first-group `Add Content` tile, and current source-aware card treatments.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check scripts/playwright/stage601_home_toolbar_scale_and_utility_fill_calibration_reset_after_stage600.mjs scripts/playwright/stage602_post_stage601_home_toolbar_scale_and_utility_fill_calibration_audit.mjs`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 601 run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the Stage 601/602 touched set

## Outcome
- Complete locally on 2026-03-26.
- The Search trigger kept the Stage 563 Home structure intact, but the live Stage 601 validation widened it to `194px` at `41px` height, kept visible `Search...` plus `Ctrl+K`, and softened the placeholder seam to `0.76` alpha while the secondary pills grew to `34.53px` height at `0.02` fill alpha plus `0.043` border alpha.
- The Add trigger remained the dominant action while widening to `66.88px` at `38.77px` height.
- Targeted frontend validation, live Windows Edge Stage 601 evidence, and the follow-up Stage 602 audit all passed.
