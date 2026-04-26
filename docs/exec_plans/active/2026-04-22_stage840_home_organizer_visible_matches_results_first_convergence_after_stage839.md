# ExecPlan: Stage 840 Home Organizer-Visible Matches Results-First Convergence After Stage 839

## Summary
- Keep the active high-leverage parity work on organizer-visible `Home`, but shift from the default selected board to the filtered `Matches` path.
- Replace the standing filtered organizer control deck with a compact query-owned rail summary so organizer-visible `Matches` reads like a flatter results context instead of an older fallback control card.
- Make filtered board mode start with real matching documents by removing the in-canvas `Add content` tile while preserving the existing top-right board toolbar ownership.

## Implementation Focus
- Scope the rail change to organizer-visible `Home` when `libraryFilterActive`, keeping the Stage 838 organizer shell/header/list-rhythm work intact and reusing `Organizer options` for deeper organizer controls.
- Replace the at-rest filtered rail deck with one compact context block that shows the current query, match count, and inline `Clear` action without leaving the old rail searchbox/lens/sort/view/create-collection slab visible by default.
- In organizer-visible filtered board mode, suppress the shared `Add content` tile so the first visible row starts with result cards, and keep zero-result filtered states compact and clear-search-oriented instead of reviving the Add tile.
- Preserve open selected-board behavior, open list view behavior, hidden `Home`, hidden `Captures`, hidden `Matches`, and the Stage 820-839 Home baseline outside the organizer-visible `Matches` path.

## Validation
- targeted `frontend/src/App.test.tsx`
- `frontend/npm run build`
- `backend/tests/test_api.py -k graph -q`
- `node --check` on `scripts/playwright/home_organizer_ergonomics_shared.mjs`
- `node --check` on `scripts/playwright/stage840_home_organizer_visible_matches_results_first_convergence_after_stage839.mjs`
- `node --check` on `scripts/playwright/stage841_post_stage840_home_organizer_visible_matches_results_first_convergence_audit.mjs`
- `node scripts/playwright/stage840_home_organizer_visible_matches_results_first_convergence_after_stage839.mjs`
- `node scripts/playwright/stage841_post_stage840_home_organizer_visible_matches_results_first_convergence_audit.mjs`
- `git diff --check`
