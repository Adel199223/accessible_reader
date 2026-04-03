# Stage 726 - Reader Compact Deck Centering After Stage 725

## Summary

- Reopen `Reader` as the sole active surface after the Stage 725 Source support-rail baseline.
- Keep the lighter expanded `Source` rail, compact resting Source / Notebook seam, quiet outer shell, flat attached source strip, and frozen generated outputs.
- Center and tighten the compact resting Reader deck so the reading band feels deliberate instead of stretched across a full-width stage.

## Why This Stage Exists

- Stage 725 fixed the expanded `Source` support state well.
- The clearest remaining wide-desktop mismatch is the resting Reader deck: the metadata row, control ribbon, article field, and compact support seam still sit inside too much stage width and can feel visually adrift.
- The right bounded follow-through is to center the compact reading band and keep its rhythm attached without reopening generated content or support workflows.

## Scope

### In scope

- Center the compact resting Reader deck as one attached reading band.
- Narrow the resting metadata row and control ribbon to the same compact deck width.
- Keep the article field visually centered inside that narrower deck.
- Preserve the compact resting support seam and the lighter expanded `Source` rail from Stage 725.
- Extend Reader audits to prove the compact deck is centered and materially narrower than the full stage.

### Out of scope

- No backend changes.
- No route changes.
- No generated-content changes.
- No Home / Graph / Notebook / Study product changes beyond regression proof.
- No new Reader information architecture changes outside the compact resting deck geometry.

## Implementation Notes

- Primary files:
  - `frontend/src/components/ReaderWorkspace.tsx`
  - `frontend/src/index.css`
  - `frontend/src/App.test.tsx`
- Shared audit updates:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
- Keep the expanded Source/Notebook workflows intact while tightening only the compact at-rest reading band.

## Validation Targets

- The compact resting Reader deck should:
  - stay centered inside the wider stage
  - keep the control ribbon attached to the same compact deck width
  - preserve the centered article field and the slim compact support seam
- Expanded Source support remains as light as Stage 725.
- Generated outputs remain frozen.

## Required Checks

- Targeted Vitest for Reader compact-deck continuity.
- `npm run build`
- `uv run pytest tests/test_api.py -k graph -q`
- `node --check` for the shared Reader harness plus Stage 726/727 scripts
- Live Windows Edge Stage 726/727 audits on `http://127.0.0.1:8000`
