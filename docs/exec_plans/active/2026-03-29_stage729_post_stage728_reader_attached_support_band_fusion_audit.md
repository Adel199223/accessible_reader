# Stage 729 - Post-Stage-728 Reader Attached Support Band Fusion Audit

## Audit Summary

- Verify that Stage 728 turns the collapsed Reader support seam into an attached inline control-band seam without disturbing the centered compact deck or the lighter expanded `Source` rail.
- Keep the quiet outer shell, flat attached source strip, centered article field, and frozen generated outputs intact.
- Confirm regression stability for `Home`, `Graph`, embedded `Notebook`, and `Study`.

## Audit Checklist

- The resting Reader control band includes the collapsed Source / Notebook support seam inline.
- The resting Reader no longer reserves a separate right-side dock column.
- The centered compact reading lane remains stable.
- The expanded `Source` rail still opens as a larger attached support strip.
- Notebook workbench expansion still works.
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

- Targeted Vitest for Reader attached-support continuity.
- `npm run build`
- `uv run pytest tests/test_api.py -k graph -q`
- `node --check` for the shared Reader harness plus Stage 728/729 scripts.
- Live Windows Edge Stage 728/729 audits on `http://127.0.0.1:8000`
