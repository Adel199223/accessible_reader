# ExecPlan: Stage 207 Recall Graph Selector Strip Header Collapse And Detail Dock Header Demotion

## Summary
- Implement the next bounded slice selected by the Stage 206 benchmark audit.
- Further reduce the remaining Graph browse-mode bracketing by collapsing the open selector-strip header chrome and demoting the default detail-dock header framing.
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
- Stage 206 confirmed that Graph still leads after the Stage 205 pass, even though the mismatch is narrower now.
- The remaining visible mismatch is concentrated in two browse-mode framing hotspots:
  - the left selector strip still reads like a standing support column because it keeps its own header/search framing above the picker list
  - the right selected-node dock still opens with a stronger title/meta header block than the benchmark direction wants in the default peek state
- The next pass should therefore stay tightly bounded inside Graph browse mode and reduce those two remaining framing cues without reopening Home, Study, or backend work.

## Goals
- Collapse the open selector-strip header so the picker utility reads more like one lightweight in-flow selector and less like a separate column.
- Demote the selected-node header/meta framing in default peek so the dock feels more like a compact clue than a standing detail card.
- Preserve graph-first browsing, grounded evidence, source handoffs, and explicit decision actions in the expanded detail state.

## Non-Goals
- Do not reopen Home landing work unless a direct regression is exposed during Graph implementation.
- Do not widen into backend, storage, search behavior, or source import logic.
- Do not remove grounded node evidence or explicit Reader/source handoffs from expanded Graph detail.
- Do not revisit the deferred narrower-width rail/top-grid regression unless this Graph pass directly exposes a must-fix break.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - collapse the open selector-strip header chrome and demote default detail-dock header framing
- `frontend/src/index.css`
  - rebalance Graph header/search/picker rhythm and default dock header weight so the canvas stays more dominant
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - update Graph assertions to cover the lighter selector-strip header and calmer peek-header state
- `frontend/src/App.test.tsx`
  - keep broad shell continuity coverage aligned if the browse-mode Graph structure shifts materially
- `scripts/playwright/stage207_graph_selector_strip_header_collapse_edge.mjs`
  - capture fresh Stage 207 Home, Graph, Study, and focused-Study artifacts in Windows Edge
- `scripts/playwright/stage208_post_stage207_benchmark_audit_edge.mjs`
  - stage the next audit harness so the follow-up benchmark pass can run immediately

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage207_graph_selector_strip_header_collapse_edge.mjs`
- `node --check scripts/playwright/stage208_post_stage207_benchmark_audit_edge.mjs`

## Exit Criteria
- Graph browse mode shows a lighter selector-strip header and a calmer default detail-dock header in fresh artifacts.
- The canvas reads more dominant without losing grounded evidence, source handoffs, or decision actions in expanded detail.
- Home, Study, and focused Study remain visually stable.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
