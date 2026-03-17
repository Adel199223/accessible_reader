# ExecPlan: Stage 143 Recall Graph Support Framing Collapse And Detail Peek Default

## Summary
- Implement the bounded Graph follow-up selected by the Stage 142 benchmark audit.
- Collapse the remaining support framing around the graph canvas so browse mode no longer reads like a three-column dashboard.
- Reduce the selected-node detail to a smaller default peek state while preserving grounded evidence and validation controls.

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
- Stage 142 confirmed that Graph still leads after Stage 141, but the remaining mismatch is narrower and more specific.
- The intro shell is no longer the main blocker; the remaining weight now comes from the supports around the canvas:
  - the left selector strip still uses stacked quick-pick cards and metric text that read like a dedicated support column
  - the selected-node overlay still defaults to a fully open evidence panel, so the right side of the page still feels occupied before the user asks for deeper inspection
- The next bounded pass should preserve grounding and actions while making the canvas feel more primary by default.

## Goals
- Flatten the remaining left selector-strip framing so quick picks read more like a light utility list than a card stack.
- Reduce the selected-node overlay to a smaller default peek treatment that expands detail progressively.
- Preserve grounding, confirm/reject controls, Reader/source handoffs, and current Home/Study/focused-study baselines.

## Non-Goals
- Do not reopen Home, Study, Add Content, or focused reader-led work during this pass.
- Do not widen into backend, storage, or graph-model behavior changes.
- Do not reopen the deferred narrow-width rail/top-grid regression unless the Graph changes directly expose a must-fix break.
- Do not remove evidence grounding, confirm/reject actions, or Reader/source handoffs from Graph.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - flatten the remaining Graph selector-strip framing and introduce a smaller default detail peek state
- `frontend/src/index.css`
  - reduce card/column weight around the canvas while preserving current graph interactions
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - update Graph assertions to cover the flatter selector strip and smaller default detail state
- `frontend/src/App.test.tsx`
  - keep broad shell continuity coverage aligned if the Graph browse structure shifts materially
- `scripts/playwright/stage143_graph_support_framing_collapse_edge.mjs`
  - capture fresh Stage 143 Home, Graph, Study, and focused-Study artifacts in Windows Edge
- `scripts/playwright/stage144_post_stage143_benchmark_audit_edge.mjs`
  - stage the next audit harness so the follow-up benchmark pass can run immediately

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage143_graph_support_framing_collapse_edge.mjs`
- `node --check scripts/playwright/stage144_post_stage143_benchmark_audit_edge.mjs`

## Exit Criteria
- Browse-mode Graph no longer reads as a three-column dashboard around the canvas in fresh artifacts.
- The left selector strip feels like lighter utility support instead of a boxed quick-pick stack.
- The selected-node detail defaults to a smaller peek state while preserving grounded actions and inspection depth.
- Home, Study, and focused Study remain visually stable.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
