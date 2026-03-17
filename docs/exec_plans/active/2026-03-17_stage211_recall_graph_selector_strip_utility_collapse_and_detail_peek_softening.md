# ExecPlan: Stage 211 Recall Graph Selector Strip Utility Collapse And Detail Peek Softening

## Summary
- Implement the next bounded slice selected by the Stage 210 benchmark audit.
- Keep iterating inside Graph browse mode because the fresh post-Stage-209 artifacts show Graph still leads the mismatch list.
- Reduce the remaining browse-mode bracketing by collapsing the selector-strip utility stack further and softening the default detail-peek framing.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Graph
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Knowledge Graph overview](https://docs.getrecall.ai/docs/features/knowledge-graph/overview)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Problem Statement
- Stage 210 reran cleanly and confirmed the audit finding is stable.
- Home and focused Study matched Stage 209 exactly, and Study rerendered without material visual drift.
- Graph still leads after Stage 209 because the browse canvas is still visibly bracketed:
  - the left selector strip still reads like a standing utility column, even after the narrowing pass
  - the default selected-node peek on the right still reads more like a persistent dock than a lightweight clue
- The next pass should stay tightly bounded inside Graph browse mode and reduce framing rather than widen into new shell or copy work.

## Goals
- Collapse the remaining selector-strip utility stack so the left side reads more like a compact tool edge than a standing column.
- Soften the default selected-node peek so the first-open state feels smaller and less like a persistent dock.
- Preserve graph-first browsing, grounded evidence, source handoffs, and explicit confirm/reject actions in expanded detail.

## Non-Goals
- Do not reopen Home landing work unless a direct regression is exposed during Graph implementation.
- Do not widen into backend, storage, search behavior, or source import logic.
- Do not remove grounded node evidence or explicit Reader/source handoffs from expanded Graph detail.
- Do not revisit the deferred narrower-width rail/top-grid regression unless this Graph pass directly exposes a must-fix break.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - collapse the remaining selector-strip utility stack and soften the default detail-peek framing
- `frontend/src/index.css`
  - rebalance Graph browse spacing, selector-strip structure, and peek sizing so the canvas stays more dominant
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - update Graph assertions to cover the calmer strip and softer peek state
- `frontend/src/App.test.tsx`
  - keep broad shell continuity coverage aligned if the Graph browse structure shifts materially
- `scripts/playwright/stage211_graph_selector_strip_utility_collapse_edge.mjs`
  - capture fresh Stage 211 Home, Graph, Study, and focused-Study artifacts in Windows Edge
- `scripts/playwright/stage212_post_stage211_benchmark_audit_edge.mjs`
  - stage the next audit harness so the follow-up benchmark pass can run immediately

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage211_graph_selector_strip_utility_collapse_edge.mjs`
- `node --check scripts/playwright/stage212_post_stage211_benchmark_audit_edge.mjs`

## Exit Criteria
- Graph browse mode shows a calmer left utility edge and a softer default selected-node peek in fresh artifacts.
- The canvas reads more dominant without losing grounded evidence, source handoffs, or decision actions in expanded detail.
- Home, Study, and focused Study remain visually stable.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
