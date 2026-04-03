# ExecPlan: Stage 715 Post-Stage-714 Reader Article-Field Rebalancing Audit

## Summary

- Audit the Stage 714 Reader article-field rebalancing pass against the March 28, 2026 Reader screenshots from this thread and the Stage 713 context-rail baseline.

## Audit Targets

- Default Reader article field:
  - article reads as a centered reading field rather than a broad slab
  - the visible dead right-side shell area is materially reduced
  - the compact support seam remains attached and calm at rest
- Expanded support continuity:
  - Source support opens cleanly and reveals the source library
  - Notebook support opens cleanly and reveals the saved-note workbench
  - saved-note editing remains available in Reader context
- Generated-mode continuity:
  - the derived-mode band remains intact
  - `Summary detail` stays inline in `Summary`
  - the summary-empty placeholder path still works when live data does not include a generated summary article
- Regression surfaces:
  - `Home`
  - `Graph`
  - embedded `Notebook`
  - `Study`

## Validation Ladder

- targeted Vitest for Reader route, article field, source strip, and shell continuity
- `npm run build`
- `node --check` for Stage 714/715 Playwright files
- live Windows Edge Stage 715 audit against `http://127.0.0.1:8000`
- `git diff --check`

## Acceptance Bar

- Reader is materially more reading-field-first than the Stage 713 baseline.
- The article no longer reads like one wide boxed slab.
- The compact support seam remains intact and calm at rest.
- Source and Notebook still expand into the fuller support workflows without regression.
- Generated outputs remain unchanged.
