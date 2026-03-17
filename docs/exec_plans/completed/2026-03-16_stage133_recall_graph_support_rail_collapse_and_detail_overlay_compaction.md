# ExecPlan: Stage 133 Recall Graph Support Rail Collapse And Detail Overlay Compaction

## Summary
- Implement the bounded Graph follow-up selected by the Stage 132 benchmark audit.
- Collapse the left browse-mode support rail so the graph canvas reclaims visual dominance instead of sharing the page with a tall stacked utility column.
- Compact the selected-node detail overlay so evidence stays nearby without reading like a boxed dashboard panel inside the main graph frame.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Graph
  - Home / items
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Knowledge Graph overview](https://docs.getrecall.ai/docs/features/knowledge-graph/overview)
  - [How can LLMs and Knowledge Graphs help you build a second brain?](https://www.getrecall.ai/blog/how-can-llms-and-knowledge-graphs-help-you-build-a-second-brain)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Problem Statement
- Stage 132 confirmed that Home is materially closer after the Stage 131 unboxing pass and no longer leads the mismatch list.
- Graph now leads because two browse-mode framing leftovers still compete with the canvas-first benchmark direction:
  - the left support rail still consumes too much width and attention through stacked metrics, quick picks, and support cards
  - the selected-node detail overlay still reads like a boxed dashboard panel inside the main frame instead of lighter secondary evidence support
- The next bounded pass should keep Graph evidence grounding and validation actions intact while letting the canvas dominate the page more clearly.

## Goals
- Reduce the weight and width of the Graph support rail.
- Let the graph canvas reclaim more of the page and feel like the primary surface.
- Compact and soften the selected-node detail overlay so evidence stays close without over-framing the stage.

## Non-Goals
- Do not reopen Home, Study, Add Content, or focused reader-led work during this pass.
- Do not widen into backend, storage, or graph-model behavior changes.
- Do not reopen the deferred narrow-width rail/top-grid regression unless the Graph changes directly expose a must-fix break.
- Do not remove evidence grounding, confirm/reject actions, or Reader/source handoffs from Graph.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - rebalance the Graph browse layout so the support rail is lighter and the selected-node overlay reads as quieter secondary support
- `frontend/src/index.css`
  - collapse Graph rail weight, widen the canvas emphasis, and compact overlay framing while preserving current graph interactions
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - update Graph assertions to cover the lighter support rail and calmer detail-overlay treatment
- `frontend/src/App.test.tsx`
  - keep broad shell continuity coverage aligned if the Graph browse structure shifts materially
- `scripts/playwright/stage133_graph_support_rail_collapse_edge.mjs`
  - capture fresh Stage 133 Home, Graph, Study, and focused-Study artifacts in Windows Edge
- `scripts/playwright/stage134_post_stage133_benchmark_audit_edge.mjs`
  - stage the next audit harness so the follow-up benchmark pass can run immediately

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage133_graph_support_rail_collapse_edge.mjs`
- `node --check scripts/playwright/stage134_post_stage133_benchmark_audit_edge.mjs`

## Exit Criteria
- Browse-mode Graph no longer feels support-rail-first in fresh artifacts.
- The graph canvas is visibly more dominant than the support chrome.
- Selected-node evidence remains close, but the overlay no longer reads like a heavy dashboard panel.
- Home, Study, and focused Study remain visually stable.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
