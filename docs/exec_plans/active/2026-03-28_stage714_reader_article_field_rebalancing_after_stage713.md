# ExecPlan: Stage 714 Reader Article-Field Rebalancing After Stage 713

## Summary

- Reopen `Reader` as the sole active product surface after the completed Stage 712/713 context-rail compaction pass.
- Use the March 28, 2026 Reader screenshots from this thread plus the freshly captured Stage 713 live evidence as the benchmark basis.
- Keep `Reader` read-only, keep `Notebook` as the editable companion workspace, and target the remaining wide-desktop mismatch: the support side is calmer now, but the article still reads like a large framed slab with too much dead right-side space inside the reading deck.
- Generated outputs remain frozen: no changes to what `Original`, `Reflowed`, `Simplified`, or `Summary` generate.

## Goals

- Reframe the article into a truer centered reading field instead of a broad boxed panel.
- Keep the compact Source / Notebook support seam from Stage 712/713 intact.
- Reduce the visible dead space inside the article shell on wide desktop without widening prose beyond the existing reader measure.
- Preserve Source and Notebook expansion flows, anchored note reopen, note editing, graph/study promotion, and Reader handoffs.

## Non-Goals

- No backend API, schema, storage, or route changes.
- No transform logic, generated payload, cache, or prompt changes.
- No `ReaderSurface` semantic/content changes.
- No reopening of `Home`, `Graph`, embedded `Notebook`, `Study`, or Add Content beyond regression coverage.

## Implementation Outline

### 1. Article-field shell rebalance

- Introduce a dedicated centered reading field inside the current Reader article lane.
- Make the outer article lane visually quieter so the visible reading surface is the centered field rather than one large slab.
- Keep the prose measure driven by the existing `ReaderSurface` width settings.

### 2. Support-seam continuity

- Preserve the compact at-rest Source / Notebook seam from Stage 712/713.
- Keep Source and Notebook expansion states structurally intact and attached to the article lane.
- Ensure short documents and long documents both keep a stable seam-to-article relationship after the new field is introduced.

### 3. Generated-mode follow-through

- Keep the current generated-mode context band and inline `Summary detail` controls.
- Ensure `Reflowed`, `Simplified`, and `Summary` inherit the calmer article-field framing without changing any underlying content text.
- Keep the summary-empty placeholder path valid for the current local dataset.

## Acceptance

- The default wide-desktop Reader state feels more reading-field-first than the Stage 713 baseline.
- The article no longer reads like one wide boxed slab with a large dead right-side gutter.
- The compact support seam remains intact at rest.
- Source and Notebook still expand cleanly into their full support workflows.
- Generated modes remain unchanged in content and keep their current support behavior.

## Validation

- targeted Vitest for `frontend/src/App.test.tsx`
- targeted Vitest for `frontend/src/components/SourceWorkspaceFrame.test.tsx`
- targeted Vitest for `frontend/src/components/ReaderSurface.test.tsx`
- targeted Vitest for `frontend/src/components/RecallShellFrame.test.tsx`
- targeted Vitest for `frontend/src/components/RecallWorkspace.stage34.test.tsx`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k graph -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node --check` for the Stage 714/715 Reader harness pair
- real Windows Edge Stage 714 and Stage 715 runs against `http://127.0.0.1:8000`
- `git diff --check`
