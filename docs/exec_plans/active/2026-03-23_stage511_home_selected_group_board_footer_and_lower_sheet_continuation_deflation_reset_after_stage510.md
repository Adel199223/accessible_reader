# ExecPlan: Stage 511 Home Selected-Group Board Footer And Lower-Sheet Continuation Deflation Reset After Stage 510

## Summary
- Stage 510 confirmed that the organizer-side child rows and attached branch footer no longer lead the remaining `Home` mismatch.
- The next honest `Home` gap has shifted into the right-side selected-group board: its lower `Show all` stop still reads like a detached button chip, and the board's lower edge still breaks the results-sheet continuity more than Recall's calmer board endings.
- Bring `Home` closer to Recall's current organizer-owned direction by deflating the selected-group board footer and tightening the lower-sheet continuation without losing scan order, explicit expansion, or source clarity.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Implementation Scope
- Extend wide-desktop `Home` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css`.
- Refine the selected-group board footer:
  - soften the right-side `Show all` / `Show fewer` affordance so it reads less like a standalone pill button
  - keep expansion and collapse explicit and easy to trigger
  - align the footer more closely with the selected-group results sheet rather than reading like a detached card action
- Deflate the lower-sheet stop:
  - reduce any extra footer separation or lower-edge weight that still makes the selected-group board end abruptly
  - preserve the current board/list switch, section count, and right-side board dominance
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
- The selected-group board footer reads more like attached results-sheet continuation than a detached pill button.
- The lower edge of the selected-group board feels calmer and more continuous without losing the explicit show-all affordance.
- Organizer drill-in, board/list switching, manual ordering, resize, and hide/show remain intact.
- `Graph` and original-only `Reader` remain visually and behaviorally stable.

## Validation
- targeted Vitest:
  - `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - `frontend/src/App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the new Stage 511/512 harness pair
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
- The organizer rail is now structurally correct enough for this moment; this slice should stay on the selected-group board itself instead of reopening the organizer-side child rows or top-level group language.
- Existing local state already exposes everything needed to soften the selected-group board footer and lower-sheet stop without backend changes.
- This stage should stay on `Home`; do not widen into `Graph`, `Notes`, `Study`, or generated-content Reader work.

## Working Notes
- Favor a continuous selected-group board sheet over detached footer controls.
- Keep the footer explicit enough that expanded and collapsed states still read immediately.
- Preserve the calmer Stage 510 organizer-side branch rhythm while letting the right-side board catch up.
