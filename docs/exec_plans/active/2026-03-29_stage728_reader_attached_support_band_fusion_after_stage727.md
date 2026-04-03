# Stage 728 - Reader Attached Support Band Fusion After Stage 727

## Summary

- Reopen `Reader` as the sole active surface after the Stage 727 compact-deck centering baseline.
- Keep the centered compact reading deck, the lighter expanded `Source` rail, the quiet outer shell, and frozen generated outputs.
- Fuse the collapsed Source / Notebook support seam into the main Reader control band so the resting layout reads as one attached reading surface instead of a centered deck plus a tiny side column.

## Why This Stage Exists

- Stage 726 centered the resting Reader deck well.
- The clearest remaining wide-desktop mismatch is that the collapsed support seam still lives in its own small right column at rest, which makes the control ribbon, article field, and support seam feel slightly disconnected.
- The right bounded follow-through is to keep the expanded support workflows intact while turning the resting Reader state into one attached reading band.

## Scope

### In scope

- Remove the dedicated resting right-side support column from the compact Reader state.
- Fold the collapsed Source / Notebook support seam into the Reader control band as a compact attached inline support cluster.
- Let the article field own the compact resting deck width instead of sharing that space with a separate mini-dock column.
- Preserve the expanded `Source` and `Notebook` workflows as a larger attached support rail when opened.
- Extend Reader audits to prove the resting support is inline and the compact reading lane no longer reserves a separate dock column.

### Out of scope

- No backend changes.
- No route changes.
- No generated-content changes.
- No Home / Graph / Notebook / Study product changes beyond regression proof.
- No redesign of the expanded support workflows beyond the layout continuity needed to preserve them.

## Implementation Notes

- Primary files:
  - `frontend/src/components/ReaderWorkspace.tsx`
  - `frontend/src/index.css`
  - `frontend/src/App.test.tsx`
  - `frontend/src/components/SourceWorkspaceFrame.test.tsx`
- Shared audit updates:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
- The resting Reader state should read as:
  - source strip
  - compact control band with inline support seam
  - centered article field
- The expanded support state should still reopen the attached Source / Notebook rail without disturbing note editing, source browsing, or graph/study promotion flows.

## Validation Targets

- The resting Reader state should:
  - keep the centered compact reading band from Stage 726
  - inline the collapsed Source / Notebook seam into the control band
  - stop reserving a separate right dock column at rest
  - keep the article field dominant and visually attached to the compact chrome above it
- Expanded Source support remains as light as Stage 725.
- Generated outputs remain frozen.

## Required Checks

- Targeted Vitest for Reader attached-support continuity.
- `npm run build`
- `uv run pytest tests/test_api.py -k graph -q`
- `node --check` for the shared Reader harness plus Stage 728/729 scripts
- Live Windows Edge Stage 728/729 audits on `http://127.0.0.1:8000`
