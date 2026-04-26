# ExecPlan: Stage 846 Graph Default-Open Tour Retirement and Help-Corner Opt-In After Stage 845

## Summary
- Reopen `Graph` as the next intentional high-leverage surface after the Stage 845 `Home` fallback-chrome baseline.
- Retire the default-open blocking `Graph View tour` so Graph opens directly into its working state.
- Keep onboarding available as an explicit help-corner action instead of a mandatory first-open modal.

## Implementation Focus
- In the Graph browse path in `frontend/src/components/RecallWorkspace.tsx`, stop auto-showing the `Graph View tour` on first open while keeping the existing settings sidebar, control seam, count pill, utility corners, and tour content intact.
- Make `Graph help controls` visible at rest from the initial open and use one explicit first-run entry label: `Take Graph tour` before the user starts it, then `Replay Graph tour` after the user closes or finishes it, while keeping `Graph help` beside it.
- Preserve Graph search, fit/lock controls, settings sections, node selection, focus tray, detail dock, and path exploration outside the onboarding change.
- Extend `frontend/src/App.test.tsx`, `frontend/src/components/RecallWorkspace.stage37.test.tsx`, `frontend/src/lib/appRoute.test.ts`, and `scripts/playwright/graph_recall_style_shared.mjs` so the regressions now assert opt-in onboarding instead of a mandatory default-open tour.

## Validation
- targeted `frontend/src/App.test.tsx`
- targeted `frontend/src/components/RecallWorkspace.stage37.test.tsx`
- targeted `frontend/src/lib/appRoute.test.ts`
- `frontend/npm run build`
- `backend/tests/test_api.py -k graph -q`
- `node --check` on `scripts/playwright/graph_recall_style_shared.mjs`
- `node --check` on `scripts/playwright/stage846_graph_default_open_tour_retirement_and_help_corner_opt_in_after_stage845.mjs`
- `node --check` on `scripts/playwright/stage847_post_stage846_graph_default_open_tour_retirement_and_help_corner_opt_in_audit.mjs`
- `node scripts/playwright/stage846_graph_default_open_tour_retirement_and_help_corner_opt_in_after_stage845.mjs`
- `node scripts/playwright/stage847_post_stage846_graph_default_open_tour_retirement_and_help_corner_opt_in_audit.mjs`
- `git diff --check`
