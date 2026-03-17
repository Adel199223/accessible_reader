# ExecPlan: Stage 141 Recall Graph Intro Shell Demotion And Detail Overlay Compaction

## Summary
- Implement the bounded Graph follow-up selected by the Stage 140 benchmark audit.
- Demote the remaining duplicated intro framing around the graph canvas so the page reaches the graph stage more directly.
- Compact the selected-node overlay so it behaves like lightweight supporting evidence instead of a tall secondary panel.

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
- Stage 140 confirmed that Graph still leads the remaining mismatch list after Stage 139.
- The flattened selector strip is materially closer, but two browse-mode leftovers still keep the graph from matching the benchmark direction:
  - duplicated intro framing in the sidebar and surface header still spends too much vertical space explaining the graph before the canvas takes over
  - the selected-node overlay still reads as a tall right-side evidence panel with button and metadata stacks, which competes with the graph canvas more than the benchmark direction wants
- The next bounded pass should preserve grounding, validation, and Reader/source handoffs while reducing the remaining intro and overlay framing weight.

## Goals
- Demote or collapse the duplicated Graph intro shell so the canvas starts sooner and reads more directly.
- Compact the selected-node overlay so it feels like lightweight evidence support rather than a standing side panel.
- Preserve the calmer selector strip, evidence grounding, validation actions, and Reader/source handoffs.

## Non-Goals
- Do not reopen Home, Study, Add Content, or focused reader-led work during this pass.
- Do not widen into backend, storage, or graph-model behavior changes.
- Do not reopen the deferred narrow-width rail/top-grid regression unless the Graph changes directly expose a must-fix break.
- Do not remove evidence grounding, confirm/reject actions, or Reader/source handoffs from Graph.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - demote the remaining Graph browse-mode intro framing and compact the selected-node overlay structure
- `frontend/src/index.css`
  - reduce header/intro chrome above the canvas and slim the overlay footprint while preserving current graph interactions
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - update Graph assertions to cover the lighter intro shell and calmer overlay treatment
- `frontend/src/App.test.tsx`
  - keep broad shell continuity coverage aligned if the Graph browse structure shifts materially
- `scripts/playwright/stage141_graph_intro_shell_demotion_edge.mjs`
  - capture fresh Stage 141 Home, Graph, Study, and focused-Study artifacts in Windows Edge
- `scripts/playwright/stage142_post_stage141_benchmark_audit_edge.mjs`
  - stage the next audit harness so the follow-up benchmark pass can run immediately

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage141_graph_intro_shell_demotion_edge.mjs`
- `node --check scripts/playwright/stage142_post_stage141_benchmark_audit_edge.mjs`

## Exit Criteria
- Browse-mode Graph no longer spends extra top-of-surface space on duplicated intro framing in fresh artifacts.
- The selected-node overlay feels like lighter supporting evidence instead of a tall right-side panel.
- Home, Study, and focused Study remain visually stable.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
