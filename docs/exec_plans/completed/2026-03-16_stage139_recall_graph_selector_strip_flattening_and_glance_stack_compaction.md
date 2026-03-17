# ExecPlan: Stage 139 Recall Graph Selector Strip Flattening And Glance-Stack Compaction

## Summary
- Implement the bounded Graph follow-up selected by the Stage 138 benchmark audit.
- Flatten the remaining browse-mode selector strip so search, glance context, and quick picks read as one light utility layer instead of a dedicated secondary column.
- Keep the graph canvas visually dominant while preserving the calmer selected-node overlay, evidence grounding, and source handoffs.

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
- Stage 138 confirmed that Graph still leads the remaining mismatch list, but now mainly because the left selector strip still reads like a visible secondary column beside the canvas.
- Three browse-mode leftovers still keep that strip heavier than the benchmark direction wants:
  - the search field and glance summary copy still occupy too much vertical setup before the canvas takes over
  - the `Quick picks` heading plus default pick stack still read like a separate list block rather than a light selector aid
  - the rail still feels more like one standing support column than one compact filter/settings strip
- The next bounded pass should preserve Graph grounding, validation, and Reader/source handoffs while flattening the remaining selector-strip stack.

## Goals
- Flatten the search, glance, and quick-pick stack into one lighter selector strip.
- Reduce the remaining dedicated-column feel so the graph canvas reads as the obvious primary surface.
- Preserve the calmer selected-node overlay, evidence grounding, validation actions, and Reader/source handoffs.

## Non-Goals
- Do not reopen Home, Study, Add Content, or focused reader-led work during this pass.
- Do not widen into backend, storage, or graph-model behavior changes.
- Do not reopen the deferred narrow-width rail/top-grid regression unless the Graph changes directly expose a must-fix break.
- Do not remove evidence grounding, confirm/reject actions, or Reader/source handoffs from Graph.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - flatten the remaining Graph browse-mode selector strip so search, glance context, and picks read as one lighter support layer
- `frontend/src/index.css`
  - compact the selector-strip spacing, headings, and list treatment while preserving current graph interactions
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - update Graph assertions to cover the flatter selector strip and calmer quick-pick framing
- `frontend/src/App.test.tsx`
  - keep broad shell continuity coverage aligned if the Graph browse structure shifts materially
- `scripts/playwright/stage139_graph_selector_strip_flattening_edge.mjs`
  - capture fresh Stage 139 Home, Graph, Study, and focused-Study artifacts in Windows Edge
- `scripts/playwright/stage140_post_stage139_benchmark_audit_edge.mjs`
  - stage the next audit harness so the follow-up benchmark pass can run immediately

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage139_graph_selector_strip_flattening_edge.mjs`
- `node --check scripts/playwright/stage140_post_stage139_benchmark_audit_edge.mjs`

## Outcome
- Stage 139 is complete.
- Graph browse mode now flattens the remaining selector strip by using a lighter search field, an inline glance summary, and a compact quick-picks kicker row instead of a taller stacked utility block with a dedicated section header.
- The quick-pick list is slimmer and the rail is slightly narrower, so the graph canvas keeps more of the page without changing the calmer selected-node overlay.
- Home, Study, and focused Study stayed stable in the fresh Stage 139 Edge captures, so the next step should be a benchmark audit rather than another assumed Graph pass.

## Exit Criteria
- Browse-mode Graph no longer reads like one dominant canvas plus a tall selector/support strip in fresh artifacts.
- Search, glance context, and quick picks feel like one lighter utility layer rather than stacked dedicated sections.
- Home, Study, and focused Study remain visually stable.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
