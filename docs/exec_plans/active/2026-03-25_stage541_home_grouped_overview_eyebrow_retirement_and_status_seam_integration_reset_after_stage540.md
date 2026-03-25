# ExecPlan: Stage 541 Home Grouped-Overview Eyebrow Retirement And Status Seam Integration Reset After Stage 540

## Summary
- The Stage 540 audit returned the parity track to refreshed-baseline hold; the user explicitly reopened product work.
- Reopen wide-desktop `Home` as the next bounded Recall-parity slice.
- Reduce the remaining grouped-overview shell mismatch by retiring the redundant overview eyebrow and integrating the status summary into the title seam:
  - remove the separate eyebrow/top-cap feel above `All collections`
  - demote the grouped-overview status chips so they read like attached title-seam metadata instead of a detached utility strip
  - keep the Stage 537 primary-lane plus secondary-stack composition and the Stage 539 earlier board start intact
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Implementation Scope
- Update wide-desktop `Home` in:
  - `frontend/src/components/RecallWorkspace.tsx`
  - `frontend/src/index.css`
- Rebalance the grouped-overview shell without widening into organizer-model, backend, or generated-content Reader work:
  - keep the organizer-owned grouped overview as the default collections view
  - keep the same source groups, counts, source rows, and footer affordances
  - retire the extra eyebrow band for the grouped overview in default board mode
  - pull the overview status summary into the same title seam and soften its visual weight
- Preserve current `Home` continuity:
  - organizer lens, sorting, direction, board/list switching, manual mode, drag-drop, resize, and hide/show stay intact
  - search results and selected-group drill-in behavior remain unchanged
  - the Stage 537 primary-lane and secondary-stack composition must stay intact in board mode
  - the Stage 539 tighter board-start seam must remain intact
- Keep the Reader restriction explicit:
  - no `Reflowed`, `Simplified`, or `Summary` work
  - no generated-view UX changes
  - no transform, placeholder, control, or mode-routing changes

## Acceptance
- Wide-desktop grouped-overview `Home` reads more like Recall's organizer-owned overview workspace because the shell no longer starts with a separate eyebrow/top-cap strip above `All collections`.
- The grouped-overview title and status summary read as one attached seam rather than two detached header blocks, while the same source groups, counts, and board composition remain intact.
- The grouped-overview simplification does not regress list view, search, selected-group drill-in, or the organizer rail.
- `Graph` and original-only `Reader` remain visually and behaviorally stable.

## Validation
- targeted Vitest:
  - `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - `frontend/src/App.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check` for the new Stage 541/542 harness pair
- live `200` checks for:
  - `http://127.0.0.1:8000/recall`
  - `http://127.0.0.1:8000/recall?section=graph`
  - `http://127.0.0.1:8000/reader`
- real Windows Edge Stage 541 run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 541/542 files

## Benchmark Basis
- `docs/ux/recall_benchmark_matrix.md`
- Stage 540 wide-desktop baseline artifacts:
  - `output/playwright/stage540-home-wide-top.png`
  - `output/playwright/stage540-home-overview-board-wide-top.png`
  - `output/playwright/stage540-home-overview-header-seam-wide-top.png`
  - `output/playwright/stage540-graph-wide-top.png`
  - `output/playwright/stage540-reader-original-wide-top.png`
- Recall `Home` benchmark sources already tracked in the matrix:
  - user-provided March 18, 2026 Home screenshot
  - Recall docs and tagging deep dive
  - release notes and changelog links already listed in the matrix

## Assumptions
- The current grouped-overview data model already exposes enough local structure to retire the extra eyebrow band and integrate the status seam without changing organizer semantics or storage.
- This slice should stay default-state overview focused instead of reopening selected-group drill-in or organizer-rail behavior.
- Stage 542 should immediately audit this Home pass instead of auto-opening another top-level surface.

## Outcome
- Complete.
- Wide-desktop `Home` now starts the grouped overview with `All collections` plus attached seam metadata, retiring the redundant `Collections overview` eyebrow and demoting the old top-right chip strip while keeping the Stage 537 primary lane and Stage 539 earlier board start intact.
- The grouped overview kept the same source groups, counts, source rows, and footer actions while reading less like a framed utility panel and more like an already-open working board.
- `Graph` and original-only `Reader` stayed regression surfaces only, and generated-content `Reader` work remained fully locked.

## Evidence
- Product correction in:
  - `frontend/src/components/RecallWorkspace.tsx`
  - `frontend/src/index.css`
  - `frontend/src/components/RecallWorkspace.stage37.test.tsx`
- New Home harness pair:
  - `scripts/playwright/stage541_home_grouped_overview_eyebrow_retirement_and_status_seam_integration_reset_after_stage540.mjs`
  - `scripts/playwright/stage542_post_stage541_home_grouped_overview_eyebrow_retirement_and_status_seam_integration_audit.mjs`
- Validation remained green:
  - targeted Vitest for `frontend/src/components/RecallWorkspace.stage37.test.tsx` and `frontend/src/App.test.tsx`
  - `npm run lint`
  - `npm run build`
  - `node --check` for the Stage 541/542 harness pair
  - live localhost `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
  - real Windows Edge Stage 541 and Stage 542 runs
  - targeted `git diff --check -- ...` over the touched files, with repo-wide `git diff --check` still blocked by pre-existing trailing whitespace in `docs/assistant/runtime/BOOTSTRAP_STATE.json`
- Real Windows Edge Stage 541 validation against `http://127.0.0.1:8000` recorded:
  - runtime browser `msedge` with `headless: true`
  - a `64.14px` grouped-overview grid offset from the shell top, a `60.91px` overview header height, and a `2.23px` seam between the title seam and the cards
  - a `1px` title-row top offset from the shell top, a `0px` title-status top delta, and a `14.05px` status block height after the eyebrow retirement
  - the Stage 537 lane composition still intact with a `247.44px` primary-width delta, `0px` secondary-column x spread, and `238.75px` secondary row-top offset
- Supporting captures:
  - `output/playwright/stage541-home-wide-top.png`
  - `output/playwright/stage541-home-overview-board-wide-top.png`
  - `output/playwright/stage541-home-overview-status-seam-wide-top.png`
  - `output/playwright/stage541-home-overview-lane-composition-wide-top.png`
  - `output/playwright/stage541-home-overview-secondary-stack-wide-top.png`
  - `output/playwright/stage541-home-grouped-overview-eyebrow-retirement-and-status-seam-integration-reset-after-stage540-validation.json`

## Next Recommendation
- Stage 542 immediately audited this grouped-overview Home pass and cleared it.
- Return `Home`, `Graph`, and original-only `Reader` to refreshed-baseline hold again.
- Keep generated-content `Reader` work explicitly locked:
  - no `Reflowed`, `Simplified`, or `Summary` changes
  - no generated-view UX, transform, placeholder, or mode-routing work
