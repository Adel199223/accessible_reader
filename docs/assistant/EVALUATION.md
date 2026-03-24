# Evaluation

Use the Recall benchmark workflow plus real Windows Edge validation when work touches the main browser UI or browser companion handoff.

## Primary Evaluation Truth

- `docs/ux/recall_benchmark_matrix.md`
- fresh screenshot or Playwright evidence when the Recall shell changes
- real Windows Edge validation for browser speech or extension handoff behavior

## Regression Surfaces

- `Home`
- `Graph`
- original-only `Reader`
- browser companion handoff when extension-facing behavior changes
