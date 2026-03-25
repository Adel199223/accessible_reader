# ExecPlan: Stage 535 Home Grouped-Overview Card Density And Nonstretch Shell Reset After Stage 534

## Summary
- The Stage 534 audit returned the parity track to refreshed-baseline hold; the user explicitly reopened product work.
- Reopen wide-desktop `Home` as the next bounded Recall-parity slice.
- Reduce the remaining grouped-overview mismatch by making the default overview board cards denser and less panel-like:
  - stop the shorter grouped-overview columns from stretching to the tallest column
  - reduce dead lower-area space inside overview cards
  - soften the grouped-overview footer/button treatment so the board reads more like one working overview instead of three tall mini-panels
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Implementation Scope
- Update wide-desktop `Home` in:
  - `frontend/src/components/RecallWorkspace.tsx`
  - `frontend/src/index.css`
- Rebalance the grouped-overview board without widening into organizer-model, backend, or generated-content Reader work:
  - keep the organizer-owned overview flow and current grouped board structure
  - make the overview grid and cards read denser above the fold by removing equal-height stretch and trimming extra shell padding
  - make the section footer and `Show all … sources` treatment feel lighter and more attached to the card body
- Preserve current `Home` continuity:
  - grouped overview remains the default collections view until the user explicitly drills into one branch
  - organizer lens, sorting, direction, board/list switching, manual mode, drag-drop, resize, and hide/show stay intact
  - search results and selected-group drill-in behavior remain unchanged
- Keep the Reader restriction explicit:
  - no `Reflowed`, `Simplified`, or `Summary` work
  - no generated-view UX changes
  - no transform, placeholder, control, or mode-routing changes

## Acceptance
- Wide-desktop grouped-overview `Home` reads more like Recall’s denser organizer-owned overview workspace because the grouped cards stop carrying large dead bottoms and overly tall shell framing.
- The grouped-overview board keeps the same information, but shorter columns now feel attached to their content instead of stretching to match the tallest column.
- The grouped-overview footer/action treatment reads like lighter continuation instead of a large detached button.
- `Graph` and original-only `Reader` remain visually and behaviorally stable.

## Validation
- targeted Vitest:
  - `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - `frontend/src/App.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check` for the new Stage 535/536 harness pair
- live `200` checks for:
  - `http://127.0.0.1:8000/recall`
  - `http://127.0.0.1:8000/recall?section=graph`
  - `http://127.0.0.1:8000/reader`
- real Windows Edge Stage 535 run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 535/536 files

## Benchmark Basis
- `docs/ux/recall_benchmark_matrix.md`
- Stage 534 wide-desktop baseline artifacts:
  - `output/playwright/stage534-home-wide-top.png`
  - `output/playwright/stage534-graph-wide-top.png`
  - `output/playwright/stage534-reader-original-wide-top.png`
- Recall `Home` benchmark sources already tracked in the matrix:
  - user-provided March 18, 2026 Home screenshot
  - Recall docs and tagging deep dive
  - release notes and changelog links already listed in the matrix

## Assumptions
- The current grouped-overview data model already exposes enough local state to densify the overview board without changing organizer semantics or storage.
- This slice should stay default-state overview focused instead of reopening selected-group drill-in or organizer-rail behavior.
- Stage 536 should immediately audit this Home pass instead of auto-opening another top-level surface.

## Outcome
- Complete.
- Wide-desktop `Home` now gives the grouped overview a denser, less panel-like default shell by trimming card padding, lightening the footer treatment, and letting shorter columns size to their own content instead of stretching to the tallest card.
- The grouped overview kept the same organizer-owned structure and continuity while making the default board read more like one working overview surface above the fold.
- `Graph` and original-only `Reader` stayed regression surfaces only, and generated-content `Reader` work remained fully locked.

## Evidence
- Product correction in:
  - `frontend/src/components/RecallWorkspace.tsx`
  - `frontend/src/index.css`
  - `frontend/src/components/RecallWorkspace.stage37.test.tsx`
- New Home harness pair:
  - `scripts/playwright/stage535_home_grouped_overview_card_density_and_nonstretch_shell_reset_after_stage534.mjs`
  - `scripts/playwright/stage536_post_stage535_home_grouped_overview_card_density_and_nonstretch_shell_audit.mjs`
- Validation remained green:
  - targeted Vitest for `frontend/src/components/RecallWorkspace.stage37.test.tsx` and `frontend/src/App.test.tsx`
  - `npm run lint`
  - `npm run build`
  - `node --check` for the Stage 535/536 harness pair
  - live localhost `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
  - real Windows Edge Stage 535 and Stage 536 runs
  - targeted `git diff --check -- ...` over the touched files, with repo-wide `git diff --check` still blocked by pre-existing trailing whitespace in `docs/assistant/runtime/BOOTSTRAP_STATE.json`
- Real Windows Edge Stage 535 validation against `http://127.0.0.1:8000` recorded:
  - runtime browser `msedge` with `headless: true`
  - three visible grouped-overview cards with a measured `257.47px` height spread between the tallest `Captures` card (`474.33px`) and the shorter `Web` / `Documents` cards (`216.86px`)
  - the stage-scoped grouped-overview footer button class `recall-home-library-section-footer-button-stage535-reset`
- Supporting captures:
  - `output/playwright/stage535-home-wide-top.png`
  - `output/playwright/stage535-home-overview-board-wide-top.png`
  - `output/playwright/stage535-home-overview-columns-wide-top.png`
  - `output/playwright/stage535-home-overview-footer-wide-top.png`
  - `output/playwright/stage535-home-grouped-overview-card-density-and-nonstretch-shell-reset-after-stage534-validation.json`

## Next Recommendation
- Stage 536 should immediately audit this grouped-overview Home pass instead of auto-opening another top-level surface.
- If that audit clears, return `Home`, `Graph`, and original-only `Reader` to refreshed-baseline hold again.
- Keep generated-content `Reader` work explicitly locked:
  - no `Reflowed`, `Simplified`, or `Summary` changes
  - no generated-view UX, transform, placeholder, or mode-routing work
