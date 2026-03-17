# ExecPlan: Stage 137 Recall Graph Utility Metrics Collapse And Quick-Pick Truncation

## Summary
- Implement the bounded Graph follow-up selected by the Stage 136 benchmark audit.
- Collapse the left browse-mode utility metrics and focused-source framing so the rail behaves more like a glance-level selector than a secondary dashboard.
- Shorten the default quick-pick stack further so the graph canvas keeps visual dominance over the remaining rail support.

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
- Stage 136 confirmed that Graph is materially closer after Stage 135 but still leads the remaining mismatch list.
- Two browse-mode rail leftovers still compete with the graph-first benchmark direction:
  - the utility stack still opens with multiple chip metrics and a separate last-focused-source block, which keeps the rail reading like a secondary utility column instead of one calmer settings/filter strip
  - the quick-pick list is denser than before, but the default stack still runs tall enough to keep the left side visually busier than the benchmark direction wants
- The next bounded pass should keep Graph grounding, validation, and Reader/source handoffs intact while reducing the remaining left-rail framing weight.

## Goals
- Collapse the Graph utility metrics and focus note into a smaller glance-level summary.
- Shorten and calm the default quick-pick stack so the rail behaves more like a selector strip than a second column.
- Preserve the calmer overlay, evidence grounding, validation actions, and Reader/source handoffs.

## Non-Goals
- Do not reopen Home, Study, Add Content, or focused reader-led work during this pass.
- Do not widen into backend, storage, or graph-model behavior changes.
- Do not reopen the deferred narrow-width rail/top-grid regression unless the Graph changes directly expose a must-fix break.
- Do not remove evidence grounding, confirm/reject actions, or Reader/source handoffs from Graph.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - rebalance the Graph browse-mode utility rail so metrics and quick picks read lighter than the canvas they support
- `frontend/src/index.css`
  - collapse the remaining Graph rail chrome, tighten the selector stack, and preserve current graph interactions
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - update Graph assertions to cover the lighter utility summary and shorter quick-pick rail
- `frontend/src/App.test.tsx`
  - keep broad shell continuity coverage aligned if the Graph browse structure shifts materially
- `scripts/playwright/stage137_graph_utility_metrics_collapse_edge.mjs`
  - capture fresh Stage 137 Home, Graph, Study, and focused-Study artifacts in Windows Edge
- `scripts/playwright/stage138_post_stage137_benchmark_audit_edge.mjs`
  - stage the next audit harness so the follow-up benchmark pass can run immediately

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage137_graph_utility_metrics_collapse_edge.mjs`
- `node --check scripts/playwright/stage138_post_stage137_benchmark_audit_edge.mjs`

## Outcome
- Stage 137 is complete.
- Graph browse mode now collapses the rail metrics and focused-source block into one compact glance summary instead of a stacked utility cluster.
- The default quick-pick stack is shorter and calmer, so the left rail reads more like a thin selector strip beside the graph canvas.
- Home, Study, and focused Study stayed stable in the fresh Stage 137 Edge captures, so the next step should be a benchmark audit rather than another assumed Graph pass.

## Exit Criteria
- Browse-mode Graph no longer opens as one canvas plus a tall stack of metrics and quick picks in fresh artifacts.
- The utility rail reads like a smaller selector strip while the canvas remains clearly dominant.
- Home, Study, and focused Study remain visually stable.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
