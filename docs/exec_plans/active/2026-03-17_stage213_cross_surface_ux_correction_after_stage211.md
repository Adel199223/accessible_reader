# ExecPlan: Stage 213 Cross-Surface UX Correction After Stage 211

## Summary
- Implement the approved user-directed cross-surface UX correction as the active roadmap slice.
- Treat this as a bounded correction that supersedes the Graph-only Stage 211 micro-pass while absorbing the known Stage 211 Graph browse-mode bracketing work into the broader pass.
- Keep backend contracts, persistence, routing, search behavior, continuity state, and Reader generation behavior unchanged.

## Problem Statement
- The current shell and top-level surfaces are individually calmer than earlier roadmap checkpoints, but they still read like adjacent local optimizations rather than one coherent product surface.
- Home still relies on multiple near-duplicate source-entry patterns.
- Graph still carries the Stage 210/211 browse-mode problem where the selector strip and default detail peek bracket the canvas.
- Study and Notes still spread attention across too many small support layers.
- Reader has meaningful layout and typography polish opportunities, but its generation rules and generated outputs must remain untouched.

## Goals
- Make the shell, Home, Graph, Study, Notes, and Reader feel more coherent, polished, and intentional without destabilizing behavior.
- Improve contrast, hierarchy, spacing, grouping, discoverability, and focus/hover states across the main sections.
- Finish the missing Stage 211 Graph browse-mode chrome collapse inside the broader pass.
- Keep Reader generated-view behavior and all content-generation logic unchanged.

## Non-Goals
- Do not change backend APIs, storage, routes, continuity semantics, search semantics, or content-generation logic.
- Do not change Reader generation timing or output rules for `Reflowed`, `Simplified`, or `Summary`.
- Do not widen into risky refactors, large renames, or architecture changes.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - simplify Home source-entry patterns
  - implement the Graph browse/focused chrome reductions
  - tighten Study browse support framing
  - clarify Notes browse/detail hierarchy
- `frontend/src/components/ReaderWorkspace.tsx`
  - compress Reader chrome and clarify the Reader side rail without touching generation behavior
- `frontend/src/components/RecallShellFrame.tsx`
  - tighten shell spacing and active-state framing
- `frontend/src/components/ImportPanel.tsx`
  - flatten the Add Content modal hierarchy
- `frontend/src/components/WorkspaceSearchSurface.tsx`
  - reduce search-dialog framing and make results more list-like
- `frontend/src/components/LibraryPane.tsx`
  - rename and tighten Reader-side source browsing
- `frontend/src/components/ReaderSurface.tsx`
  - keep semantics the same while supporting Reader typography/polish
- `frontend/src/index.css`
  - section-scoped shell, Home, Graph, Study, Notes, and Reader styling updates
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - update Home / Graph / Study / Notes assertions
- `frontend/src/components/ReaderSurface.test.tsx`
  - update only if ReaderSurface classes/ARIA hooks change
- `frontend/src/App.test.tsx`
  - keep shell and route continuity coverage aligned with the new labels/structure

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/components/ReaderSurface.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node --check scripts/playwright/stage213_cross_surface_ux_correction_edge.mjs`
- `node --check scripts/playwright/stage214_post_stage213_cross_surface_benchmark_audit_edge.mjs`
- run the Stage 213 Windows Edge harness if the local frontend is available

## Exit Criteria
- Home uses a clearer, more consistent source-entry flow with less duplicated framing.
- Graph browse mode no longer reads bracketed by a standing selector strip and persistent empty/default detail dock.
- Study and Notes feel calmer and more intentional without losing current actions or data flows.
- Reader starts the text higher, reads more clearly, and keeps its generated-view behavior unchanged.
- Shell density, search, and add-content flows feel better integrated with the main workspace.

## Execution Note
- Keep changes section-scoped wherever possible. Avoid broad edits to shared primitives unless the gain is clearly cross-surface and low-risk.
