# ExecPlan: Stage 545 Home Grouped-Overview Inline Title Status Join And Left Cluster Anchor Reset After Stage 544

## Summary
- The Stage 544 audit returned the parity track to refreshed-baseline hold; the user explicitly reopened product work.
- Reopen wide-desktop `Home` as the next bounded Recall-parity slice.
- Reduce the remaining grouped-overview header mismatch by joining the condensed status note directly into the `All collections` title row so it reads as part of the left heading cluster instead of drifting toward the middle of the shell:
  - keep the Stage 543 condensed status copy
  - re-anchor that note to the title row rather than a separate seam slot
  - preserve the Stage 537 dominant `Captures` lane, the attached `Web` / `Documents` stack, and the Stage 539/541 earlier board start
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Implementation Scope
- Update wide-desktop `Home` in:
  - `frontend/src/components/RecallWorkspace.tsx`
  - `frontend/src/index.css`
- Rebalance the grouped-overview heading cluster without widening into organizer-model, backend, or generated-content Reader work:
  - keep the organizer-owned grouped overview as the default collections view
  - keep the same source groups, counts, source rows, and footer affordances
  - keep the Stage 543 condensed status text and accessible full-detail labeling
  - move the condensed status note into the `All collections` title row so the left heading cluster owns the seam
  - avoid reviving the old eyebrow, broad status cap, or a detached right-side chip strip
- Preserve current `Home` continuity:
  - organizer lens, sorting, direction, board/list switching, manual mode, drag-drop, resize, and hide/show stay intact
  - search results and selected-group drill-in behavior remain unchanged
  - the Stage 537 primary-lane and secondary-stack composition must stay intact in board mode
  - the Stage 539/541 earlier board start must remain intact
- Keep the Reader restriction explicit:
  - no `Reflowed`, `Simplified`, or `Summary` work
  - no generated-view UX changes
  - no transform, placeholder, control, or mode-routing changes

## Acceptance
- Wide-desktop grouped-overview `Home` reads more like Recall's organizer-owned overview workspace because the condensed status note now belongs to the `All collections` heading cluster instead of floating toward the middle of the shell.
- The grouped-overview title remains primary while the condensed status note becomes an inline attached title-row detail without regressing the current grouped board composition or earlier board start.
- The grouped-overview heading simplification does not regress list view, search, selected-group drill-in, or the organizer rail.
- `Graph` and original-only `Reader` remain visually and behaviorally stable.

## Validation
- targeted Vitest:
  - `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - `frontend/src/App.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check` for the new Stage 545/546 harness pair
- live `200` checks for:
  - `http://127.0.0.1:8000/recall`
  - `http://127.0.0.1:8000/recall?section=graph`
  - `http://127.0.0.1:8000/reader`
- real Windows Edge Stage 545 run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 545/546 files

## Benchmark Basis
- `docs/ux/recall_benchmark_matrix.md`
- Stage 544 wide-desktop baseline artifacts:
  - `output/playwright/stage544-home-wide-top.png`
  - `output/playwright/stage544-home-overview-board-wide-top.png`
  - `output/playwright/stage544-home-overview-status-seam-wide-top.png`
  - `output/playwright/stage544-graph-wide-top.png`
  - `output/playwright/stage544-reader-original-wide-top.png`
- Recall `Home` benchmark sources already tracked in the matrix:
  - user-provided March 18, 2026 Home screenshot
  - Recall docs and tagging deep dive
  - release notes and changelog links already listed in the matrix

## Assumptions
- The current grouped-overview data model already exposes enough local structure to move the condensed note into the title row without changing organizer semantics or storage.
- This slice should stay default-state overview focused instead of reopening selected-group drill-in or organizer-rail behavior.
- Stage 546 should immediately audit this Home pass instead of auto-opening another top-level surface.

## Outcome
- Complete. Wide-desktop `Home` now joins the condensed grouped-overview status note directly into the `All collections` title row so the left heading cluster owns the seam while the Stage 537 dominant `Captures` lane, the attached `Web` / `Documents` stack, and the Stage 539/541 earlier board start stay intact.

## Evidence
- `frontend/src/components/RecallWorkspace.tsx` now renders the condensed grouped-overview status note inside the title row while preserving the fuller details in accessible labeling and hover text.
- `frontend/src/index.css` now styles the grouped-overview title row as one attached cluster so the condensed note aligns inline with `All collections` instead of drifting toward the middle of the shell.
- `frontend/src/components/RecallWorkspace.stage37.test.tsx` now asserts the Stage 545 shell/header/title-row/meta classes and verifies that the condensed status note lives inside the title row.
- `scripts/playwright/stage545_home_grouped_overview_inline_title_status_join_and_left_cluster_anchor_reset_after_stage544.mjs` passed in real Windows Edge against `http://127.0.0.1:8000`.
- The Stage 545 live validation recorded a `63.83px` grouped-overview grid offset, a `60.59px` header height, a `7.67px` title-status inline gap, a `107.03px` left offset from the overview shell, a `107.48px` status block width, a `3.59px` title-status top delta, and the preserved `247.44px` primary-width delta.

## Next Recommendation
- The paired Stage 546 audit is now complete; return `Home`, `Graph`, and original-only `Reader` to refreshed-baseline hold again.
- If the user explicitly reopens another bounded parity pass, `Home` remains the likeliest next target.
- Keep generated-content `Reader` work explicitly locked:
  - no `Reflowed`, `Simplified`, or `Summary` changes
  - no generated-view UX, transform, placeholder, or mode-routing work
