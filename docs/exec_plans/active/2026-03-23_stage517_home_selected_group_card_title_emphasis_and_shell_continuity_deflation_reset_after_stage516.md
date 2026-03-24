# ExecPlan: Stage 517 Home Selected-Group Card Title Emphasis And Shell Continuity Deflation Reset After Stage 516

## Summary
- Deflate the remaining selected-group card weight in `Home` after the Stage 516 audit.
- Soften title dominance and lighten the card shell so the selected-group board reads closer to Recall's leanest grouped-board rows.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Scope
- Wide desktop `Home` only.
- Selected-group board cards in the active drill-in state first:
  - card title emphasis
  - card shell weight and continuity with the surrounding results sheet
  - board and list view parity for the same selected-group row treatment
- Do not reopen organizer-rail work, `Graph`, or generated-content `Reader` work.

## Acceptance
- The selected-group card title no longer dominates the row as a heavier boxed heading.
- The selected-group card shell reads more like attached board continuation than a standalone mini panel.
- The row still keeps source identity and compact metadata legible after the shell/title deflation.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- targeted Vitest for `frontend/src/components/RecallWorkspace.stage37.test.tsx`
- targeted Vitest for `frontend/src/App.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check` for the Stage 517/518 harness pair
- live localhost GET checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 517 run against `http://127.0.0.1:8000`
- `git diff --check`
