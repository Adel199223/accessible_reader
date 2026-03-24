# ExecPlan: Stage 500 Home Organizer Overview And Grouped Board Deflation Reset After Stage 499

## Summary
- Stage 499 confirmed that the last Graph parity slice landed cleanly, so the next honest roadmap reopen is `Home`.
- The remaining high-leverage `Home` mismatch is no longer organizer capability. It is the visual weight and copy density of the organizer overview/reset row and the grouped overview board when no branch is selected.
- Bring `Home` closer to Recall's current organized-library direction with a clearer organizer-owned overview/reset row, a lighter grouped overview header, and calmer grouped library cards.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Implementation Scope
- Extend wide-desktop `Home` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css`.
- Refine the organizer-owned overview/reset row:
  - keep `All collections` / `All recent groups` as the reset path
  - reduce helper-paragraph weight so the row reads more like a real overview/reset control and less like inline documentation
  - keep the current counts, selection continuity, manual ordering, and custom-collection model intact
- Reframe the grouped overview board on the right:
  - make the overview header read like a working-set summary rather than a secondary explanation block
  - surface the key saved-source and sort/view status without reviving earlier dashboard chips or detached shelves
  - deflate grouped section cards, headings, counts, and row framing so the board feels calmer and less boxed above the fold
- Preserve current `Home` workbench behavior:
  - organizer lenses
  - search, sort, and view controls
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
- The organizer overview/reset row reads as a clearer reset target and overview lens instead of carrying explanatory paragraph weight.
- The grouped overview board starts with a calmer, more utility-like working-set summary.
- Grouped section cards and their top rows read lighter and less panel-heavy while preserving discoverability and drill-in behavior.
- Organizer-owned collection management, manual ordering, drag-drop, selection, resize, and hide/show behavior stay intact.
- `Graph` and original-only `Reader` remain visually and behaviorally stable.

## Validation
- targeted Vitest:
  - `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - `frontend/src/App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the new Stage 500/501 harness pair
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
- The organizer model and grouped overview composition are already structurally correct; this slice should focus on hierarchy, copy weight, and card density rather than reopening organizer capability work.
- The current local state already exposes everything needed for clearer overview/reset summaries without backend changes.
- This stage should stay on `Home`; do not widen into `Graph`, `Notes`, `Study`, or generated-content Reader work.

## Working Notes
- Favor calmer overview copy over new helper prose.
- If the organizer overview/reset row needs extra metadata, keep it short and utility-like rather than explanatory.
- Let the grouped overview board feel more like one library sheet with grouped entries than three heavy cards sitting inside another card.
