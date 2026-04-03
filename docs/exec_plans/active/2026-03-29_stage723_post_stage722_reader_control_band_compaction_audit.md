# Stage 723 - Post-Stage-722 Reader Control Band Compaction Audit

## Audit Summary

- Verify that Stage 722 compresses the Reader control band without reopening heavy Reader chrome.
- Keep the Stage 721 quiet outer shell, centered article field, flat attached source strip, compact support seam, and frozen generated outputs intact.
- Confirm regression stability for `Home`, `Graph`, embedded `Notebook`, and `Study`.

## Audit Checklist

- No visible separate Reader utility row remains at rest.
- No visible at-rest `View` or `Read aloud` labels remain above the article.
- The current view is no longer repeated in the Reader metadata chips.
- The Settings control remains accessible while reading icon-first at rest.
- The article starts earlier again after control-band compaction.
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

- Targeted Vitest for Reader/control-ribbon continuity.
- `npm run build`
- `uv run pytest tests/test_api.py -k graph -q`
- `node --check` for the shared Reader harness plus Stage 722/723 scripts.
- Live Windows Edge Stage 722/723 audits on `http://127.0.0.1:8000`
