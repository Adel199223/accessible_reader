# Stage 875 - Post-Stage-874 Embedded Notebook Empty-State And Capture-Handoff Completion Audit

## Summary

- Audit the Stage 874 embedded Notebook empty-state and capture-handoff pass.
- Confirm that selected-note Stage 872/873 workbench ownership remains intact while no-active-note and search-empty states no longer revive the old hero/guidance-card dashboard.

## Evidence Targets

- `notebookEmptyWorkbenchOwned`
- `notebookEmptyLegacyHeroVisible`
- `notebookEmptyLegacyGuidanceCardsVisible`
- `notebookCaptureInReaderVisible`
- `notebookCaptureInReaderNavigates`
- `notebookSearchEmptyWorkbenchOwned`
- `notebookSearchEmptyLegacyGuidanceCardsVisible`
- `notebookSearchEmptyCaptureInReaderVisible`

## Regression Targets

- Stage 872 command row, browse rail, selected-note fused workbench, inline Source handoff, and inline Promote note seams.
- Reader capture routing opens the selected source in Reader without direct note creation.
- Focused Reader-led Notebook remains unchanged.
- Home Stage 871 preview balance, Graph, original-only Reader, Reader support-open short docs, Study Review, and Study Questions remain regression surfaces.

## Validation

- Targeted Notebook/App Vitest.
- `npm run build`.
- `cd backend && uv run pytest tests/test_api.py -k graph -q`.
- `node --check` on the shared Notebook harness plus Stage 874/875 scripts.
- Live Stage 874/875 browser runs.
- `git diff --check`.
