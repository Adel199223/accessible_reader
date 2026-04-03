# Stage 718 - Reader Source Strip Flattening After Stage 717

## Summary

- Reopen `Reader` as the sole active surface after the Stage 717 outer-shell baseline.
- Keep the Stage 717 quiet outer Reader shell, centered article field, compact Source / Notebook seam, and frozen generated outputs.
- Flatten and compress the attached source strip so it reads like a lighter page-attached context seam rather than another framed panel above the reading deck.

## Why This Stage Exists

- Stage 716/717 removed the heavy outer reading-deck card.
- The next visible above-the-fold mismatch is the attached source strip, which still reads like a full-width boxed surface instead of a lighter attached seam.
- The best next bounded pass is to reduce that strip’s framing and height without reopening the article field, support seam, or generated modes.

## Scope

### In scope

- Flatten `Reader`’s attached source strip.
- Reduce visible border/background weight in the Reader-active source workspace frame.
- Tighten title/meta/tab spacing and padding.
- Preserve source title, source locator, summary chips, and tabs.
- Keep Reader route continuity, source-tab continuity, and note/source handoffs intact.

### Out of scope

- No backend changes.
- No route changes.
- No generated-content changes.
- No Home / Graph / Notebook / Study product changes beyond regression proof.

## Implementation Notes

- Primary files:
  - `frontend/src/components/SourceWorkspaceFrame.tsx`
  - `frontend/src/index.css`
- Extend the shared Reader audit harness to detect whether the source strip is still visibly framed at rest and whether its height stays in the intended compact range.
- Prefer CSS flattening over structural component churn unless a tiny markup adjustment materially helps the attached-seam feel.

## Validation Targets

- Reader-active source strip should:
  - remain fully usable
  - remain attached to Reader context
  - stop reading like a standalone card
  - compress vertical share further than Stage 717
- Reader article field and compact support seam must stay intact.
- Generated outputs remain frozen.

## Required Checks

- Targeted Vitest for Reader/source strip continuity.
- `npm run build`
- `uv run pytest tests/test_api.py -k graph -q`
- `node --check` for the shared Reader harness plus Stage 718/719 scripts
- Live Windows Edge Stage 718/719 audits on `http://127.0.0.1:8000`
