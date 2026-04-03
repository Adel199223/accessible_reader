# ExecPlan: Stage 712 Reader Context-Rail Compaction After Stage 711

## Summary

- Reopen `Reader` as the sole active product surface after the completed Stage 710/711 reading-first reset.
- Use the March 28, 2026 Reader screenshots from this thread plus the freshly captured Stage 711 live evidence as the benchmark basis.
- Keep `Reader` read-only, keep `Notebook` as the editable companion workspace, and target the remaining idle-state mismatch: the support side is calmer now, but the compact Source / Notebook rail still reads too text-heavy at rest.
- Generated outputs remain frozen: no changes to what `Original`, `Reflowed`, `Simplified`, or `Summary` generate.

## Goals

- Compress the at-rest Source / Notebook support rail into a slimmer contextual tray.
- Remove descriptive support copy from the collapsed state so the article lane feels broader and less interrupted.
- Preserve full Source and Notebook workflows when the rail is explicitly opened:
  - source browsing
  - saved-note editing
  - anchored note reopen
  - graph/study promotion
  - Reader handoffs
- Keep the existing Stage 710 source strip and stage-control compression intact unless a tiny follow-through adjustment is needed to support the new compact tray.

## Non-Goals

- No backend API, schema, storage, or route changes.
- No transform logic, generated payload, cache, or prompt changes.
- No `ReaderSurface` semantic/content changes.
- No reopening of `Home`, `Graph`, embedded `Notebook`, `Study`, or Add Content beyond regression coverage.

## Implementation Outline

### 1. Compact-at-rest support tray

- Rework the collapsed Reader support rail so it shows only:
  - Source / Notebook tab rail
  - a very small set of status chips or counts
  - no paragraph-like explanatory text
- Make the collapsed rail feel closer to a utility tray than a mini dashboard card.
- Preserve accessible labels even when visible text is reduced.

### 2. Expanded-state continuity

- Keep expanded Source and Notebook states structurally intact.
- Continue showing the fuller library/workbench content only after the user:
  - opens Source
  - opens Notebook
  - starts note capture
  - opens a saved note
  - lands in an anchored/support workflow that must reveal context
- If needed, make small width/balance adjustments so the expanded rail remains useful without over-shrinking the article.

### 3. Derived-mode compact follow-through

- Keep the current Stage 710/711 generated-mode band structure.
- Ensure the compact support tray still behaves well in `Reflowed`, `Simplified`, and `Summary`.
- Keep the summary-empty placeholder path valid for live local datasets.

## Acceptance

- The default wide-desktop Reader state feels more article-first than the Stage 711 baseline.
- The compact support rail no longer reads like a text block at rest.
- Opening Source or Notebook still reveals the full support workspace cleanly.
- Generated modes remain unchanged in content and still keep their support flows intact.

## Validation

- targeted Vitest for `frontend/src/App.test.tsx`
- targeted Vitest for `frontend/src/components/SourceWorkspaceFrame.test.tsx`
- targeted Vitest for `frontend/src/components/ReaderSurface.test.tsx`
- targeted Vitest for `frontend/src/components/RecallShellFrame.test.tsx`
- targeted Vitest for `frontend/src/components/RecallWorkspace.stage34.test.tsx`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k graph -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node --check` for the Stage 712/713 Reader harness pair
- real Windows Edge Stage 712 and Stage 713 runs against `http://127.0.0.1:8000`
- `git diff --check`
