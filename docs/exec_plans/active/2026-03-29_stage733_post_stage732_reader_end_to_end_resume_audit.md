# Stage 733 - Post-Stage-732 Reader End-to-End Resume Audit

## Audit Summary

- Verify that the local post-Stage-731 Reader baseline is the true end-to-end resume point for future chats.
- Confirm that the Reader evidence set now includes `Simplified` alongside default, `Original`, `Reflowed`, `Summary`, Source-open, and Notebook-open states.
- Ensure the continuity docs and benchmark matrix point at the audited local baseline instead of the older pre-audit anchor wording.

## Audit Checklist

- `git status` is accounted for in the final continuity summary.
- The shared Reader evidence flow captures:
  - default Reader
  - `Original`
  - `Reflowed`
  - `Simplified`
  - `Summary`
  - Source support opened
  - Notebook workbench opened
  - `Home`, `Graph`, embedded `Notebook`, and `Study` regressions
- Default Reader keeps the compact reading band, attached support seam, and early article start.
- Source support and Notebook workbench still expand correctly.
- `Simplified` and `Summary` stay deck-contained and route-safe.
- Generated-mode unavailable states remain inline and actionable instead of reopening a global alert slab.
- The handoff docs resume from the audited local checkpoint and explicitly state the next recommended reopen.

## Required Evidence

- `git status --short` snapshot in the audit summary.
- Reader wide-desktop default screenshot.
- Reader `Original`, `Reflowed`, `Simplified`, and `Summary` screenshots.
- Reader Source support opened screenshot.
- Reader Notebook workbench screenshot.
- Regression screenshots for `Home`, `Graph`, embedded `Notebook`, and `Study`.

## Required Checks

- targeted Vitest for Reader, App, SourceWorkspaceFrame, and shell/route regressions
- `npm run build`
- `uv run pytest tests/test_api.py -k graph -q`
- `node --check` for the shared Reader harness plus Stage 732/733 scripts
- live Reader Stage 732/733 audits on `http://127.0.0.1:8000`
- `git diff --check`
