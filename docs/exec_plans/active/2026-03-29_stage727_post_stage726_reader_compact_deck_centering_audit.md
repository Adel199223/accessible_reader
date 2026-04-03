# Stage 727 - Post-Stage-726 Reader Compact Deck Centering Audit

## Audit Summary

- Verify that Stage 726 makes the resting Reader deck feel centered and deliberate without disturbing the good Stage 725 expanded `Source` rail.
- Keep the quiet outer shell, flat attached source strip, compact resting support seam, and frozen generated outputs intact.
- Confirm regression stability for `Home`, `Graph`, embedded `Notebook`, and `Study`.

## Audit Checklist

- The resting Reader deck is centered within the broader stage.
- The control ribbon is centered to the same compact deck width instead of stretching full width.
- The article field stays present and visually centered inside the compact deck.
- The compact support seam remains slim at rest.
- The expanded `Source` rail remains lighter and attached.
- No legacy expanded support heading, glance card, or footer note returns.
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

- Targeted Vitest for Reader compact-deck continuity.
- `npm run build`
- `uv run pytest tests/test_api.py -k graph -q`
- `node --check` for the shared Reader harness plus Stage 726/727 scripts.
- Live Windows Edge Stage 726/727 audits on `http://127.0.0.1:8000`
