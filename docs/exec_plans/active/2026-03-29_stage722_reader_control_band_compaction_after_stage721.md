# Stage 722 - Reader Control Band Compaction After Stage 721

## Summary

- Reopen `Reader` as the sole active surface after the Stage 721 source-identity baseline.
- Keep the quiet outer shell, centered article field, flat attached source strip, compact Source / Notebook seam, and frozen generated outputs.
- Compress the remaining Reader control band above the article so the reading lane gets more room without reopening heavier dock chrome.

## Why This Stage Exists

- Stage 720/721 retired the duplicated Reader-stage title seam successfully.
- The next visible above-the-fold mismatch is the control band itself: the stage still repeats the current view in metadata, keeps visible `View` / `Read aloud` labels, and uses a separate utility row that reads heavier than Recall’s calmer Reader rhythm.
- The best next bounded pass is to compress those controls into one lighter attached band and let the article begin earlier again.

## Scope

### In scope

- Remove the separate Reader utility row and merge settings/note actions into the main control ribbon.
- Retire the visible at-rest `View` and `Read aloud` labels while preserving accessible names and controls.
- Stop repeating the current view in the Reader metadata chips above the article.
- Slightly reduce control-button weight if needed to keep the control band calmer and shorter.
- Extend Reader audits to prove the utility row and visible strip labels are gone at rest.

### Out of scope

- No backend changes.
- No route changes.
- No generated-content changes.
- No Home / Graph / Notebook / Study product changes beyond regression proof.

## Implementation Notes

- Primary files:
  - `frontend/src/components/ReaderWorkspace.tsx`
  - `frontend/src/index.css`
- Shared audit updates:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
- Keep source-tab continuity, read-aloud controls, note capture, and source/notebook expansion behavior intact while tightening the at-rest hierarchy.

## Validation Targets

- Reader should:
  - keep the attached source strip as the one visible identity seam above the article
  - remove the separate Reader utility row at rest
  - hide visible `View` / `Read aloud` labels at rest while controls stay accessible
  - stop repeating the current view in the metadata chips above the article
  - shorten the stage chrome further so the article begins earlier again
- Reader support seam remains compact at rest and expands correctly on demand.
- Generated outputs remain frozen.

## Required Checks

- Targeted Vitest for Reader/control-ribbon continuity.
- `npm run build`
- `uv run pytest tests/test_api.py -k graph -q`
- `node --check` for the shared Reader harness plus Stage 722/723 scripts
- Live Windows Edge Stage 722/723 audits on `http://127.0.0.1:8000`
