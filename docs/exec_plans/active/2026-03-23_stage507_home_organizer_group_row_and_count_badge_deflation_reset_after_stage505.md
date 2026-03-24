# ExecPlan: Stage 507 Home Organizer Group Row And Count Badge Deflation Reset After Stage 505

## Summary
- Stage 505 confirmed that the organizer utility cluster and selected-branch density no longer lead the remaining `Home` mismatch.
- The next honest `Home` gap sits at the top-level organizer rows themselves: the group entries, `OVERVIEW` / `RESET` readouts, and count badges still feel slightly more boxed and chip-heavy than Recall's leanest continuous organizer rail.
- Bring `Home` closer to Recall's current organizer-owned direction by deflating top-level group-row chrome and softening count-badge emphasis without losing selection clarity, branch continuity, or organizer readability.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Implementation Scope
- Extend wide-desktop `Home` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css`.
- Refine the top-level organizer group rows:
  - keep active selection, overview/reset state, preview children, drag/drop hooks, and explicit custom collection plus `Untagged` labeling intact
  - reduce panel weight, internal padding, and nested button framing so the group list reads more like one continuous organizer spine
  - keep the active row obviously selected without reviving heavier card chrome
- Deflate badge and readout emphasis:
  - soften the visual weight of top-level count chips and overview/reset readouts
  - keep counts scannable at default width and the widened Stage 491 organizer width
  - preserve manual-order and batch-work affordances when those modes are active
- Preserve current `Home` workbench behavior:
  - organizer lenses
  - overview/reset workflow
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
- The top-level organizer rows feel flatter and less boxed without losing scan order or selection clarity.
- Count badges and overview/reset readouts feel lighter and less chip-like while remaining easy to read.
- Organizer overview/reset continuity, preview children, manual ordering, resize, and hide/show remain intact.
- `Graph` and original-only `Reader` remain visually and behaviorally stable.

## Validation
- targeted Vitest:
  - `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - `frontend/src/App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the new Stage 507/508 harness pair
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
- The organizer utility cluster and selected-branch density are now structurally correct; this slice should stay on the top-level organizer rows and count/readout emphasis instead of reopening the utility seam.
- Existing local state already exposes everything needed to soften row and badge chrome without backend changes.
- This stage should stay on `Home`; do not widen into `Graph`, `Notes`, `Study`, or generated-content Reader work.

## Working Notes
- Favor continuity and lighter scan rhythm over decorative chips or nested panels.
- If overview/reset state remains explicit, make it feel like part of the same lean list language as the surrounding groups.
- Keep custom collection rows and explicit `Untagged` discoverable at the default organizer width and the widened Stage 491 width.
