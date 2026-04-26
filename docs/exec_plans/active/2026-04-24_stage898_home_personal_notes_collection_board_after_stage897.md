# Stage 898 - Home Personal Notes Collection Board After Stage 897

## Summary

Stage 896/897 made source-attached personal notes promote into Graph and Study as note-owned memory objects. Stage 898 carries the same ownership into Home discovery by making source-attached personal notes a selectable Home/Library collection board, while keeping saved source cards source-owned and keeping notes source-attached.

This is a frontend-only Home/Library pass. It must not add standalone global notes, note collection assignment, note drag/drop management, backend routes, schema changes, AI generation, import/cloud work, block editing, or Reader generated-output changes.

## Key Changes

- Add `Personal notes` as a selectable Home organizer section backed by source-attached notes known through bounded Home note prefetch and existing source-note search.
- Render a note-owned Home board/list when `Personal notes` is selected:
  - note body preview leads;
  - source title/type and updated date are supporting context;
  - primary click opens embedded Notebook with that source note selected;
  - secondary Reader handoff opens the source unanchored;
  - synthetic source-level `anchor_text` / `excerpt_text` stays hidden.
- Preserve the Stage 894 compact `Personal notes` lane as a recent/search preview on source boards, but avoid duplicate lane chrome while the selected Home board is already `Personal notes`.
- Keep saved source boards as source-card boards; do not mix note cards into chronological source grids.

## Evidence Targets

- `homePersonalNotesOrganizerSectionVisible`
- `homePersonalNotesOrganizerSectionSelectable`
- `homePersonalNotesBoardVisible`
- `homePersonalNotesBoardStartsWithNoteItems`
- `homePersonalNotesBoardUsesBodyPreview`
- `homePersonalNotesBoardSyntheticAnchorHidden`
- `homePersonalNotesBoardOpensEmbeddedNotebook`
- `homePersonalNotesBoardReaderHandoffUnanchored`
- `homeSourceCardBoardPreserved`
- `homeOpenOverviewDensityPreserved`
- Retain Stage 897 promotion metrics, Stage 894/895 Home personal-note metrics, and Stage 892/893 Notebook source/sentence metrics.

## Validation

- Targeted `frontend/src/App.test.tsx` coverage for Home, Notebook, and Personal notes.
- `npm run build`.
- Backend graph pytest as a regression gate.
- Node syntax checks for shared Notebook/Home harnesses and Stage 898/899 scripts.
- Live Stage 898 browser evidence against `http://127.0.0.1:8000`.
- `git diff --check`.

## Status

Completed on 2026-04-24. Stage 898 implementation added the Home `Personal notes` organizer section, note-owned collection board/list renderer, unanchored board Reader handoff, cache/search integration, focused Vitest coverage, and Stage 898/899 Playwright evidence scripts without backend schema/API changes.

## Evidence

- Targeted Vitest: `npm run test -- --run src/App.test.tsx -t "Home|Notebook|Personal notes"` passed.
- Build: `npm run build` passed.
- Backend graph regression: `uv run pytest tests/test_api.py -k graph -q` passed.
- Node checks: shared Home/Notebook harnesses plus Stage 898/899 scripts passed.
- Live Stage 898 evidence: `output/playwright/stage898-home-personal-notes-collection-board-validation.json`.
- `git diff --check` passed.

## Assumptions

- "Personal notes" means source-attached notes only.
- The Home board is based on bounded known/recent note prefetch plus existing search results, not an exhaustive all-notes backend index.
- Existing note endpoints and search endpoints are sufficient.
