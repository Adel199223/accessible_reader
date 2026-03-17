# ExecPlan: Stage 209 Recall Graph Selector Strip Narrowing And Detail Peek Footprint Reduction

## Summary
- Implement the next bounded slice selected by the Stage 208 benchmark audit.
- Keep iterating inside Graph browse mode because the fresh post-Stage-207 artifacts show Graph still leads the mismatch list.
- Reduce the remaining browse-mode side-column feel by narrowing the selector strip further and shrinking the default detail peek footprint.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Graph
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Knowledge Graph overview](https://docs.getrecall.ai/docs/features/knowledge-graph/overview)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Problem Statement
- Stage 208 reran cleanly and matched the full Stage 207 capture set without drift, so the audit finding is stable.
- Graph still leads after Stage 207 because the browse canvas is still visibly bracketed:
  - the left selector strip remains a standing utility column even after the header-collapse pass
  - the right selected-node peek still opens with enough size and persistent framing to read as a dock, not a clue
- The next pass should stay tightly bounded inside Graph browse mode and reduce footprint rather than reopen copy or broad shell work.

## Goals
- Narrow the open selector strip so the graph canvas keeps more width and the quick-pick utility reads less like a permanent side rail.
- Reduce the default selected-node peek footprint so the first-open state reads more like a floating clue than a dock.
- Preserve graph-first browsing, grounded evidence, source handoffs, and explicit confirm/reject actions in expanded detail.

## Non-Goals
- Do not reopen Home landing work unless a direct regression is exposed during Graph implementation.
- Do not widen into backend, storage, search behavior, or source import logic.
- Do not remove grounded node evidence or explicit Reader/source handoffs from expanded Graph detail.
- Do not revisit the deferred narrower-width rail/top-grid regression unless this Graph pass directly exposes a must-fix break.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - narrow the open selector strip treatment and reduce the default selected-node peek footprint
- `frontend/src/index.css`
  - rebalance Graph browse widths, quick-pick density, and peek sizing so the canvas stays more dominant
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - update Graph assertions to cover the slimmer strip and smaller peek state
- `frontend/src/App.test.tsx`
  - keep broad shell continuity coverage aligned if the Graph browse structure shifts materially
- `scripts/playwright/stage209_graph_selector_strip_narrowing_edge.mjs`
  - capture fresh Stage 209 Home, Graph, Study, and focused-Study artifacts in Windows Edge
- `scripts/playwright/stage210_post_stage209_benchmark_audit_edge.mjs`
  - stage the next audit harness so the follow-up benchmark pass can run immediately

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage209_graph_selector_strip_narrowing_edge.mjs`
- `node --check scripts/playwright/stage210_post_stage209_benchmark_audit_edge.mjs`

## Exit Criteria
- Graph browse mode shows a narrower selector strip and a smaller default selected-node peek in fresh artifacts.
- The canvas reads more dominant without losing grounded evidence, source handoffs, or decision actions in expanded detail.
- Home, Study, and focused Study remain visually stable.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
