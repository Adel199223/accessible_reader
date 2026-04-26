# Stage 893 - Post-Stage-892 Notebook Source-Anchor Workbench Semantics And Action Ownership Audit

## Summary

Audit Stage 892 against the live desktop Recall workspace. The audit must prove source-attached notes no longer masquerade as highlighted sentence notes, while sentence-anchored notes and the Stage 890/891 draft flow remain intact.

## Evidence Targets

- `notebookSourceAnchorContextPanelVisible`
- `notebookSourceAnchorHighlightedPassageVisible`
- `notebookSourceAnchorSyntheticHighlightVisible`
- `notebookSourceAnchorReaderHandoffUnanchored`
- `notebookSentenceAnchorHighlightPanelStable`
- `notebookNewNoteSavedUsesSourceContext`
- `notebookNewNoteCreatesSourceAttachedNote`
- `notebookCaptureInReaderStillAvailable`

## Regression Gates

- Stage 891 source-attached draft creation still opens, saves, selects, and preserves source defaulting.
- Stage 889 no-active/search-empty and browse-rail Notebook baselines remain stable.
- Sentence-anchored note capture and anchored Reader reopening remain stable.
- Edit/save/delete, source handoff, Graph promotion, Study card creation, and focused Reader-led Notebook remain functional.
- Home, Add Content, Graph, Reader active Listen, Study Review, Study Questions, and generated Reader invariants remain regression surfaces.

## Validation

- Targeted Notebook/App Vitest.
- Backend graph pytest.
- `npm run build`.
- `node --check` for the shared Notebook harness and Stage 892/893 scripts.
- Live browser audit against `http://127.0.0.1:8000`.
- `git diff --check`.

## Audit Notes

- This audit should not require backend/schema changes if Stage 892 only reassigns UI semantics using the existing Stage 890 anchor kind.
- If implementation discovers a missing source-anchor behavior contract, keep it narrowly scoped and explicitly preserve existing sentence-anchor validation.
- Completed live Stage 893 audit against `http://127.0.0.1:8000`; it recorded `notebookSourceAnchorContextPanelVisible: true`, `notebookSourceAnchorHighlightedPassageVisible: false`, `notebookSourceAnchorSyntheticHighlightVisible: false`, `notebookSourceAnchorReaderHandoffUnanchored: true`, `notebookSentenceAnchorHighlightPanelStable: true`, `notebookNewNoteSavedUsesSourceContext: true`, `notebookNewNoteCreatesSourceAttachedNote: true`, `notebookCaptureInReaderStillAvailable: true`, `notebookStage889EmptyStatesStable: true`, `homeVisibleClippingCount: 0`, `graphVisible: true`, `studyVisible: true`, `notebookOpenWorkbenchVisible: true`, and `simplifiedViewAvailable: false`.
- Validation passed: targeted Notebook/App Vitest, `npm run build`, backend graph pytest, `node --check` on shared Notebook plus Stage 892/893 scripts, live Stage 892/893 browser audits, and `git diff --check`.
