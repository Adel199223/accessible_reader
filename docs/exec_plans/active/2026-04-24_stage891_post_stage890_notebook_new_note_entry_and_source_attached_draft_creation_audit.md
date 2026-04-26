# Stage 891 - Post-Stage-890 Notebook New Note Entry And Source-Attached Draft Creation Audit

## Summary

Audit Stage 890 against the live desktop Recall workspace. The audit must prove `New note` now opens a real source-attached Notebook draft, saving selects the created note, and Stage 889 Notebook plus cross-surface baselines remain intact.

## Evidence Targets

- `homeNewNoteOpensDraft`
- `notebookNewNoteDraftVisible`
- `notebookNewNoteCreatesSourceAttachedNote`
- `notebookNewNoteDraftSourceDefaulted`
- `notebookSourceAnchorNoteSelectedAfterSave`
- `notebookCaptureInReaderStillAvailable`
- `notebookStage889EmptyStatesStable`

## Regression Gates

- Selected-note Notebook still keeps the fused Stage 887/889 workbench.
- No-active and search-empty Notebook states stay workbench-owned.
- Browse rail remains list-first with compact active rows and inline timestamp metadata.
- Reader-led note capture still creates sentence anchors.
- Home, Add Content, Graph, Reader active Listen, Study Review, Study Questions, and focused Reader-led Notebook remain visible regression surfaces.

## Validation

- Targeted Notebook/App Vitest.
- Backend note API tests.
- `npm run build`.
- Backend graph pytest.
- `node --check` for the shared Notebook harness and Stage 890/891 scripts.
- Live browser audit against `http://127.0.0.1:8000`.
- `git diff --check`.

## Audit Result

- Stage 891 live audit passed against `http://127.0.0.1:8000` with `runtimeBrowser: msedge`.
- Recorded `homeNewNoteOpensDraft: true`, `notebookNewNoteDraftVisible: true`, `notebookNewNoteCreatesSourceAttachedNote: true`, `notebookNewNoteDraftSourceDefaulted: true`, `notebookSourceAnchorNoteSelectedAfterSave: true`, `notebookCaptureInReaderStillAvailable: true`, and `notebookStage889EmptyStatesStable: true`.
- Regression metrics stayed green for Home (`homeVisibleClippingCount: 0`), Graph (`graphVisible: true`), Study (`studyVisible: true`), embedded Notebook (`notebookOpenWorkbenchVisible: true`), and generated Reader availability (`simplifiedViewAvailable: false` on the current dataset).
