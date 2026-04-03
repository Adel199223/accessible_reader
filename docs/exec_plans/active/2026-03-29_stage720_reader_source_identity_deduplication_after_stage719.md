# Stage 720 - Reader Source Identity Deduplication After Stage 719

## Summary

- Reopen `Reader` as the sole active surface after the Stage 719 source-strip baseline.
- Keep the Stage 719 quiet outer Reader shell, centered article field, compact Source / Notebook seam, and frozen generated outputs.
- Remove the remaining duplicated Reader-stage identity seam above the article so the Reader-active source strip carries the one visible document title while the article keeps the same accessible label.

## Why This Stage Exists

- Stage 718/719 flattened the attached source strip successfully.
- The next visible above-the-fold mismatch is identity duplication: the Reader-active source strip and the Reader stage still both expose the same document identity above the article.
- The best next bounded pass is to retire the duplicated Reader-stage title seam, keep the source strip useful, and let that attached strip carry the single visible title above the article.

## Scope

### In scope

- Deduplicate document identity between the Reader-active source strip and the Reader stage above the article.
- Keep the Reader-active source strip as the one visible identity band while the article keeps the same accessible title without another visible heading seam.
- Tighten the Reader stage rhythm again if the deduplication allows a shorter chrome stack.
- Extend Reader audits to prove the duplicate Reader-stage title seam is gone at rest.
- Keep Reader route continuity, source-tab continuity, and note/source handoffs intact.

### Out of scope

- No backend changes.
- No route changes.
- No generated-content changes.
- No Home / Graph / Notebook / Study product changes beyond regression proof.

## Implementation Notes

- Primary files:
  - `frontend/src/components/ReaderWorkspace.tsx`
  - `frontend/src/components/SourceWorkspaceFrame.tsx`
  - `frontend/src/index.css`
- Shared audit updates:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
- Prefer a small Reader-active markup split over broad structural churn if that is the cleanest way to remove the duplicate title.

## Validation Targets

- Reader should:
  - keep the source strip attached and useful
  - remove the duplicated Reader-stage title seam below the strip
  - keep the source strip as the one visible title band above the article
  - shorten the stage chrome further if the lighter identity seam allows it
- The article keeps the same accessible label without another visible heading seam.
- Reader article field and compact support seam must stay intact.
- Generated outputs remain frozen.

## Required Checks

- Targeted Vitest for Reader/source strip continuity.
- `npm run build`
- `uv run pytest tests/test_api.py -k graph -q`
- `node --check` for the shared Reader harness plus Stage 720/721 scripts
- Live Windows Edge Stage 720/721 audits on `http://127.0.0.1:8000`
