# ExecPlan: Stage 870 Home Mixed Preview Balance And Rendered-Asset Preservation After Stage 869

## Summary
- Reopen `Home` intentionally from the completed Stage 868/869 card-scanability baseline.
- Keep weak local-capture cards text-first/hybrid while proving meaningful rendered previews remain available for Web and Documents boards.
- Preserve the Stage 829-869 Home density, top-band, organizer, Matches, hidden-state, and no-clipping baselines while keeping Reader, Graph, Notebook, and Study as regressions only.

## Implementation Focus
- In `frontend/src/components/RecallWorkspace.tsx`, keep the Stage 868 weak-local hybrid logic scoped to `paste` plus `content-rendered-preview`.
- Add explicit Stage 870 card evidence for meaningful rendered image previews so Web, Documents, HTML snapshots, and image-rich cards are not misclassified as weak local previews.
- Extend Home Vitest and the shared Home Playwright audit with selected Web/Documents preview metrics and captures.
- Keep the implementation UI-only with no backend, schema, storage, generated Reader output, Graph, Study, or Notebook contract changes.

## Validation
- targeted Home/App Vitest
- `npm run build`
- backend graph pytest
- `node --check` on the shared Home harness and Stage 870/871 scripts
- live Stage 870/871 browser runs
- `git diff --check`
