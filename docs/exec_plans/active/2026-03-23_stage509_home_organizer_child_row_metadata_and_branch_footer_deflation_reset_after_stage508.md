# ExecPlan: Stage 509 Home Organizer Child-Row Metadata And Branch Footer Deflation Reset After Stage 508

## Summary
- Stage 508 confirmed that the top-level organizer rows, overview/reset readouts, and count badges no longer lead the remaining `Home` mismatch.
- The next honest `Home` gap sits lower inside the active branch: the child-row metadata line and the `Show all` footer still read slightly heavier and more button-like than Recall's leanest attached branch lists.
- Bring `Home` closer to Recall's current organizer-owned direction by deflating child-row metadata and softening the active-branch footer without losing source clarity, selection continuity, or expansion affordances.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Implementation Scope
- Extend wide-desktop `Home` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css`.
- Refine active-branch child rows:
  - keep title readability, current source selection, manual drag/drop hooks, and selection continuity intact
  - reduce metadata weight, spacing, and marker emphasis so child rows read more like one attached continuation beneath the active group
  - preserve scan order at the default organizer width and the widened Stage 491 organizer width
- Deflate the active-branch footer:
  - soften the `Show all` / `Show fewer` affordance so it reads less like a standalone pill button
  - keep branch expansion and collapse behavior explicit and easy to trigger
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
- Active-branch child rows feel lighter and less metadata-heavy without losing source clarity.
- The `Show all` / `Show fewer` footer reads more like attached branch continuation than a detached pill control.
- Organizer selection continuity, branch expansion, manual ordering, resize, and hide/show remain intact.
- `Graph` and original-only `Reader` remain visually and behaviorally stable.

## Validation
- targeted Vitest:
  - `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - `frontend/src/App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the new Stage 509/510 harness pair
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
- The top-level organizer row language is now structurally correct; this slice should stay on the active branch continuation instead of reopening the overview/reset row or top-level counts.
- Existing local state already exposes everything needed to soften child-row metadata and footer chrome without backend changes.
- This stage should stay on `Home`; do not widen into `Graph`, `Notes`, `Study`, or generated-content Reader work.

## Working Notes
- Favor one continuous branch rhythm over decorative metadata or detached footer controls.
- Keep long child-row titles readable when the organizer rail is widened.
- Preserve the current active-source handoff into the right-side board while making the branch continuation feel calmer at a glance.
