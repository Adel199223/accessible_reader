# ExecPlan: Stage 711 Post-Stage-710 Reader Reading-First Hierarchy Reset Audit

## Summary

- Audit the Stage 710 Reader hierarchy reset against the March 28, 2026 local screenshots, the existing March 18, 2026 Reader benchmark set, and the frozen generated-content constraints.

## Audit Targets

- Above-the-fold Reader hierarchy:
  - slimmer Reader-owned source strip
  - calmer Reader control band
  - earlier article start
  - no visible `Reading deck` heading at rest
- Support-rail behavior:
  - no visible `Reader dock` heading at rest
  - compact Source / Notebook rail at rest
  - Source context expands when opened
  - Notebook context expands when opened
  - selected note editing remains available inside Reader context
- Generated-mode follow-through:
  - `Reflowed`, `Simplified`, and `Summary` derived-mode chrome stays outside the article
  - `Summary detail` remains inline in `Summary`
  - no visible generated-text mutation
- Regression surfaces:
  - `Home`
  - `Graph`
  - embedded `Notebook`
  - `Study`

## Validation Ladder

- targeted Vitest for Reader route, source strip, and shell continuity
- `npm run build`
- `node --check` for Stage 710/711 Playwright files
- live Windows Edge Stage 711 audit against `http://127.0.0.1:8000`
- `git diff --check`

## Acceptance Bar

- Reader is materially closer to a reading-first Recall-like hierarchy on wide desktop.
- The article is the clear dominant field earlier in the viewport.
- The support rail is compact by default and expands only when the user enters Source or Notebook context.
- Generated outputs remain unchanged.
