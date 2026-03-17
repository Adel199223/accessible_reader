# ExecPlan: Stage 135 Recall Graph Quick-Pick Rail Slimming And Overlay Footprint Reduction

## Summary
- Implement the bounded Graph follow-up selected by the Stage 134 benchmark audit.
- Slim the left browse-mode quick-pick rail so it behaves more like a light selector than a second content column.
- Reduce the selected-node overlay footprint so evidence stays nearby without carving a tall right-edge panel out of the canvas.

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
- Stage 134 confirmed that Graph is materially closer after Stage 133 but still leads the mismatch list.
- Two browse-mode framing leftovers still compete with the canvas-first benchmark direction:
  - `Quick picks` still reads as a tall excerpt-heavy card stack instead of a lighter selector rail
  - the selected-node overlay still occupies too much height and width inside the stage, keeping a nested-panel feel alive
- The next bounded pass should keep Graph grounding and validation actions intact while making the rail and overlay feel lighter than the canvas they support.

## Goals
- Slim the quick-pick rail further and reduce its visual competition with the canvas.
- Reduce the selected-node overlay footprint so the graph stage feels more open.
- Preserve evidence grounding, validation actions, and Reader/source handoffs while demoting their framing.

## Non-Goals
- Do not reopen Home, Study, Add Content, or focused reader-led work during this pass.
- Do not widen into backend, storage, or graph-model behavior changes.
- Do not reopen the deferred narrow-width rail/top-grid regression unless the Graph changes directly expose a must-fix break.
- Do not remove evidence grounding, confirm/reject actions, or Reader/source handoffs from Graph.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - rebalance Graph quick picks and selected-node evidence structure so both supports read lighter than the canvas
- `frontend/src/index.css`
  - slim the quick-pick rail, shrink overlay footprint, and preserve current graph interactions
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - update Graph assertions to cover the lighter selector rail and smaller overlay footprint
- `frontend/src/App.test.tsx`
  - keep broad shell continuity coverage aligned if the Graph browse structure shifts materially
- `scripts/playwright/stage135_graph_quick_pick_rail_slimming_edge.mjs`
  - capture fresh Stage 135 Home, Graph, Study, and focused-Study artifacts in Windows Edge
- `scripts/playwright/stage136_post_stage135_benchmark_audit_edge.mjs`
  - stage the next audit harness so the follow-up benchmark pass can run immediately

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage135_graph_quick_pick_rail_slimming_edge.mjs`
- `node --check scripts/playwright/stage136_post_stage135_benchmark_audit_edge.mjs`

## Outcome
- Stage 135 is complete.
- Graph browse mode now uses a slimmer quick-pick selector rail with denser node meta instead of excerpt-heavy preview cards.
- The selected-node overlay now defaults to a smaller chip-led summary, shorter source handoff labels, one visible grounded mention, and relations only when they are actually present.
- Home, Study, and focused Study stayed stable in the fresh Stage 135 Edge captures, so the next step should be a benchmark audit rather than another assumed Graph pass.

## Exit Criteria
- Browse-mode Graph no longer reads like one canvas plus a second tall card column in fresh artifacts.
- The selected-node overlay occupies a meaningfully smaller footprint while keeping evidence and actions nearby.
- Home, Study, and focused Study remain visually stable.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
