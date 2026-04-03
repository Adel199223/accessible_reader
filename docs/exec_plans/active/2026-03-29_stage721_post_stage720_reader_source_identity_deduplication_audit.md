# Stage 721 - Post-Stage-720 Reader Source Identity Deduplication Audit

## Audit Summary

- Verify that Stage 720 removed the duplicated Reader-stage identity seam while keeping the Reader-active source strip as the one visible title band.
- Keep the quiet outer shell, centered article field, compact support seam, and frozen generated outputs from Stage 719 intact.
- Confirm regression stability for `Home`, `Graph`, embedded `Notebook`, and `Study`.

## Audit Checklist

- Reader-active source strip stays as the one visible document-title seam.
- The duplicated Reader-stage title seam is no longer visible at rest.
- Reader-active source strip remains compact and flat at rest.
- The article keeps the same accessible title without needing another visible stage heading.
- Reader article field remains centered and primary.
- Compact Source / Notebook support seam still works and expands correctly.
- Generated `Original`, `Reflowed`, `Simplified`, and `Summary` outputs remain unchanged.
- `Home`, `Graph`, embedded `Notebook`, and `Study` stay visually stable.

## Required Evidence

- Wide-desktop Reader default screenshot.
- Reader source-strip crop.
- Reader Source support open screenshot.
- Reader Notebook workbench screenshot.
- Reader `Original`, `Reflowed`, and `Summary` screenshots.
- Regression screenshots for `Home`, `Graph`, embedded `Notebook`, and `Study`.

## Required Checks

- Targeted Vitest for Reader/source strip continuity.
- `npm run build`
- `uv run pytest tests/test_api.py -k graph -q`
- `node --check` for the shared Reader harness plus Stage 720/721 scripts.
- Live Windows Edge Stage 720/721 audits on `http://127.0.0.1:8000`
