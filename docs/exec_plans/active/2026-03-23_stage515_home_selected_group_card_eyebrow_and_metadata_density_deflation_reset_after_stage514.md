# ExecPlan: Stage 515 Home Selected-Group Card Eyebrow And Metadata Density Deflation Reset After Stage 514

## Summary
- Deflate the first visible selected-group card row in `Home` after the Stage 514 header/count-seam audit.
- Reduce repeated eyebrow weight and compress the card metadata stack so the selected-group board reads closer to Recall's leanest grouped board cards.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Scope
- Wide desktop `Home` only.
- Selected-group board cards in the active drill-in state first:
  - source-type eyebrow treatment
  - card-side metadata density
  - card rhythm in both board and list views when the selected-group board is active
- Do not reopen organizer-rail work, `Graph`, or generated-content `Reader` work.

## Acceptance
- The selected-group card eyebrow no longer leads the card visually ahead of the title.
- The selected-group card metadata no longer reads like a stacked mini panel under the card title.
- The board still keeps source identity, date context, and view availability legible.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- targeted Vitest for `frontend/src/components/RecallWorkspace.stage37.test.tsx`
- targeted Vitest for `frontend/src/App.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check` for the Stage 515/516 harness pair
- live localhost GET checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 515 run against `http://127.0.0.1:8000`
- `git diff --check`
