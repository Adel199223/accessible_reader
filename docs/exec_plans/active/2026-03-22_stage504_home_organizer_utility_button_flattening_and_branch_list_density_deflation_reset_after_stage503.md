# ExecPlan: Stage 504 Home Organizer Utility Button Flattening And Branch List Density Deflation Reset After Stage 503

## Summary
- Stage 503 confirmed that the organizer header and upper control stack no longer lead the remaining `Home` mismatch.
- The next high-leverage `Home` gap sits immediately below that stack: the standalone utility-button seam and the active branch list still read a little more stacked and carded than Recall's leaner organizer rail.
- Bring `Home` closer to Recall's current organizer-owned direction by flattening the utility buttons into the same compact control surface and reducing the visual weight of the selected-branch list beneath them.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Implementation Scope
- Extend wide-desktop `Home` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css`.
- Refine the organizer utility seam:
  - keep create-collection, collapse/expand, clear-search, and hide/show affordances available
  - reduce the sense that these actions live in a detached button row
  - make them read like part of the same compact organizer utility surface as the control pills
- Deflate the selected-branch list density:
  - keep active group selection, preview rows, counts, drag/drop hooks, and show-all behavior intact
  - reduce padding, chrome, and list-row bulk so the active branch reads more like a lean branch continuation than a nested card stack
  - preserve custom collection and explicit `Untagged` labeling
- Preserve current `Home` workbench behavior:
  - organizer lenses
  - search, sort, direction, and board/list controls
  - custom collections and explicit `Untagged`
  - manual ordering and drag-drop
  - organizer selection bar
  - organizer resize and hide/show
- Keep the implementation frontend-local; do not reopen backend schema or API work for this slice.
- Keep the Reader restriction explicit:
  - no `Reflowed`, `Simplified`, or `Summary` work
  - no generated-view UX changes
  - no transform, placeholder, control, or mode-routing changes

## Acceptance
- The organizer utility actions no longer read like a standalone button seam between search and the branch list.
- The active branch list feels denser and less carded without losing discoverability or scan order.
- Selected-branch continuity, preview rows, show-all behavior, manual ordering, resize, and hide/show remain intact.
- `Graph` and original-only `Reader` remain visually and behaviorally stable.

## Validation
- targeted Vitest:
  - `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - `frontend/src/App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the new Stage 504/505 harness pair
- live `200` checks for:
  - `http://127.0.0.1:8000/recall`
  - `http://127.0.0.1:8000/recall?section=graph`
  - `http://127.0.0.1:8000/reader`
- real Windows Edge runs against `http://127.0.0.1:8000`

## Benchmark Basis
- `docs/ux/recall_benchmark_matrix.md`
- User-provided Recall Home benchmark screenshot from 2026-03-18
- [Recall docs](https://docs.getrecall.ai/)
- [Tagging deep dive](https://docs.getrecall.ai/deep-dives/tagging)
- [Recall Release Notes: Feb 6, 2026 - OCR, improved organization, track your reading progress](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-6-2026-ocr-improved-organization-track-your-reading-pos)
- [Release: 15 November 2024 // Exciting Quality of Life Improvements!](https://feedback.getrecall.ai/changelog/release-15-november-2024-exciting-quality-of-life-improvements)

## Assumptions
- The organizer header/control stack itself is now structurally correct; this slice should stay on the utility seam plus branch-list rhythm rather than reopening the grouped overview board.
- Existing local state already exposes everything needed for utility-button placement and denser branch metadata without backend changes.
- This stage should stay on `Home`; do not widen into `Graph`, `Notes`, `Study`, or generated-content Reader work.

## Working Notes
- Favor utility wording and compact action rhythm over explanatory framing.
- If utility actions stay wrapped, make the wrap feel like one compact cluster instead of a detached button row.
- Keep the active branch easy to scan at the default organizer width and the widened Stage 491 rail width.
