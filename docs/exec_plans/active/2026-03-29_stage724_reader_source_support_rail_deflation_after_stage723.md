# Stage 724 - Reader Source Support Rail Deflation After Stage 723

## Summary

- Reopen `Reader` as the sole active surface after the Stage 723 control-band baseline.
- Keep the quiet outer shell, centered article field, flat attached source strip, compact resting Source / Notebook seam, and frozen generated outputs.
- Deflate the expanded `Source` support state so it feels like an attached context rail instead of a second mini workspace.

## Why This Stage Exists

- Stage 723 settled the at-rest Reader hierarchy well.
- The clearest remaining mismatch is what happens after opening `Source`: the rail still expands too wide and visually reads like a separate workspace.
- The right bounded follow-through is to slim the expanded Source rail, lighten the embedded library shell, and remove the leftover legacy support chrome.

## Scope

### In scope

- Narrow the expanded Source rail relative to the article lane.
- Remove the legacy expanded support chrome:
  - `Active source`
  - any glance-card shell
  - footer-note copy
- Keep expanded metadata to a tiny summary chip set only.
- Make the embedded library shell flatter, tighter, and more attached to Reader.
- Extend Reader audits to prove the expanded Source state is materially lighter than Stage 723.

### Out of scope

- No backend changes.
- No route changes.
- No generated-content changes.
- No Home / Graph / Notebook / Study product changes beyond regression proof.
- No new Reader information architecture changes outside the expanded Source state.

## Implementation Notes

- Primary files:
  - `frontend/src/components/ReaderWorkspace.tsx`
  - `frontend/src/index.css`
  - `frontend/src/App.test.tsx`
- Shared audit updates:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
- Keep the compact at-rest support seam, note workbench expansion, and Summary controls intact while shrinking only the opened Source rail.

## Validation Targets

- Expanded Source support should:
  - stay attached and narrower than the Stage 723 expanded rail
  - keep the source library visible
  - show at most two support summary chips
  - remove legacy `Active source` / glance / footer-note chrome
- Default Reader state remains unchanged from Stage 723.
- Generated outputs remain frozen.

## Required Checks

- Targeted Vitest for Reader/source-support continuity.
- `npm run build`
- `uv run pytest tests/test_api.py -k graph -q`
- `node --check` for the shared Reader harness plus Stage 724/725 scripts
- Live Windows Edge Stage 724/725 audits on `http://127.0.0.1:8000`
