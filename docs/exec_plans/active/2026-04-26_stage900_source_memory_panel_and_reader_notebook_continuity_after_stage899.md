# Stage 900 - Source Memory Panel And Reader/Notebook Continuity After Stage 899

## Summary

Stage 898/899 made source-attached personal notes a first-class Home collection. Stage 900 makes the selected source workspace itself a source-memory hub: Source overview and Reader-led source workspace affordances should expose source-attached personal notes as note-owned context while keeping Notebook as the edit surface.

This is a frontend-only source workspace pass. It must not add standalone global notes, backend routes, schema changes, AI generation, import/cloud work, block editing, or Reader generated-output changes.

## Key Changes

- Replace the single-note Notebook teaser in Source overview with a compact source-memory list backed by existing `sourceWorkspaceNotes`.
- Show source-attached notes first with body preview, source title/type, and updated date, hiding synthetic `Source note for...` anchor/excerpt text.
- Keep source-note primary actions Notebook-first and source-note Reader handoff unanchored.
- Preserve sentence-note wording and anchored Reader reopening for sentence/highlight notes.
- Add a source-owned `New note` entry from Source overview that reuses the Stage 890/891 source-attached draft flow, saves into the active source, refreshes source-memory cache, and selects the saved note.
- Tighten Reader-led source workspace continuity so the nearby Notebook/source-memory affordance shows source-note count context and opens the embedded Notebook path without reviving the retired global Notes sidebar.

## Evidence Targets

- `sourceOverviewPersonalNotesPanelVisible`
- `sourceOverviewPersonalNotesUsesBodyPreview`
- `sourceOverviewPersonalNotesSyntheticAnchorHidden`
- `sourceOverviewPersonalNotesOpensEmbeddedNotebook`
- `sourceOverviewPersonalNotesReaderHandoffUnanchored`
- `sourceOverviewNewNoteCreatesSourceAttachedNote`
- `readerSourceNotebookContinuityVisible`
- `readerSourceNotebookContinuityOpensEmbeddedNotebook`
- Retain Stage 899 Home personal-note board metrics, Stage 897 promotion metrics, Stage 892/893 Notebook source/sentence metrics, `notesSidebarVisible: false`, and Reader generated-output freeze metrics.

## Validation

- Targeted `frontend/src/App.test.tsx` coverage for Source overview, Home, Notebook, Personal notes, Graph, and Study.
- `npm run build`.
- Backend graph pytest as a regression gate.
- Node syntax checks for shared Notebook/Home harnesses and Stage 900/901 scripts.
- Live Stage 900 browser evidence against `http://127.0.0.1:8000`.
- `git diff --check`.

## Status

Completed on 2026-04-26; the paired Stage 901 audit is green.

## Implementation Notes

- Source overview now renders a compact source-memory list from `sourceWorkspaceNotes`, with source-attached notes sorted first, source-note body previews, source title/type/date metadata, Notebook-first primary actions, unanchored source-note Reader handoff, and sentence-note highlight/anchored Reader behavior preserved.
- Source overview now includes a source-owned `New note` action that reuses the Stage 890/891 draft flow, saves a source-attached note, refreshes source-memory caches, and lands in the source-context Notebook workbench.
- Reader nearby Notebook continuity now summarizes source-note counts/body context, hides synthetic source anchors, and opens the embedded Notebook path without reviving a global Notes sidebar.
- Reader-return continuity now clears stale focus requests when navigating to Reader so a previously canceled New note draft cannot cover the restored selected-note workbench.

## Evidence So Far

- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- --run src/App.test.tsx -t \"Source overview|Home|Notebook|Personal notes|Graph|Study\""` passed on 2026-04-26.
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"` passed on 2026-04-26.
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k graph -q"` passed on 2026-04-26.
- `node --check scripts/playwright/notebook_workbench_shared.mjs`, `node --check scripts/playwright/stage900_source_memory_panel_and_reader_notebook_continuity_after_stage899.mjs`, and `node --check scripts/playwright/stage901_post_stage900_source_memory_panel_and_reader_notebook_continuity_audit.mjs` passed on 2026-04-26.
- Live `node scripts/playwright/stage900_source_memory_panel_and_reader_notebook_continuity_after_stage899.mjs` passed against `http://127.0.0.1:8000` with `runtimeBrowser: chromium`, `headless: true`.
- Live `node scripts/playwright/stage901_post_stage900_source_memory_panel_and_reader_notebook_continuity_audit.mjs` passed against `http://127.0.0.1:8000` with `runtimeBrowser: chromium`, `headless: true`.

## Assumptions

- "Source memory" means source-attached Notebook notes only.
- Existing note endpoints, `RecallNoteRecord`, source note cache, and Reader handoff helpers are sufficient.
- Synthetic source-anchor storage may remain for compatibility, but source-memory UI and evidence must use note body/source context instead.
