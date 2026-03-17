# ExecPlan: Stage 205 Recall Graph Selector Strip Collapse And Detail Peek Deflation

## Summary
- Implement the next bounded slice selected by the Stage 204 benchmark audit.
- Further reduce the remaining Graph browse-mode bracketing by collapsing the open selector strip into lighter utility and by deflating the default selected-node peek.
- Keep the calmer Home landing, Study browse, and focused-study surfaces stable while Graph converges further toward the Recall benchmark direction.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Graph
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Knowledge Graph overview](https://docs.getrecall.ai/docs/features/knowledge-graph/overview)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Problem Statement
- Stage 204 confirmed that Graph still leads after the Stage 203 canvas-bracketing reduction pass, even though the mismatch is narrower now.
- The remaining visible mismatch is concentrated in two browse-mode support columns:
  - the left selector strip still stacks search, glance, and quick picks like a standing utility rail
  - the right selected-node dock still opens as a tall peek panel that brackets the canvas before the user asks for full detail
- The next pass should therefore stay tightly bounded inside Graph browse mode and reduce those two framing hotspots without reopening Home, Study, or backend work.

## Goals
- Collapse the left selector strip so search and node-pick utility read more like one lightweight selector surface instead of a stacked rail.
- Reduce the default selected-node peek so it feels like a compact grounded clue, not a standing side panel.
- Preserve graph-first browsing, grounded evidence, source handoffs, and explicit decision actions in the expanded detail state.

## Non-Goals
- Do not reopen Home landing work unless a direct regression is exposed during Graph implementation.
- Do not widen into backend, storage, search behavior, or source import logic.
- Do not remove grounded node evidence or the explicit Reader/source handoffs from expanded Graph detail.
- Do not revisit the deferred narrower-width rail/top-grid regression unless this Graph pass directly exposes a must-fix break.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - collapse the open selector strip utility stack and further demote the default selected-node peek
- `frontend/src/index.css`
  - rebalance Graph rail width, quick-pick density, and peek-dock framing so the canvas stays more dominant
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - update Graph assertions to cover the lighter selector strip and the smaller default peek state
- `frontend/src/App.test.tsx`
  - keep broad shell continuity coverage aligned if the browse-mode Graph structure shifts materially
- `scripts/playwright/stage205_graph_selector_strip_collapse_edge.mjs`
  - capture fresh Stage 205 Home, Graph, Study, and focused-Study artifacts in Windows Edge
- `scripts/playwright/stage206_post_stage205_benchmark_audit_edge.mjs`
  - stage the next audit harness so the follow-up benchmark pass can run immediately

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage205_graph_selector_strip_collapse_edge.mjs`
- `node --check scripts/playwright/stage206_post_stage205_benchmark_audit_edge.mjs`

## Exit Criteria
- Graph browse mode shows a lighter open selector strip and a smaller default selected-node peek in fresh artifacts.
- The canvas reads more dominant without losing grounded evidence, source handoffs, or decision actions in expanded detail.
- Home, Study, and focused Study remain visually stable.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.

## Outcome
- Stage 205 is complete.
- Graph browse mode now merges the selector-strip glance into the quick-pick bar, shortens the default quick-pick stack, and opens selected-node detail in a smaller inline peek instead of a mini-card-like panel.
- Validation is green:
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
  - `node --check scripts/playwright/stage205_graph_selector_strip_collapse_edge.mjs`
  - `node --check scripts/playwright/stage206_post_stage205_benchmark_audit_edge.mjs`
  - `node scripts/playwright/stage205_graph_selector_strip_collapse_edge.mjs`
- Fresh Stage 205 artifacts were captured for Home, Graph, Study, and focused Study.
- Home, Study, and focused Study matched the Stage 204 captures byte-for-byte, while Graph changed as expected for the bounded browse-mode correction.
