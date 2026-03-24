# ExecPlan: Stage 502 Home Organizer Header And Control Stack Compression Reset After Stage 501

## Summary
- Stage 501 confirmed that the organizer overview/reset row and grouped board are no longer the lead `Home` mismatch.
- The next high-leverage `Home` gap is the upper organizer rail stack: the `Collections` heading area, helper copy, search, and dense control deck still read taller and more instructional than Recall's leaner left rail.
- Bring `Home` closer to Recall's current organizer-owned direction with a tighter organizer header, a lighter helper line, and a more compact control-stack rhythm while keeping the current organizer model intact.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Implementation Scope
- Extend wide-desktop `Home` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css`.
- Refine the organizer header area:
  - keep the lens heading and status visible
  - reduce helper-copy prominence and make it read like a short utility hint instead of onboarding prose
  - tighten the spacing between heading, status, helper line, and search
- Compress the organizer control stack:
  - keep lens, sort mode, sort direction, and board/list controls intact
  - reduce vertical stacking and panel weight so the controls behave more like one compact utility surface
  - keep create-collection, collapse/expand, clear-search, and hide/show affordances available without reopening detached tool rows
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
- The organizer header reads as a tighter utility header rather than a stacked intro block.
- The helper line is shorter and less instructional while still preserving orientation.
- Search plus organizer controls fit into a calmer, denser upper rail without sacrificing discoverability.
- Organizer-owned collection management, manual ordering, drag-drop, selection, resize, and hide/show behavior stay intact.
- `Graph` and original-only `Reader` remain visually and behaviorally stable.

## Validation
- targeted Vitest:
  - `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - `frontend/src/App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the new Stage 502/503 harness pair
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
- The grouped overview workspace itself is now structurally correct; this slice should stay on the organizer rail's upper hierarchy rather than reopening the right-side board.
- Existing local state already exposes everything needed for tighter header/status/helper summaries without backend changes.
- This stage should stay on `Home`; do not widen into `Graph`, `Notes`, `Study`, or generated-content Reader work.

## Working Notes
- Favor utility phrasing over explanatory phrasing in the organizer header.
- If the control deck stays multi-row, make the rows feel intentional and compressed rather than like stacked form sections.
- Keep the organizer readable at the default width and at the widened Stage 491 rail width.
