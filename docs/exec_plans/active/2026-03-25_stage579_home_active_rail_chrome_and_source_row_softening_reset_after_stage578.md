# ExecPlan: Stage 579 Home Active-Rail Chrome And Source-Row Softening Reset After Stage 578

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Reduce the remaining March 25, 2026 Recall homepage mismatch by calming active-rail highlight chrome and softening board-card source-row emphasis.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- No backend, storage, routing, or schema changes.
- No generated-content `Reader` work.

## Acceptance
- The visible Home toolbar stays limited to `Search`, `Add`, `List`, and `Sort`.
- The active selected rail row keeps the same ownership and content but lands with less visual glow than the Stage 578 baseline.
- Board-card source rows remain visible and readable, but they read softer than the Stage 578 baseline.
- The Stage 563 structural baseline remains intact: selected collection rail, date-grouped canvas, and first-group `Add Content` tile.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check scripts/playwright/stage579_home_active_rail_chrome_and_source_row_softening_reset_after_stage578.mjs scripts/playwright/stage580_post_stage579_home_active_rail_chrome_and_source_row_softening_audit.mjs`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 579 run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the Stage 579/580 touched set

## Outcome
- Complete.
- The active selected rail row now lands with calmer background, border, and inset-chrome pressure than the Stage 578 baseline while keeping the same ownership and copy.
- Board-card source rows now read softer than the Stage 578 baseline without disappearing or disturbing the poster-led hierarchy.
- Live Stage 579 Edge evidence recorded `Captures` as the active rail label, `Local captures` as the active selected-row support text, active-rail styling at `rgba(17, 23, 34, 0.82)` background with `rgba(112, 167, 255, 0.082)` border and `rgba(112, 167, 255, 0.024)` inset box-shadow, board-card source-row styling at `10.24px` with `rgba(190, 205, 229, 0.62)`, `4` visible toolbar controls, and `0` visible day-group count nodes.
