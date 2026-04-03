# Stage 725 - Post-Stage-724 Reader Source Support Rail Deflation Audit

## Audit Summary

- Verify that Stage 724 makes the expanded Reader `Source` rail feel lighter and more attached without disturbing the good Stage 723 resting state.
- Keep the quiet outer shell, centered article field, flat attached source strip, compact resting support seam, and frozen generated outputs intact.
- Confirm regression stability for `Home`, `Graph`, embedded `Notebook`, and `Study`.

## Audit Checklist

- The resting Reader state still matches the Stage 723 baseline.
- The expanded Source rail is narrower than before and no longer reads like a second workspace.
- No visible `Active source` heading remains in the expanded Source state.
- No visible support glance card remains in the expanded Source state.
- No visible footer note remains in the expanded Source state.
- Expanded Source support keeps only a tiny summary-chip row.
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

- Targeted Vitest for Reader/source-support continuity.
- `npm run build`
- `uv run pytest tests/test_api.py -k graph -q`
- `node --check` for the shared Reader harness plus Stage 724/725 scripts.
- Live Windows Edge Stage 724/725 audits on `http://127.0.0.1:8000`
