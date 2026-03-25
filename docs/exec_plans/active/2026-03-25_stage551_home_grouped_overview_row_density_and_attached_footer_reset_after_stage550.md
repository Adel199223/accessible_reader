# ExecPlan: Stage 551 Home Grouped-Overview Row Density And Attached Footer Reset After Stage 550

## Summary
- The Stage 550 audit returned the parity track to refreshed-baseline hold; the user explicitly reopened product work.
- Reopen wide-desktop `Home` as the next bounded Recall-parity slice.
- Reduce the next remaining grouped-overview mismatch inside the card bodies by making overview rows read more like source-list entries than mini preview cards:
  - retire the third-line source-preview detail inside grouped-overview board rows
  - tighten grouped-overview row padding and minimum row height
  - compact the grouped-overview `Show all ... sources` footer into attached continuation
  - preserve the Stage 547 lean title seam, the Stage 549 lean card tops, and the Stage 537 dominant `Captures` lane plus attached `Web` / `Documents` stack
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Implementation Scope
- Update wide-desktop `Home` in:
  - `frontend/src/components/RecallWorkspace.tsx`
  - `frontend/src/index.css`
- Rebalance only the grouped-overview board-mode card bodies without widening into organizer-model, backend, or generated-content Reader work:
  - keep the organizer-owned grouped overview as the default collections view
  - keep the same source groups, counts, source rows, and footer behavior
  - retire the visible preview-detail line inside grouped-overview board rows so rows scan like denser source list entries
  - compact the grouped-overview footer button so it reads as attached continuation instead of a full-height stop
  - preserve enough row context that each source still feels identifiable and reopen-ready at a glance
- Preserve current `Home` continuity:
  - organizer lens, sorting, direction, board/list switching, manual mode, drag-drop, resize, and hide/show stay intact
  - search results and selected-group drill-in behavior remain unchanged
  - the Stage 537 primary-lane and secondary-stack composition must stay intact in board mode
  - the Stage 545/547/549 title and card-top seam must remain intact
- Keep the Reader restriction explicit:
  - no `Reflowed`, `Simplified`, or `Summary` work
  - no generated-view UX changes
  - no transform, placeholder, control, or mode-routing changes

## Acceptance
- Wide-desktop grouped-overview `Home` reads more like Recall's organizer-owned overview workspace because grouped-overview board rows no longer spend vertical space on a third-line preview detail.
- The grouped-overview rows become materially denser and the `Captures` footer reads like attached continuation without regressing the title seam, the dominant `Captures` lane, or the attached secondary stack.
- The grouped-overview body simplification does not regress list view, search, selected-group drill-in, or the organizer rail.
- `Graph` and original-only `Reader` remain visually and behaviorally stable.

## Validation
- targeted Vitest:
  - `frontend/src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check` for the new Stage 551/552 harness pair
- live `200` checks for:
  - `http://127.0.0.1:8000/recall`
  - `http://127.0.0.1:8000/recall?section=graph`
  - `http://127.0.0.1:8000/reader`
- real Windows Edge Stage 551 run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 551/552 files

## Benchmark Basis
- `docs/ux/recall_benchmark_matrix.md`
- Stage 550 wide-desktop baseline artifacts:
  - `output/playwright/stage550-home-wide-top.png`
  - `output/playwright/stage550-home-overview-board-wide-top.png`
  - `output/playwright/stage550-home-overview-card-tops-wide-top.png`
  - `output/playwright/stage550-home-overview-lane-composition-wide-top.png`
  - `output/playwright/stage550-graph-wide-top.png`
  - `output/playwright/stage550-reader-original-wide-top.png`
- Recall `Home` benchmark sources already tracked in the matrix:
  - user-provided March 18, 2026 Home screenshot
  - Recall docs and tagging deep dive
  - release notes and changelog links already listed in the matrix

## Assumptions
- The current grouped-overview data model already exposes enough structure to retire board-row preview detail without changing reopen semantics or section identity.
- This slice should stay default-state grouped-overview focused instead of reopening selected-group drill-in or organizer-rail behavior.
- Stage 552 should immediately audit this Home pass instead of auto-opening another top-level surface.

## Outcome
- Completed.
- Wide-desktop `Home` now retires the visible preview-detail line inside grouped-overview board rows, so `Captures`, `Web`, and `Documents` read more like denser source-list lanes than mini preview cards.
- The grouped-overview row shells are materially tighter and the `Captures` footer now reads like attached continuation while keeping the Stage 547 lean title seam, the Stage 549 lean card tops, and the Stage 537 dominant `Captures` lane plus attached secondary stack intact.

## Evidence
- Product updates landed in:
  - `frontend/src/components/RecallWorkspace.tsx`
  - `frontend/src/index.css`
  - `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - `scripts/playwright/stage551_home_grouped_overview_row_density_and_attached_footer_reset_after_stage550.mjs`
  - `scripts/playwright/stage552_post_stage551_home_grouped_overview_row_density_and_attached_footer_audit.mjs`
- Validation passed with:
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- src/components/RecallWorkspace.stage37.test.tsx"`
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
  - `node --check` for the Stage 551/552 harness pair
  - real Windows Edge Stage 551 reset against `http://127.0.0.1:8000`
- The Stage 551 live validation recorded `0` grouped-overview row-detail nodes, a `58.16px` maximum grouped-overview row height, a `13.11px` `Captures` footer button height, the preserved `247.44px` primary-width delta, a `51.06px` grouped-overview grid offset, and a `47.83px` overview header height.
- A broad `frontend/src/App.test.tsx` run was not used as the green gate for this Home-only slice; the focused Home suite plus live Edge evidence remained the checkpoint gate.

## Next Recommendation
- Stage 552 completed the follow-on audit successfully; return `Home`, `Graph`, and original-only `Reader` to refreshed-baseline hold again.
- If product work reopens, `Home` remains the likeliest next bounded slice.
- Keep generated-content `Reader` work explicitly locked:
  - no `Reflowed`, `Simplified`, or `Summary` changes
  - no generated-view UX, transform, placeholder, or mode-routing work
