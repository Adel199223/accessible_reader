# ExecPlan: Stage 549 Home Grouped-Overview Card Intro-Copy Retirement And Earlier Row-Start Reset After Stage 548

## Summary
- The Stage 548 audit returned the parity track to refreshed-baseline hold; the user explicitly reopened product work.
- Reopen wide-desktop `Home` as the next bounded Recall-parity slice.
- Reduce the next remaining grouped-overview mismatch by retiring or materially demoting the repeated intro-copy paragraph inside each grouped-overview card so source rows start earlier and the board reads less like three explanatory panels:
  - keep the Stage 547 lean title cluster without the default-state helper sentence
  - preserve the Stage 545 inline title-status join
  - preserve the Stage 537 dominant `Captures` lane plus attached `Web` / `Documents` stack
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Implementation Scope
- Update wide-desktop `Home` in:
  - `frontend/src/components/RecallWorkspace.tsx`
  - `frontend/src/index.css`
- Rebalance only the grouped-overview card headers without widening into organizer-model, backend, or generated-content Reader work:
  - keep the organizer-owned grouped overview as the default collections view
  - keep the same source groups, counts, source rows, and footer affordances
  - retire or materially demote the visible card intro-copy paragraphs so grouped-overview source rows begin earlier
  - preserve enough card identity that `Captures`, `Web`, and `Documents` still scan clearly at a glance
- Preserve current `Home` continuity:
  - organizer lens, sorting, direction, board/list switching, manual mode, drag-drop, resize, and hide/show stay intact
  - search results and selected-group drill-in behavior remain unchanged
  - the Stage 537 primary-lane and secondary-stack composition must stay intact in board mode
  - the Stage 539 earlier board start plus the Stage 545/547 lean title seam must remain intact
- Keep the Reader restriction explicit:
  - no `Reflowed`, `Simplified`, or `Summary` work
  - no generated-view UX changes
  - no transform, placeholder, control, or mode-routing changes

## Acceptance
- Wide-desktop grouped-overview `Home` reads more like Recall's organizer-owned overview workspace because the three grouped-overview cards stop spending a visible explanatory band on intro copy before the actual source rows begin.
- The grouped-overview cards start their first visible source rows earlier without regressing the title seam, the dominant `Captures` lane, or the attached secondary stack.
- The card-header simplification does not regress list view, search, selected-group drill-in, or the organizer rail.
- `Graph` and original-only `Reader` remain visually and behaviorally stable.

## Validation
- targeted Vitest:
  - `frontend/src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check` for the new Stage 549/550 harness pair
- live `200` checks for:
  - `http://127.0.0.1:8000/recall`
  - `http://127.0.0.1:8000/recall?section=graph`
  - `http://127.0.0.1:8000/reader`
- real Windows Edge Stage 549 run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 549/550 files

## Benchmark Basis
- `docs/ux/recall_benchmark_matrix.md`
- Stage 548 wide-desktop baseline artifacts:
  - `output/playwright/stage548-home-wide-top.png`
  - `output/playwright/stage548-home-overview-board-wide-top.png`
  - `output/playwright/stage548-home-overview-lean-title-wide-top.png`
  - `output/playwright/stage548-home-overview-lane-composition-wide-top.png`
  - `output/playwright/stage548-graph-wide-top.png`
  - `output/playwright/stage548-reader-original-wide-top.png`
- Recall `Home` benchmark sources already tracked in the matrix:
  - user-provided March 18, 2026 Home screenshot
  - Recall docs and tagging deep dive
  - release notes and changelog links already listed in the matrix

## Assumptions
- The current grouped-overview data model already exposes enough local structure to retire visible card intro copy without changing section identity or organizer semantics.
- This slice should stay default-state overview focused instead of reopening selected-group drill-in or organizer-rail behavior.
- Stage 550 should immediately audit this Home pass instead of auto-opening another top-level surface.

## Outcome
- Completed.
- Wide-desktop `Home` now retires the visible intro-copy paragraph inside each grouped-overview card, so `Captures`, `Web`, and `Documents` read more like active source lanes than explanatory panels.
- The grouped-overview cards now start their first visible source rows materially earlier while keeping the Stage 547 lean title seam, the Stage 545 inline title-status join, and the Stage 537 dominant `Captures` lane plus attached `Web` / `Documents` stack intact.

## Evidence
- Product updates landed in:
  - `frontend/src/components/RecallWorkspace.tsx`
  - `frontend/src/index.css`
  - `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - `scripts/playwright/stage549_home_grouped_overview_card_intro_copy_retirement_and_earlier_row_start_reset_after_stage548.mjs`
  - `scripts/playwright/stage550_post_stage549_home_grouped_overview_card_intro_copy_retirement_and_earlier_row_start_audit.mjs`
- Validation passed with:
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- src/components/RecallWorkspace.stage37.test.tsx"`
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
  - `node --check` for the Stage 549/550 harness pair
  - live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
  - real Windows Edge Stage 549 reset against `http://127.0.0.1:8000`
- The Stage 549 live validation recorded `0` grouped-overview card header paragraphs, a `14.5px` maximum card header height, a `21.61px` maximum first-row offset, a `1.95px` maximum header-to-row gap, the preserved `247.44px` primary-width delta, a `51.06px` grouped-overview grid offset, and a `47.83px` overview header height.
- A broad `frontend/src/App.test.tsx` run was not used as the green gate for this Home-only slice; the focused Home suite plus live Edge evidence remained the checkpoint gate.

## Next Recommendation
- Stage 550 completed the follow-on audit successfully; return `Home`, `Graph`, and original-only `Reader` to refreshed-baseline hold again.
- If product work reopens, `Home` remains the likeliest next bounded slice.
- Keep generated-content `Reader` work explicitly locked:
  - no `Reflowed`, `Simplified`, or `Summary` changes
  - no generated-view UX, transform, placeholder, or mode-routing work
