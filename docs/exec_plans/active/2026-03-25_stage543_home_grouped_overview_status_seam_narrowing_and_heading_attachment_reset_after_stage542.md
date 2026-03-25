# ExecPlan: Stage 543 Home Grouped-Overview Status Seam Narrowing And Heading Attachment Reset After Stage 542

## Summary
- The Stage 542 audit returned the parity track to refreshed-baseline hold; the user explicitly reopened product work.
- Reopen wide-desktop `Home` as the next bounded Recall-parity slice.
- Reduce the remaining grouped-overview shell mismatch by narrowing the status seam and attaching it more clearly to the heading block:
  - demote the broad top-cap feel of the current status seam
  - keep the `All collections` title as the lead heading while making the status summary read like a smaller attached note rather than a shell-wide cap
  - keep the Stage 537 primary-lane plus secondary-stack composition and the Stage 539/541 earlier board-start gains intact
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Implementation Scope
- Update wide-desktop `Home` in:
  - `frontend/src/components/RecallWorkspace.tsx`
  - `frontend/src/index.css`
- Rebalance the grouped-overview shell without widening into organizer-model, backend, or generated-content Reader work:
  - keep the organizer-owned grouped overview as the default collections view
  - keep the same source groups, counts, source rows, and footer affordances
  - narrow or condense the grouped-overview status summary so it no longer spans the shell like a cap
  - attach the status summary more clearly to the heading block while preserving the calmer Stage 541 eyebrow retirement
- Preserve current `Home` continuity:
  - organizer lens, sorting, direction, board/list switching, manual mode, drag-drop, resize, and hide/show stay intact
  - search results and selected-group drill-in behavior remain unchanged
  - the Stage 537 primary-lane and secondary-stack composition must stay intact in board mode
  - the Stage 539/541 tighter board-start seam must remain intact
- Keep the Reader restriction explicit:
  - no `Reflowed`, `Simplified`, or `Summary` work
  - no generated-view UX changes
  - no transform, placeholder, control, or mode-routing changes

## Acceptance
- Wide-desktop grouped-overview `Home` reads more like Recall's organizer-owned overview workspace because the status summary no longer reads like a broad top cap across the shell.
- The grouped-overview title remains primary while the status summary becomes a smaller attached heading note, without regressing the current grouped board composition or earlier board start.
- The grouped-overview seam simplification does not regress list view, search, selected-group drill-in, or the organizer rail.
- `Graph` and original-only `Reader` remain visually and behaviorally stable.

## Validation
- targeted Vitest:
  - `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - `frontend/src/App.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check` for the new Stage 543/544 harness pair
- live `200` checks for:
  - `http://127.0.0.1:8000/recall`
  - `http://127.0.0.1:8000/recall?section=graph`
  - `http://127.0.0.1:8000/reader`
- real Windows Edge Stage 543 run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 543/544 files

## Benchmark Basis
- `docs/ux/recall_benchmark_matrix.md`
- Stage 542 wide-desktop baseline artifacts:
  - `output/playwright/stage542-home-wide-top.png`
  - `output/playwright/stage542-home-overview-board-wide-top.png`
  - `output/playwright/stage542-home-overview-status-seam-wide-top.png`
  - `output/playwright/stage542-graph-wide-top.png`
  - `output/playwright/stage542-reader-original-wide-top.png`
- Recall `Home` benchmark sources already tracked in the matrix:
  - user-provided March 18, 2026 Home screenshot
  - Recall docs and tagging deep dive
  - release notes and changelog links already listed in the matrix

## Assumptions
- The current grouped-overview data model already exposes enough local structure to condense and reposition the status seam without changing organizer semantics or storage.
- This slice should stay default-state overview focused instead of reopening selected-group drill-in or organizer-rail behavior.
- Stage 544 should immediately audit this Home pass instead of auto-opening another top-level surface.

## Outcome
- Complete. Wide-desktop `Home` now keeps the grouped-overview status seam as a narrower attached heading note instead of a shell-wide cap while preserving the Stage 537 dominant `Captures` lane, the attached `Web` / `Documents` stack, and the Stage 539/541 earlier board start.

## Evidence
- `frontend/src/components/RecallWorkspace.tsx` now condenses the grouped-overview seam into a single visible Stage 543 status summary while preserving the fuller details in accessible labeling and hover text.
- `frontend/src/index.css` now narrows and right-attaches the grouped-overview status seam so it reads like a smaller heading note rather than a broad shell cap.
- `frontend/src/components/RecallWorkspace.stage37.test.tsx` now asserts the Stage 543 shell/header/meta classes plus the hidden full-detail tooltip and the removal of visible `groups` / `Board` copy from the narrowed seam.
- `scripts/playwright/stage543_home_grouped_overview_status_seam_narrowing_and_heading_attachment_reset_after_stage542.mjs` passed in real Windows Edge against `http://127.0.0.1:8000`.
- The Stage 543 live validation recorded a `63.98px` grouped-overview grid offset, a `60.75px` header height, a `107.69px` status block width, an `8.8px` status block height, a `38.08px` status top offset, and the preserved `247.44px` primary-width delta.

## Next Recommendation
- The paired Stage 544 audit is now complete; return `Home`, `Graph`, and original-only `Reader` to refreshed-baseline hold again.
- If the user explicitly reopens another bounded parity pass, `Home` remains the likeliest next target.
- Keep generated-content `Reader` work explicitly locked:
  - no `Reflowed`, `Simplified`, or `Summary` changes
  - no generated-view UX, transform, placeholder, or mode-routing work
