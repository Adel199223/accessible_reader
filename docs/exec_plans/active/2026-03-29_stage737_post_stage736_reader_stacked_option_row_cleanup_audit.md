# Stage 737 - Post-Stage-736 Reader Stacked Option-Row Cleanup Audit

## Audit Summary

- Verify that the Stage 736 Reader no longer presents the cross-surface row as a full second stacked option band above the article.
- Confirm that cross-surface access remains intact after the compact demotion and that `Source` / `Notebook` expansion behavior remains intact.
- Ensure generated empty states stay inline and the rest of the refreshed surface set remains stable.

## Audit Checklist

- Default Reader keeps the compact reading deck, centered control ribbon, and inline support seam from Stage 735.
- Default Reader no longer shows the full `Overview / Reader / Notebook / Graph / Study` row as a separate stacked band above the article.
- Cross-surface navigation remains available through the new compact Reader pattern.
- Source-strip title and metadata remain readable after the cleanup pass.
- `Source` support still opens the embedded library correctly.
- `Notebook` support still opens the note workbench correctly.
- Generated `Simplified` / `Summary` unavailable states remain calm inline placeholders rather than global alert slabs.
- `Home`, `Graph`, embedded `Notebook`, and `Study` remain stable in the same live browser pass.
- Continuity docs resume from the new Stage 737 audit and state the next intentional reopen clearly.

## Required Evidence

- Reader default wide-desktop screenshot.
- Reader source-strip crop proving the quieter top-chrome pattern.
- Reader `Source` support opened screenshot.
- Reader `Notebook` workbench screenshot.
- Reader `Original`, `Reflowed`, and `Summary` screenshots, plus `Simplified` when available on the live dataset.
- Regression screenshots for `Home`, `Graph`, embedded `Notebook`, and `Study`.

## Required Checks

- targeted Vitest for `SourceWorkspaceFrame`, `RecallShellFrame`, and `App`
- `npm run build`
- `uv run pytest tests/test_api.py -k graph -q`
- `node --check` for the shared Reader harness plus Stage 736/737 scripts
- live Reader Stage 736/737 audits on `http://127.0.0.1:8000`
- `git diff --check`
