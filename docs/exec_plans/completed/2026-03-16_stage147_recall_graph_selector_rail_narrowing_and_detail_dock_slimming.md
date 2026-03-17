# ExecPlan: Stage 147 Recall Graph Selector Rail Narrowing And Detail Dock Slimming

## Summary
- Implement the bounded Graph follow-up selected by the Stage 146 benchmark audit.
- Reduce the remaining left selector-strip footprint and slim the right selected-node dock so the graph canvas reads more clearly as the dominant surface.
- Keep the calmer Home landing and the stable Study/focused-study baselines intact.

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
- Stage 146 confirmed that Home is materially closer after Stage 145 and no longer leads the mismatch list.
- Graph now leads because the browse surface is still bracketed by support framing:
  - the left selector strip still reads as a dedicated support sidebar with stacked search, metrics, and quick picks
  - the selected-node detail still opens as a noticeable right-side dock instead of a lighter edge peek
- The next pass should reduce both side supports without removing grounded actions or reintroducing heavy Graph chrome elsewhere.

## Goals
- Narrow and quiet the remaining left selector strip so it reads like light utility beside the graph canvas.
- Slim the right selected-node dock so the canvas keeps more of the page while grounded actions stay available.
- Preserve the calmer Home landing, current Study browse layout, and reader-led focused Study behavior.

## Non-Goals
- Do not reopen Home, Study, Add Content, or focused reader-led work during this pass.
- Do not widen into backend, storage, graph extraction logic, or validation semantics.
- Do not remove confirm/reject actions, evidence grounding, or Reader/source handoffs from the selected-node flow.
- Do not reopen the deferred narrow-width rail/top-grid regression unless the Graph changes directly expose a must-fix break.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - narrow the remaining Graph selector rail and slim the selected-node dock structure
- `frontend/src/index.css`
  - reduce left/right Graph support framing so the canvas becomes more dominant
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - update Graph assertions to cover the narrower selector rail and slimmer node-detail dock
- `frontend/src/App.test.tsx`
  - keep broad shell continuity coverage aligned if the Graph browse layout shifts materially
- `scripts/playwright/stage147_graph_selector_rail_narrowing_edge.mjs`
  - capture fresh Stage 147 Home, Graph, Study, and focused-Study artifacts in Windows Edge
- `scripts/playwright/stage148_post_stage147_benchmark_audit_edge.mjs`
  - stage the next audit harness so the follow-up benchmark pass can run immediately

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage147_graph_selector_rail_narrowing_edge.mjs`
- `node --check scripts/playwright/stage148_post_stage147_benchmark_audit_edge.mjs`

## Exit Criteria
- Graph no longer reads as bracketed by two standing support columns in fresh artifacts.
- The graph canvas is more clearly dominant without losing evidence grounding or selected-node actions.
- Home, Study, and focused Study remain visually stable.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
