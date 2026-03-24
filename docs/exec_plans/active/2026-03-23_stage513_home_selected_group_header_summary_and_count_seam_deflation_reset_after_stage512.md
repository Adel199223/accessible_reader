# ExecPlan: Stage 513 Home Selected-Group Header Summary And Count Seam Deflation Reset After Stage 512

## Summary
- Stage 512 confirmed that the selected-group board footer and lower-sheet ending no longer lead the remaining `Home` mismatch.
- The next honest `Home` gap sits at the top of the selected-group board: the header summary still spends slightly more vertical weight than Recall's leanest grouped-board headers, and the top-right count readout still feels more detached from the heading cluster than the calmer board body beneath it.
- Bring `Home` closer to Recall's current organizer-owned direction by deflating the selected-group header summary and tightening the count seam without losing branch clarity, board identity, or explicit source totals.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Implementation Scope
- Extend wide-desktop `Home` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css`.
- Refine the selected-group board header:
  - reduce summary-copy weight so the board header starts faster above the card field
  - keep the selected-group label readable and explicit
  - tighten the relationship between the header copy cluster and the top-right count readout so they feel like one header seam
- Preserve current `Home` workbench behavior:
  - organizer overview/reset workflow
  - organizer branch drill-in
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
- The selected-group header summary reads lighter and consumes less vertical space without losing context.
- The selected-group count readout feels more attached to the heading seam instead of reading like a detached top-right label.
- Organizer drill-in, board/list switching, manual ordering, resize, and hide/show remain intact.
- `Graph` and original-only `Reader` remain visually and behaviorally stable.

## Validation
- targeted Vitest:
  - `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - `frontend/src/App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the new Stage 513/514 harness pair
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
- The selected-group board ending is now structurally correct enough for this moment; this slice should stay on the selected-group header instead of reopening the board footer or lower-sheet continuation.
- Existing local state already exposes everything needed to soften the header summary and tighten the count seam without backend changes.
- This stage should stay on `Home`; do not widen into `Graph`, `Notes`, `Study`, or generated-content Reader work.

## Working Notes
- Favor a faster board start over decorative summary copy.
- Keep the total source count explicit but make it feel like part of the header cluster.
- Preserve the calmer Stage 512 board ending while letting the board header catch up.
