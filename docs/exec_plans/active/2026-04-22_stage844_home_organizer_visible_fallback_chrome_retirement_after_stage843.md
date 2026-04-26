# ExecPlan: Stage 844 Home Organizer-Visible Fallback Chrome Retirement After Stage 843

## Summary
- Keep the active high-leverage parity work on `Home`, still scoped to organizer-visible fallback states led by zero-result `Matches`.
- Retire the legacy top `Home control seam` and `Compact organizer controls` deck from the active stage563 `Home` path once the organizer is visible.
- Keep organizer-visible zero-result `Matches` compact and search-owned through the rail query summary, the shared lead band, and one compact empty-state block.

## Implementation Focus
- In the active stage563 `Home` workspace path in `RecallWorkspace.tsx`, stop rendering the organizer-visible legacy fallback chrome for zero-result `Matches` and the other organizer-visible no-results states that still depended on the same branch.
- Keep organizer-visible zero-result `Matches` rail-owned on the left and canvas-owned on the right: compact `Matches context` in the rail, shared `Matches` plus count lead band in the canvas, compact empty-state block below it, and no in-canvas Add tile or extra header-card shell.
- Preserve organizer-visible selected-board behavior, open list view behavior, hidden `Home`, hidden `Captures`, hidden `Matches`, and the Stage 818-843 Home baseline outside this fallback-chrome branch.
- Extend `frontend/src/App.test.tsx` and `scripts/playwright/home_organizer_ergonomics_shared.mjs` to catch the resurfacing bug directly through zero-result seam/deck metrics and a non-filtered organizer-visible empty-board regression.

## Validation
- targeted `frontend/src/App.test.tsx`
- `frontend/npm run build`
- `backend/tests/test_api.py -k graph -q`
- `node --check` on `scripts/playwright/home_organizer_ergonomics_shared.mjs`
- `node --check` on `scripts/playwright/stage844_home_organizer_visible_fallback_chrome_retirement_after_stage843.mjs`
- `node --check` on `scripts/playwright/stage845_post_stage844_home_organizer_visible_fallback_chrome_retirement_audit.mjs`
- `node scripts/playwright/stage844_home_organizer_visible_fallback_chrome_retirement_after_stage843.mjs`
- `node scripts/playwright/stage845_post_stage844_home_organizer_visible_fallback_chrome_retirement_audit.mjs`
- `git diff --check`
