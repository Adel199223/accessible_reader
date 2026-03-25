# ExecPlan: Stage 537 Home Grouped-Overview Primary Lane And Secondary Stack Reset After Stage 536

## Summary
- The Stage 536 audit returned the parity track to refreshed-baseline hold; the user explicitly reopened product work.
- Reopen wide-desktop `Home` as the next bounded Recall-parity slice.
- Reduce the remaining grouped-overview mismatch by rebalancing the default board into a stronger primary working lane plus a tighter secondary stack:
  - let the dominant `Captures` group read like the main overview lane instead of one equal-width third
  - compact the shorter `Web` and `Documents` groups into a calmer attached secondary stack
  - reduce the remaining dead page area that still comes from treating all three overview groups as equal-width columns
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Implementation Scope
- Update wide-desktop `Home` in:
  - `frontend/src/components/RecallWorkspace.tsx`
  - `frontend/src/index.css`
- Rebalance the grouped-overview board without widening into organizer-model, backend, or generated-content Reader work:
  - keep the organizer-owned grouped overview as the default collections view
  - keep the same source groups, counts, rows, and footer affordances
  - turn the current equal-width three-card board into a more deliberate overview composition where the primary lane carries the dominant source type and the shorter groups stack more compactly beside it
- Preserve current `Home` continuity:
  - organizer lens, sorting, direction, board/list switching, manual mode, drag-drop, resize, and hide/show stay intact
  - search results and selected-group drill-in behavior remain unchanged
  - list view should remain unaffected unless the asymmetry is explicitly tied to the grouped board state
- Keep the Reader restriction explicit:
  - no `Reflowed`, `Simplified`, or `Summary` work
  - no generated-view UX changes
  - no transform, placeholder, control, or mode-routing changes

## Acceptance
- Wide-desktop grouped-overview `Home` reads more like Recall’s organizer-owned overview workspace because the dominant source group now feels like the primary working lane and the shorter groups read like a tighter secondary stack instead of equal-width mini-columns.
- The grouped-overview board keeps the same information and organizer continuity, but the composition reduces the remaining dead lower-right page area above the fold.
- The grouped-overview rebalance does not regress list view, search, selected-group drill-in, or the organizer rail.
- `Graph` and original-only `Reader` remain visually and behaviorally stable.

## Validation
- targeted Vitest:
  - `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - `frontend/src/App.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check` for the new Stage 537/538 harness pair
- live `200` checks for:
  - `http://127.0.0.1:8000/recall`
  - `http://127.0.0.1:8000/recall?section=graph`
  - `http://127.0.0.1:8000/reader`
- real Windows Edge Stage 537 run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 537/538 files

## Benchmark Basis
- `docs/ux/recall_benchmark_matrix.md`
- Stage 536 wide-desktop baseline artifacts:
  - `output/playwright/stage536-home-wide-top.png`
  - `output/playwright/stage536-graph-wide-top.png`
  - `output/playwright/stage536-reader-original-wide-top.png`
- Recall `Home` benchmark sources already tracked in the matrix:
  - user-provided March 18, 2026 Home screenshot
  - Recall docs and tagging deep dive
  - release notes and changelog links already listed in the matrix

## Assumptions
- The current grouped-overview data model already exposes enough local structure to rebalance the board composition without changing organizer semantics or storage.
- This slice should stay default-state overview focused instead of reopening selected-group drill-in or organizer-rail behavior.
- Stage 538 should immediately audit this Home pass instead of auto-opening another top-level surface.

## Outcome
- Complete.
- Wide-desktop `Home` now gives the grouped overview a truer dominant working lane by letting the larger `Captures` group take the primary column while the shorter `Web` and `Documents` groups compact into a tighter attached secondary stack.
- The grouped overview kept the same organizer-owned default structure, counts, source rows, and footer actions while materially reducing the remaining dead lower-right area above the fold.
- `Graph` and original-only `Reader` stayed regression surfaces only, and generated-content `Reader` work remained fully locked.

## Evidence
- Product correction in:
  - `frontend/src/components/RecallWorkspace.tsx`
  - `frontend/src/index.css`
  - `frontend/src/components/RecallWorkspace.stage37.test.tsx`
- New Home harness pair:
  - `scripts/playwright/stage537_home_grouped_overview_primary_lane_and_secondary_stack_reset_after_stage536.mjs`
  - `scripts/playwright/stage538_post_stage537_home_grouped_overview_primary_lane_and_secondary_stack_audit.mjs`
- Validation remained green:
  - targeted Vitest for `frontend/src/components/RecallWorkspace.stage37.test.tsx` and `frontend/src/App.test.tsx`
  - `npm run lint`
  - `npm run build`
  - `node --check` for the Stage 537/538 harness pair
  - live localhost `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
  - real Windows Edge Stage 537 and Stage 538 runs
  - targeted `git diff --check -- ...` over the touched files, with repo-wide `git diff --check` still blocked by pre-existing trailing whitespace in `docs/assistant/runtime/BOOTSTRAP_STATE.json`
- Real Windows Edge Stage 537 validation against `http://127.0.0.1:8000` recorded:
  - runtime browser `msedge` with `headless: true`
  - three visible grouped-overview cards with the `Captures` lane widened to `720.48px` while `Web` and `Documents` held at `473.16px`
  - a measured `247.32px` primary-width delta, `0px` secondary-column x spread, and `239.08px` secondary row-top offset
- Supporting captures:
  - `output/playwright/stage537-home-wide-top.png`
  - `output/playwright/stage537-home-overview-board-wide-top.png`
  - `output/playwright/stage537-home-overview-lane-composition-wide-top.png`
  - `output/playwright/stage537-home-overview-secondary-stack-wide-top.png`
  - `output/playwright/stage537-home-grouped-overview-primary-lane-and-secondary-stack-reset-after-stage536-validation.json`

## Next Recommendation
- Stage 538 should immediately audit this grouped-overview Home pass instead of auto-opening another top-level surface.
- If that audit clears, return `Home`, `Graph`, and original-only `Reader` to refreshed-baseline hold again.
- Keep generated-content `Reader` work explicitly locked:
  - no `Reflowed`, `Simplified`, or `Summary` changes
  - no generated-view UX, transform, placeholder, or mode-routing work
