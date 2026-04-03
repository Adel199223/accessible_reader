# ExecPlan: Stage 710 Reader Reading-First Hierarchy Reset After Stage 709

## Summary

- Reopen `Reader` as the sole active product surface after the completed Stage 708/709 Add Content reset.
- Use the March 28, 2026 Reader screenshots from this thread, the March 18, 2026 Recall Reader benchmark set, and Recall’s current Reader-plus-Notebook direction as the benchmark basis.
- Keep `Reader` read-only, keep `Notebook` as the companion workspace, and reduce the current stacked workspace feel so the article begins earlier and remains the primary field.
- Generated outputs remain frozen: no changes to what `Original`, `Reflowed`, `Simplified`, or `Summary` generate.

## Goals

- Compress the current three-band climb into reading:
  - quiet route shell
  - slimmer attached source strip
  - one compact Reader control band instead of a larger staged workspace header
- Retire the current over-explaining visible copy at rest, including:
  - `Reading deck`
  - `Reader dock`
  - `Derived locally for easier reading`
  - `Reflowed stays source-linked`
  - the default “One source stays primary…” support sentence
- Let the article dominate sooner on wide desktop while keeping support actions and Notebook work nearby.
- Demote the right-side support area from a standing co-equal dock into a lighter contextual rail that expands when the user opens source or Notebook context.

## Non-Goals

- No backend API, schema, storage, or route changes.
- No transform logic, generated payload, cache, or prompt changes.
- No `ReaderSurface` semantic/content changes.
- No reopening of `Home`, `Graph`, embedded `Notebook`, or `Study` beyond regression coverage.

## Implementation Outline

### 1. Attached source-strip compression

- Rework `SourceWorkspaceFrame` so the Reader-owned strip is shorter, calmer, and more attached to the reading deck.
- Keep the existing source tabs (`Overview`, `Reader`, `Notebook`, `Graph`, `Study`) and their continuity unchanged.
- Reduce redundant descriptive copy and chip density in the Reader-active source strip.

### 2. Reader stage reset

- Replace the current stage/kicker/summary stack with a reading-first control band:
  - compact provenance and mode context
  - calmer mode switching
  - one lighter utility row for read aloud, settings, and note capture
- Remove the large default explanatory copy that currently repeats source identity and mode purpose above the article.
- Keep read-aloud, settings, and note capture intact, but rebalance them so they stop feeling like the primary surface.

### 3. Article and support-rail rebalance

- Flatten the article shell so it feels less like a card nested inside another workspace card.
- Keep the article as the dominant lane and reduce dead gutter space on wide desktop.
- Convert the current support dock into a lighter contextual rail:
  - compact Source / Notebook tab rail at rest
  - lightweight counts/status chips
  - fuller Source or Notebook content only when the user opens that context or enters a related workflow
- Preserve source browsing, anchored note reopen, note editing, promotion flows, and Reader handoffs.

### 4. Generated-mode follow-through

- Keep the Stage 702 derived-mode context band concept, but compress it so it reads as attached provenance rather than a second product card above the article.
- Keep `Summary detail` inline in `Summary`, but render it as a compact utility control instead of a wide explanatory strip.
- Keep all generated-mode chrome outside the article surface.

## Acceptance

- The Reader route reads as a calmer, more deliberate reading surface with less stacked chrome above the article.
- The source strip is slimmer and the article begins earlier.
- `Reading deck` and `Reader dock` are no longer visible default headings.
- The support area is compact at rest and no longer feels like a standing co-equal dock.
- `Original`, `Reflowed`, `Simplified`, and `Summary` still show the same underlying content as before this pass.

## Validation

- targeted Vitest for `frontend/src/App.test.tsx`
- targeted Vitest for `frontend/src/components/ReaderSurface.test.tsx`
- targeted Vitest for `frontend/src/components/SourceWorkspaceFrame.test.tsx`
- targeted Vitest for `frontend/src/components/RecallShellFrame.test.tsx`
- targeted Vitest for `frontend/src/components/RecallWorkspace.stage34.test.tsx`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k graph -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node --check` for the Stage 710/711 Reader harness pair
- real Windows Edge Stage 710 and Stage 711 runs against `http://127.0.0.1:8000`
- `git diff --check`
