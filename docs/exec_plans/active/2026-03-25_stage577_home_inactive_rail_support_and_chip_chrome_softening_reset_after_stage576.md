# ExecPlan: Stage 577 Home Inactive-Rail Support And Chip Chrome Softening Reset After Stage 576

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Reduce the remaining March 25, 2026 Recall homepage mismatch by making inactive rail support lines quieter and by softening both rail count pills and board card collection chips.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- No backend, storage, routing, or schema changes.
- No generated-content `Reader` work.

## Acceptance
- The visible Home toolbar stays limited to `Search`, `Add`, `List`, and `Sort`.
- Inactive collection rows keep the same content model, but their support line reads quieter than the Stage 575 baseline.
- Rail count pills remain visible, but they read lighter than the Stage 575 baseline.
- Board card collection chips remain visible, but they read lighter than the Stage 575 baseline.
- The Stage 563 structural baseline remains intact: selected collection rail, date-grouped canvas, and first-group `Add Content` tile.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check scripts/playwright/stage577_home_inactive_rail_support_and_chip_chrome_softening_reset_after_stage576.mjs scripts/playwright/stage578_post_stage577_home_inactive_rail_support_and_chip_chrome_softening_audit.mjs`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 577 run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the Stage 577/578 touched set

## Outcome
- Complete.
- Inactive rail support lines now sit quieter than the Stage 575 baseline while keeping the same content model and section ownership.
- Rail count pills and board-card collection chips now read lighter without disappearing or reopening layout work.
- Live Stage 577 Edge evidence recorded `Captures` as the active rail label, `Local captures` as the active selected-row support text, `2` inactive rail rows, inactive support styling at `9.76px` with `rgba(186, 198, 218, 0.42)`, inactive count-pill styling at `8.96px` with `rgba(210, 221, 240, 0.38)`, board-card chip styling at `8px` with `rgba(202, 214, 235, 0.5)`, `0` visible day-group count nodes, and the preserved `Captures collection canvas` accessibility state.
