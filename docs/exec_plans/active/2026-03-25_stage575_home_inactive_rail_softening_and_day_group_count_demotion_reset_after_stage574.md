# ExecPlan: Stage 575 Home Inactive-Rail Softening And Day-Group Count Demotion Reset After Stage 574

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Reduce the remaining March 25, 2026 Recall homepage mismatch by softening inactive rail rows and retiring visible day-group counts from the canvas header.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- No backend, storage, routing, or schema changes.
- No generated-content `Reader` work.

## Acceptance
- The visible Home toolbar stays limited to `Search`, `Add`, `List`, and `Sort`.
- Inactive collection rows now read more like quiet list entries than mini cards while the active row remains explicit.
- Visible day-group headers no longer show a count chip or count text.
- Day-group source counts remain available through accessibility naming rather than visible header chrome.
- The Stage 563 structural baseline remains intact: selected collection rail, date-grouped canvas, and first-group `Add Content` tile.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check scripts/playwright/stage575_home_inactive_rail_softening_and_day_group_count_demotion_reset_after_stage574.mjs scripts/playwright/stage576_post_stage575_home_inactive_rail_softening_and_day_group_count_demotion_audit.mjs`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 575 run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the Stage 575/576 touched set

## Outcome
- Complete.
- Inactive collection rows now rest as quieter list/tree entries with transparent background and border at rest instead of reading like secondary mini cards.
- Visible day-group counts are retired from the Home header while count context stays preserved in section accessibility such as `Sat, Mar 14, 2026, 3 sources`.
- Live Stage 575 Edge evidence recorded `Captures` as the active rail label, `Local captures` as the active selected-row support text, `2` inactive rail rows, transparent inactive-row styles (`rgba(0, 0, 0, 0)` background and border), `0` visible day-group count nodes, a preserved `215.19px` add-tile height, and a preserved `182px` sort-popover width.
