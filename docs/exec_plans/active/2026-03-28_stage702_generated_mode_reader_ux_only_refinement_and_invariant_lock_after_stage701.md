# ExecPlan: Stage 702 Generated-Mode Reader UX-Only Refinement And Invariant Lock After Stage 701

## Summary
- Continue the queued roadmap immediately after the completed Stage 700/701 Reader IA reset with a generated-mode-only Reader follow-through.
- Refine `Reflowed`, `Simplified`, and `Summary` so their mode context, provenance, and next-step branching read more deliberately without changing any generated output text or generation behavior.
- Keep `Original` as the stable regression baseline from Stage 700/701; generated-mode work should attach to the current Reader shell rather than reopening the whole route again.

## Scope
- Rework `frontend/src/components/ReaderWorkspace.tsx`, `frontend/src/components/SettingsPanel.tsx`, `frontend/src/index.css`, and the Reader-facing tests/harnesses.
- Generated-mode UX-only refinement:
  - add an attached derived-mode context band above the article for `Reflowed`, `Simplified`, and `Summary`
  - strengthen provenance/source visibility so generated modes clearly read as attached to the current saved source
  - tighten scan order by moving summary-detail choice into the generated summary flow instead of burying it in the settings drawer
  - make Notebook / Graph / Study branching points clearer from generated modes without forcing a route change to continue reading
  - keep missing generated-view states calm and mode-specific instead of treating them like generic placeholders
- Invariant lock:
  - generated-mode chrome must stay outside the article content surface
  - no changes to `ReaderSurface` rendering semantics
  - no changes to backend fetch/generate contracts or the text shown inside generated views

## Guardrails
- Do not change generated content:
  - no modifications to `fetchDocumentView` contracts
  - no modifications to `generateDocumentView` behavior
  - no modifications to backend transform payloads, prompt logic, caching, or storage
  - no changes to the underlying text inside `Original`, `Reflowed`, `Simplified`, or `Summary`
- Preserve:
  - `/reader` route compatibility
  - browser-native read aloud
  - sentence highlighting and sentence jump behavior
  - anchored note reopen
  - source-workspace tab continuity
  - note capture and promotion flows
  - global `Search` / `New`
- Keep `Home`, `Graph`, embedded `Notebook`, and `Study` as regression surfaces only.

## Acceptance
- Generated modes now read as derived views of the current source instead of the same shell with different article text.
- `Summary` detail control lives in the generated summary flow with clearer scan order.
- Notebook / Graph / Study branching is obvious from generated-mode Reader without making the article secondary.
- Generated-mode chrome stays outside the article surface and does not mutate generated content text.
- `Original` remains stable, and `Reflowed`, `Simplified`, and `Summary` still show the same underlying content outputs as before this pass.

## Validation
- targeted Vitest for `frontend/src/App.test.tsx`
- targeted Vitest for `frontend/src/components/ReaderSurface.test.tsx`
- targeted Vitest for `frontend/src/components/RecallShellFrame.test.tsx`
- targeted Vitest for `frontend/src/components/SourceWorkspaceFrame.test.tsx`
- targeted Vitest for `frontend/src/components/RecallWorkspace.stage34.test.tsx`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k graph -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node --check` for the Stage 702/703 Reader harness pair
- real Windows Edge Stage 702 and Stage 703 runs against `http://127.0.0.1:8000`
- `git diff --check`
