# ExecPlan: Stage 700 Reader Workspace IA And Shell Reset Across All Modes After Stage 699

## Summary
- Continue the queued roadmap immediately after the completed Stage 698/699 embedded Notebook follow-through with the first broad Reader-only UI/UX reset.
- Rework the Reader route, source-workspace lead-in, and docked source/Notebook context so the Reader feels like a deliberate product surface instead of an older parity shell with a document and sidecar attached together.
- Keep generated content frozen: no changes to what `Original`, `Reflowed`, `Simplified`, or `Summary` generate, no transform logic changes, no cache-key changes, and no mode-routing changes.

## Scope
- Rework `frontend/src/components/ReaderWorkspace.tsx`, `frontend/src/components/RecallShellFrame.tsx`, `frontend/src/components/SourceWorkspaceFrame.tsx`, and `frontend/src/index.css`.
- Keep `frontend/src/components/ReaderSurface.tsx` as the content-rendering invariant.
- Reader route shell reset:
  - calm the Reader-specific topbar hierarchy so it stops repeating `Reader workspace` and section chrome more loudly than the document itself
  - keep global `Search` and `New`, but let the Reader route read quieter and more document-first
- Source-workspace strip reset for Reader-owned source focus:
  - compress the focused-source strip in the Reader route so it clears faster into the reading deck
  - keep `Overview`, `Reader`, `Notebook`, `Graph`, and `Study` tabs intact, but make the strip feel more like a compact attached source context than a second header block
- Reader shell and IA reset across all modes:
  - replace the older stage/kicker/control/glance stacking with a calmer unified Reader header and workbench structure
  - keep mode switching, read-aloud, note capture, settings, and generation actions intact, but regroup them into a clearer hierarchy
  - keep the article as the primary lane in every mode
  - keep the source/Notebook dock attached, but make it a clearer contextual workbench rather than a narrow overloaded side stack
  - tighten the empty state and unavailable state so they feel like part of the Reader product rather than generic setup cards
- Notebook/source dock reset:
  - keep `Source` and `Notebook` tabs
  - make the `Source` pane read as a calmer source context plus source library workbench
  - make the `Notebook` pane read as a calmer saved-note workbench, with selected-note editing and promotion actions grouped more deliberately
  - preserve anchored note reopen, note capture, edit/delete, graph promotion, study promotion, and Reader handoff behavior
- Keep `Home`, `Graph`, embedded `Notebook`, and `Study` as regression surfaces only.

## Guardrails
- Do not change generated content:
  - no modifications to `fetchDocumentView` contracts
  - no modifications to `generateDocumentView` behavior
  - no modifications to `ReaderSurface` rendering semantics beyond wrapper classes or parent layout context
  - no modifications to backend transform payloads, prompt logic, caching, or storage
- Preserve:
  - `/reader` route compatibility
  - source-workspace tab continuity
  - browser-native read aloud
  - sentence highlighting and sentence jump behavior
  - search note handoff into anchored Reader reopen
  - note capture and promotion flows
  - current recall-shell navigation and global `Search` / `New`
- Avoid reopening `Home`, `Graph`, or `Study` beyond regression-safe shell/source-strip adjustments required by the Reader route.

## Acceptance
- The Reader route reads as a calmer, more deliberate product surface with less stacked chrome before the document begins.
- The source-workspace strip is visibly slimmer and clears faster into the Reader deck without losing tab continuity.
- The document remains the primary lane in every mode.
- The source/Notebook dock feels like a clearer contextual workbench instead of a cramped parity sidecar.
- `Original`, `Reflowed`, `Simplified`, and `Summary` still show the same underlying content outputs as before this pass.
- Search note reopen, anchored note work, source-workspace tab switching, and global `Search` / `New` remain intact.

## Validation
- targeted Vitest for `frontend/src/App.test.tsx`
- targeted Vitest for `frontend/src/components/ReaderSurface.test.tsx`
- targeted Vitest for `frontend/src/components/SourceWorkspaceFrame.test.tsx`
- targeted Vitest for `frontend/src/components/RecallShellFrame.test.tsx`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k graph -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node --check` for the Stage 700/701 Reader harness pair
- real Windows Edge Stage 700 and Stage 701 runs against `http://127.0.0.1:8000`
- `git diff --check`
