# ExecPlan: Stage 547 Home Grouped-Overview Helper Note Retirement And Leaner Title Cluster Reset After Stage 546

## Summary
- The Stage 546 audit returned the parity track to refreshed-baseline hold; the user explicitly reopened product work.
- Reopen wide-desktop `Home` as the next bounded Recall-parity slice.
- Reduce the remaining grouped-overview header mismatch by retiring or demoting the default-state helper sentence beneath the `All collections` title cluster so the header reads less like an explanatory band:
  - keep the Stage 545 inline title-status join
  - remove the remaining broad helper-line feel in the default grouped-overview state
  - preserve the Stage 537 dominant `Captures` lane, the attached `Web` / `Documents` stack, and the Stage 539/541 earlier board start
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Implementation Scope
- Update wide-desktop `Home` in:
  - `frontend/src/components/RecallWorkspace.tsx`
  - `frontend/src/index.css`
- Rebalance the grouped-overview heading cluster without widening into organizer-model, backend, or generated-content Reader work:
  - keep the organizer-owned grouped overview as the default collections view
  - keep the same source groups, counts, source rows, and footer affordances
  - keep the Stage 545 inline condensed status note beside `All collections`
  - retire or materially demote the default-state helper sentence so the grouped overview no longer reads like it has a separate explanatory band below the title
  - keep any hidden-organizer fallback guidance only if needed for continuity, but do not let it revive the old default-state cap
- Preserve current `Home` continuity:
  - organizer lens, sorting, direction, board/list switching, manual mode, drag-drop, resize, and hide/show stay intact
  - search results and selected-group drill-in behavior remain unchanged
  - the Stage 537 primary-lane and secondary-stack composition must stay intact in board mode
  - the Stage 539/541 earlier board start and the Stage 545 inline title-status join must remain intact
- Keep the Reader restriction explicit:
  - no `Reflowed`, `Simplified`, or `Summary` work
  - no generated-view UX changes
  - no transform, placeholder, control, or mode-routing changes

## Acceptance
- Wide-desktop grouped-overview `Home` reads more like Recall's organizer-owned overview workspace because the title cluster no longer carries a separate default-state helper sentence beneath it.
- The grouped-overview title plus condensed status note remain primary while the default-state header becomes leaner without regressing the current grouped board composition or earlier board start.
- The grouped-overview heading simplification does not regress list view, search, selected-group drill-in, or the organizer rail.
- `Graph` and original-only `Reader` remain visually and behaviorally stable.

## Validation
- targeted Vitest:
  - `frontend/src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check` for the new Stage 547/548 harness pair
- live `200` checks for:
  - `http://127.0.0.1:8000/recall`
  - `http://127.0.0.1:8000/recall?section=graph`
  - `http://127.0.0.1:8000/reader`
- real Windows Edge Stage 547 run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 547/548 files

## Benchmark Basis
- `docs/ux/recall_benchmark_matrix.md`
- Stage 546 wide-desktop baseline artifacts:
  - `output/playwright/stage546-home-wide-top.png`
  - `output/playwright/stage546-home-overview-board-wide-top.png`
  - `output/playwright/stage546-home-overview-title-status-wide-top.png`
  - `output/playwright/stage546-graph-wide-top.png`
  - `output/playwright/stage546-reader-original-wide-top.png`
- Recall `Home` benchmark sources already tracked in the matrix:
  - user-provided March 18, 2026 Home screenshot
  - Recall docs and tagging deep dive
  - release notes and changelog links already listed in the matrix

## Assumptions
- The current grouped-overview data model already exposes enough local structure to retire or demote the default-state helper sentence without changing organizer semantics or storage.
- This slice should stay default-state overview focused instead of reopening selected-group drill-in or organizer-rail behavior.
- Stage 548 should immediately audit this Home pass instead of auto-opening another top-level surface.

## Outcome
- Completed.
- Wide-desktop `Home` now retires the default-state grouped-overview helper sentence beneath `All collections`, so the Stage 545 inline title-status join owns the header seam without a leftover explanatory band beneath it.
- The hidden-organizer fallback guidance still appears only when the organizer is closed, while the default grouped-overview state keeps the Stage 537 dominant `Captures` lane, the attached `Web` / `Documents` stack, and the Stage 539 earlier board start intact.

## Evidence
- Product updates landed in:
  - `frontend/src/components/RecallWorkspace.tsx`
  - `frontend/src/index.css`
  - `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - `scripts/playwright/stage547_home_grouped_overview_helper_note_retirement_and_leaner_title_cluster_reset_after_stage546.mjs`
  - `scripts/playwright/stage548_post_stage547_home_grouped_overview_helper_note_retirement_and_leaner_title_cluster_audit.mjs`
- Validation passed with:
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- src/components/RecallWorkspace.stage37.test.tsx"`
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
  - `node --check` for the Stage 547/548 harness pair
  - live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
  - real Windows Edge Stage 547 reset against `http://127.0.0.1:8000`
- The Stage 547 live validation recorded `headerParagraphCount: 0`, a `51.06px` grouped-overview grid offset, a `47.83px` overview header height, a `7.67px` title-status inline gap, a `107.03px` status left offset, a `107.48px` status block width, a `3.67px` title-status top delta, and the preserved `247.44px` primary-width delta.
- A broad `frontend/src/App.test.tsx` graph-browse spot check was attempted, but that file's existing graph browse test currently times out at Vitest's default `5000ms` ceiling in this environment, so the green gate for this Home-only slice stayed on the targeted Home coverage plus live Edge evidence.

## Next Recommendation
- Stage 548 completed the follow-on audit successfully; return `Home`, `Graph`, and original-only `Reader` to refreshed-baseline hold again.
- If product work reopens, `Home` remains the likeliest next bounded slice.
- Keep generated-content `Reader` work explicitly locked:
  - no `Reflowed`, `Simplified`, or `Summary` changes
  - no generated-view UX, transform, placeholder, or mode-routing work
