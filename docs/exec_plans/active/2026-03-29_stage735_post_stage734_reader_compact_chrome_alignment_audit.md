# Stage 735 - Post-Stage-734 Reader Compact Chrome Alignment Audit

## Audit Summary

- Verify that the reader-active source strip now aligns to the same compact band as the control ribbon and deck instead of spanning the full workspace width.
- Confirm that the compact source strip stays readable after the alignment pass and still hands off correctly into Source and Notebook work.
- Ensure the Stage 733 inline generated-mode empty-state baseline remains intact while `Home`, `Graph`, embedded `Notebook`, and `Study` stay stable.

## Audit Checklist

- Default Reader keeps the centered compact deck and inline support seam.
- The reader-active source strip is centered with the compact band and no longer reads as a full-width bar above a narrower deck.
- Reader source-strip title, meta chips, and tabs remain legible inside the aligned compact band.
- Source support still opens the embedded library correctly.
- Notebook support still opens the note workbench correctly.
- `Simplified` and `Summary` stay deck-contained and keep generated-mode feedback inline.
- Continuity docs resume from the new Stage 734/735 checkpoint instead of Stage 732/733.

## Required Evidence

- `git status --short` snapshot in the audit summary.
- Reader default wide-desktop screenshot.
- Reader source-strip crop proving the aligned compact width.
- Reader Source support opened screenshot.
- Reader Notebook workbench screenshot.
- Reader `Original`, `Reflowed`, and `Summary` screenshots.
- Regression screenshots for `Home`, `Graph`, embedded `Notebook`, and `Study`.

## Required Checks

- targeted Vitest for Reader shell/source-frame regressions
- `npm run build`
- `uv run pytest tests/test_api.py -k graph -q`
- `node --check` for the shared Reader harness plus Stage 734/735 scripts
- live Reader Stage 734/735 audits on `http://127.0.0.1:8000`
- `git diff --check`
