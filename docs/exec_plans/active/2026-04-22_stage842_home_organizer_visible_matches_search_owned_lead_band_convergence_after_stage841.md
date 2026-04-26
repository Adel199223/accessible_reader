# ExecPlan: Stage 842 Home Organizer-Visible Matches Search-Owned Lead Band Convergence After Stage 841

## Summary
- Keep the active high-leverage parity work on organizer-visible `Home`, still scoped to the filtered `Matches` path.
- Make filtered `Matches` feel search-owned in the main canvas instead of inheriting the default board's date-owned top-left heading.
- Simplify zero-result filtered `Matches` so the canvas reuses the same shared lead band and a compact empty-state block instead of expanding into a heavier fallback shell.

## Implementation Focus
- Scope the canvas change to organizer-visible `Home` when `libraryFilterActive` and `homeViewMode === 'board'`, keeping the Stage 840 compact rail query summary intact.
- Replace the current first date-led board header with one shared results-owned lead band that keeps `Matches` plus the visible count on the left and the existing top-right `Search / Add / New note / List / Sort` cluster on the right.
- Keep chronology by day, but demote day labels into quieter inline dividers inside filtered board mode; suppress the first visible divider entirely when all visible results fall on one day.
- Reuse that same shared lead band for zero-result filtered `Matches`, remove the extra header-card treatment, and keep the empty state compact plus clear-search oriented without reviving the Add tile or the old organizer control deck.
- Preserve open selected-board behavior, open list view behavior, hidden `Home`, hidden `Captures`, hidden `Matches`, and the Stage 818-841 Home baseline outside the organizer-visible filtered board path.

## Validation
- targeted `frontend/src/App.test.tsx`
- `frontend/npm run build`
- `backend/tests/test_api.py -k graph -q`
- `node --check` on `scripts/playwright/home_organizer_ergonomics_shared.mjs`
- `node --check` on `scripts/playwright/stage842_home_organizer_visible_matches_search_owned_lead_band_convergence_after_stage841.mjs`
- `node --check` on `scripts/playwright/stage843_post_stage842_home_organizer_visible_matches_search_owned_lead_band_convergence_audit.mjs`
- `node scripts/playwright/stage842_home_organizer_visible_matches_search_owned_lead_band_convergence_after_stage841.mjs`
- `node scripts/playwright/stage843_post_stage842_home_organizer_visible_matches_search_owned_lead_band_convergence_audit.mjs`
- `git diff --check`
