# ExecPlan: Stage 539 Home Grouped-Overview Header Seam Compaction And Earlier Board Start Reset After Stage 538

## Summary
- The Stage 538 audit returned the parity track to refreshed-baseline hold; the user explicitly reopened product work.
- Reopen wide-desktop `Home` as the next bounded Recall-parity slice.
- Reduce the remaining grouped-overview mismatch by compacting the overview shell’s title/helper seam so the working cards start earlier:
  - trim the vertical band between the grouped-overview title and the first visible cards
  - keep the primary-lane plus secondary-stack composition from Stage 537/538 intact
  - make the grouped overview read less like a padded panel intro and more like an already-open working board
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Implementation Scope
- Update wide-desktop `Home` in:
  - `frontend/src/components/RecallWorkspace.tsx`
  - `frontend/src/index.css`
- Rebalance the grouped-overview shell without widening into organizer-model, backend, or generated-content Reader work:
  - keep the organizer-owned grouped overview as the default collections view
  - keep the same source groups, counts, source rows, status chips, and footer affordances
  - compact the grouped-overview header seam by tightening the eyebrow/title/helper rhythm, metadata alignment, and board-start spacing before the cards
- Preserve current `Home` continuity:
  - organizer lens, sorting, direction, board/list switching, manual mode, drag-drop, resize, and hide/show stay intact
  - search results and selected-group drill-in behavior remain unchanged
  - the Stage 537 primary-lane and secondary-stack composition must stay intact in board mode
- Keep the Reader restriction explicit:
  - no `Reflowed`, `Simplified`, or `Summary` work
  - no generated-view UX changes
  - no transform, placeholder, control, or mode-routing changes

## Acceptance
- Wide-desktop grouped-overview `Home` reads more like Recall’s organizer-owned overview workspace because the grouped board starts earlier and carries less dead title/helper banding above the cards.
- The grouped overview keeps the same information, primary-lane plus secondary-stack composition, and organizer continuity, but the shell now feels more like an already-open workspace than a padded intro panel.
- The grouped-overview compaction does not regress list view, search, selected-group drill-in, or the organizer rail.
- `Graph` and original-only `Reader` remain visually and behaviorally stable.

## Validation
- targeted Vitest:
  - `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - `frontend/src/App.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check` for the new Stage 539/540 harness pair
- live `200` checks for:
  - `http://127.0.0.1:8000/recall`
  - `http://127.0.0.1:8000/recall?section=graph`
  - `http://127.0.0.1:8000/reader`
- real Windows Edge Stage 539 run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 539/540 files

## Benchmark Basis
- `docs/ux/recall_benchmark_matrix.md`
- Stage 538 wide-desktop baseline artifacts:
  - `output/playwright/stage538-home-wide-top.png`
  - `output/playwright/stage538-home-overview-board-wide-top.png`
  - `output/playwright/stage538-graph-wide-top.png`
  - `output/playwright/stage538-reader-original-wide-top.png`
- Recall `Home` benchmark sources already tracked in the matrix:
  - user-provided March 18, 2026 Home screenshot
  - Recall docs and tagging deep dive
  - release notes and changelog links already listed in the matrix

## Assumptions
- The current grouped-overview data model already exposes enough local structure to compact the shell’s top seam without changing organizer semantics or storage.
- This slice should stay default-state overview focused instead of reopening selected-group drill-in or organizer-rail behavior.
- Stage 540 should immediately audit this Home pass instead of auto-opening another top-level surface.

## Outcome
- Complete.
- Wide-desktop `Home` now gives the grouped overview an earlier board start by tightening the title/helper seam, shortening the helper copy, and letting the grouped-overview shell hand off to the cards with far less dead intro banding.
- The grouped overview kept the Stage 537 primary-lane plus secondary-stack composition, the same organizer-owned default structure, counts, source rows, and footer actions while making the board read more like an already-open workspace.
- `Graph` and original-only `Reader` stayed regression surfaces only, and generated-content `Reader` work remained fully locked.

## Evidence
- Product correction in:
  - `frontend/src/components/RecallWorkspace.tsx`
  - `frontend/src/index.css`
  - `frontend/src/components/RecallWorkspace.stage37.test.tsx`
- New Home harness pair:
  - `scripts/playwright/stage539_home_grouped_overview_header_seam_compaction_and_earlier_board_start_reset_after_stage538.mjs`
  - `scripts/playwright/stage540_post_stage539_home_grouped_overview_header_seam_compaction_and_earlier_board_start_audit.mjs`
- Validation remained green:
  - targeted Vitest for `frontend/src/components/RecallWorkspace.stage37.test.tsx` and `frontend/src/App.test.tsx`
  - `npm run lint`
  - `npm run build`
  - `node --check` for the Stage 539/540 harness pair
  - live localhost `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
  - real Windows Edge Stage 539 and Stage 540 runs
  - targeted `git diff --check -- ...` over the touched files, with repo-wide `git diff --check` still blocked by pre-existing trailing whitespace in `docs/assistant/runtime/BOOTSTRAP_STATE.json`
- Real Windows Edge Stage 539 validation against `http://127.0.0.1:8000` recorded:
  - runtime browser `msedge` with `headless: true`
  - an `80.97px` grouped-overview grid offset from the shell top, a `77.73px` overview header height, and a `2.23px` seam between the header and the cards
  - the Stage 537 lane composition still intact with a `247.44px` primary-width delta, `0px` secondary-column x spread, and `238.75px` secondary row-top offset
- Supporting captures:
  - `output/playwright/stage539-home-wide-top.png`
  - `output/playwright/stage539-home-overview-board-wide-top.png`
  - `output/playwright/stage539-home-overview-header-seam-wide-top.png`
  - `output/playwright/stage539-home-overview-lane-composition-wide-top.png`
  - `output/playwright/stage539-home-overview-secondary-stack-wide-top.png`
  - `output/playwright/stage539-home-grouped-overview-header-seam-compaction-and-earlier-board-start-reset-after-stage538-validation.json`

## Next Recommendation
- Stage 540 should immediately audit this grouped-overview Home pass instead of auto-opening another top-level surface.
- If that audit clears, return `Home`, `Graph`, and original-only `Reader` to refreshed-baseline hold again.
- Keep generated-content `Reader` work explicitly locked:
  - no `Reflowed`, `Simplified`, or `Summary` changes
  - no generated-view UX, transform, placeholder, or mode-routing work
