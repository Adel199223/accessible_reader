# Stage 735 - Post-Stage-734 Reader Pre-Article Lead-In Compaction Audit

## Audit Summary

- Verify that the Stage 734 Reader lead-in compaction keeps the source strip visually aligned with the compact reading band at rest.
- Confirm that Source-open and Notebook-open support states still expand normally after the source-strip presentation change.
- Ensure generated empty states remain inline and the rest of the refreshed surface set stays stable.

## Audit Checklist

- Default Reader keeps the compact reading deck, centered control ribbon, and inline support seam from Stage 733.
- Default Reader source strip is compact-width and centered instead of spanning the full reading stage.
- Source-open and Notebook-open states still expand into the attached support rail with the expected library/workbench content visible.
- Generated `Simplified` / `Summary` unavailable states remain calm inline placeholders rather than global alert slabs.
- `Home`, `Graph`, embedded `Notebook`, and `Study` remain stable in the same live browser pass.
- Continuity docs resume from the new Stage 735 audit and state the next intentional reopen clearly.

## Required Evidence

- Reader default wide-desktop screenshot.
- Reader source-strip crop proving compact-width continuity at rest.
- Reader Source support opened screenshot.
- Reader Notebook workbench screenshot.
- Reader `Original`, `Reflowed`, and `Summary` screenshots, plus `Simplified` when available on the live dataset.
- Regression screenshots for `Home`, `Graph`, embedded `Notebook`, and `Study`.

## Required Checks

- targeted Vitest for `ReaderWorkspace`, `SourceWorkspaceFrame`, and `App`
- `npm run build`
- `uv run pytest tests/test_api.py -k graph -q`
- `node --check` for the shared Reader harness plus Stage 734/735 scripts
- live Reader Stage 734/735 audits on `http://127.0.0.1:8000`
- `git diff --check`
