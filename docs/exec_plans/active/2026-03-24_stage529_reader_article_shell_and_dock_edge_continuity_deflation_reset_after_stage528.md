# ExecPlan: Stage 529 Reader Article-Shell And Dock-Edge Continuity Deflation Reset After Stage 528

## Summary
- Reopen original-only `Reader` from the post-Stage-528 baseline as the next bounded Recall-parity slice.
- Reduce the remaining wide-desktop Reader mismatch by flattening the article shell and tightening dock-edge continuity so the reading deck behaves more like one attached reading surface with a companion rail instead of two bordered cards.
- Keep generated-content Reader work completely out of scope: no `Reflowed`, `Simplified`, or `Summary` workflow changes, no transform logic changes, and no mode-routing changes.

## Scope
- Rework original-only `Reader` in `frontend/src/components/ReaderWorkspace.tsx` and `frontend/src/index.css`.
- Keep the original article more obviously primary by calming the deck framing:
  - soften the original-only document-shell and article-shell framing where it still reads like a nested card
  - reduce the visible gutter and shell padding between the article lane and the dock
  - flatten the original-only dock edge so it reads more like an attached companion rail than a second destination card
- Preserve current original-only behaviors:
  - `/reader` route compatibility
  - browser-native read aloud
  - sentence highlighting
  - anchored note capture and reopen
  - source-library access
  - Recall shell handoff into Notes, Graph, and Study
- Keep `Home` and `Graph` as regression surfaces only during this stage.

## Guardrails
- Do not touch generated-content Reader workflows anywhere in this stage.
- Keep Reader original-only and cosmetic-only in this track:
  - no `Reflowed`
  - no `Simplified`
  - no `Summary`
  - no generated-view UX
  - no transform logic
  - no generated placeholders
  - no generated-view controls
  - no mode-routing changes
- Do not widen into `Home`, `Graph`, `Notes`, `Study`, or backend implementation work unless a tiny shared-shell adjustment is required for the Reader reset to read correctly.
- Avoid micro-stage churn: make one broader original-only Reader deck-framing correction around article-shell flattening and dock-edge continuity rather than reopening another chain of smaller trims.

## Acceptance
- Wide-desktop original-only `Reader` reads more like one dominant article surface with an attached companion rail.
- The article shell feels less boxed and inset while preserving text comfort and sentence-selection behavior.
- The dock stays usable for source switching and notes continuity while reading more like an attached edge of the same deck.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- targeted Vitest for `frontend/src/App.test.tsx`
- targeted Vitest for `frontend/src/components/ReaderSurface.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check` for the Stage 529/530 harness pair
- live localhost GET checks for `/reader`, `/recall`, and `/recall?section=graph`
- real Windows Edge Stage 529 run against `http://127.0.0.1:8000`
- `git diff --check`

## Outcome
- Complete.
- Original-only `Reader` now removes the remaining wide-desktop document-shell gutter and attached-card mismatch by letting the article shell run flush to the reading lane while the dock snaps in as a full-height companion rail.
- Generated-content `Reader` work stayed fully locked: no `Reflowed`, `Simplified`, `Summary`, transform, placeholder, or mode-routing changes were made anywhere in this pass.

## Evidence
- CSS-only product correction in `frontend/src/index.css`; no component or backend logic changes were required once the deck join was targeted directly.
- New Reader-only harness pair:
  - `scripts/playwright/stage529_reader_article_shell_and_dock_edge_continuity_deflation_reset_after_stage528.mjs`
  - `scripts/playwright/stage530_post_stage529_reader_article_shell_and_dock_edge_continuity_audit.mjs`
- Real Windows Edge Stage 529 validation against `http://127.0.0.1:8000` recorded:
  - `0px` deck gap
  - `0px` document-shell inset on both sides
  - `12px` article top-right radius and `12px` dock top-left radius
  - `-2.23px` article-to-dock gap / `2.23px` seam overlap
  - `882.73px` article width, `226.24px` dock width, and a `3.9` article-to-dock ratio
- Supporting captures:
  - `output/playwright/stage529-reader-original-wide-top.png`
  - `output/playwright/stage529-reader-deck-join-wide-top.png`
  - `output/playwright/stage529-reader-article-lead-wide-top.png`
  - `output/playwright/stage529-reader-dock-edge-wide-top.png`

## Next Recommendation
- Stage 530 should immediately audit this Reader reset instead of auto-opening another top-level surface.
- Keep generated-content Reader work explicitly locked:
  - no `Reflowed`, `Simplified`, or `Summary` changes
  - no generated-view UX, transform, or mode-routing work
