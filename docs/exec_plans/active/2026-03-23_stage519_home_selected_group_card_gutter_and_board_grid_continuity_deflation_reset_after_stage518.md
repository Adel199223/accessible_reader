# ExecPlan: Stage 519 Home Selected-Group Card Gutter And Board-Grid Continuity Deflation Reset After Stage 518

## Summary
- Deflate the remaining selected-group board tiling in `Home` after the Stage 518 audit.
- Reduce gutter weight and soften board-grid segmentation so the selected-group board reads closer to Recall's calmer continuous results sheet.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Scope
- Wide desktop `Home` only.
- Selected-group board continuity in the active drill-in state first:
  - card gutter density between adjacent selected-group rows
  - board-grid continuity so the card field reads less like separate tiles
  - board and list view parity for the same calmer selected-group continuity treatment
- Do not reopen organizer-rail work, `Graph`, or generated-content `Reader` work.

## Acceptance
- The selected-group board no longer feels as tiled because gutter weight between adjacent cards is reduced.
- The selected-group card field reads more like one continuous results sheet instead of a set of separate mini-panels.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- targeted Vitest for `frontend/src/components/RecallWorkspace.stage37.test.tsx`
- targeted Vitest for `frontend/src/App.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check` for the Stage 519/520 harness pair
- live localhost GET checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 519 run against `http://127.0.0.1:8000`
- `git diff --check`
