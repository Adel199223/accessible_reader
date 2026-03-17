# ExecPlan: Stage 203 Recall Graph Canvas Bracketing Reduction And Detail Dock Softening

## Summary
- Implement the next bounded slice selected by the Stage 202 benchmark audit.
- Reduce the remaining graph browse-mode support framing so the canvas reads more primary relative to the left selector rail and right detail dock.
- Keep the calmer Home landing, Study browse, and focused-study surfaces stable while the Graph surface converges further toward the Recall benchmark direction.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Graph
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Knowledge Graph overview](https://docs.getrecall.ai/docs/features/knowledge-graph/overview)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Problem Statement
- Stage 202 confirmed that the bundled Stage 201 Home landing-endpoint convergence pass was enough to stop Home from leading the mismatch list.
- The remaining clearest mismatch is now Graph browse mode:
  - the left selector rail still reads like a standing support column beside the canvas
  - the right detail dock still opens with more framing than the Recall benchmark direction wants
- The next pass should therefore stay tightly bounded inside Graph browse mode and reduce that canvas bracketing without reopening Home, Study, or backend work.

## Goals
- Slim the left Graph selector rail so search, counts, and quick picks read more like light utility than a dedicated side column.
- Soften and compact the right Graph detail dock so selected-node context stays grounded without overpowering the canvas.
- Preserve graph-first browsing, grounded source handoffs, confirm/reject actions, and the calmer Stage 201 Home landing.

## Non-Goals
- Do not reopen Home landing work unless a direct regression is exposed during Graph implementation.
- Do not widen into backend, storage, search behavior, or source import logic.
- Do not remove grounded node evidence or the explicit source handoff from Graph detail.
- Do not revisit the deferred narrower-width rail/top-grid regression unless the Graph work directly exposes a must-fix break.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - reduce left-rail framing and compact the selected-node detail dock while keeping graph actions and source handoffs intact
- `frontend/src/index.css`
  - rebalance Graph browse spacing, rail weight, and dock framing so the canvas feels more primary
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - update Graph assertions to cover the lighter selector rail and the calmer detail dock
- `frontend/src/App.test.tsx`
  - keep broad shell continuity coverage aligned if Graph browse structure shifts materially
- `scripts/playwright/stage203_graph_canvas_bracketing_reduction_edge.mjs`
  - capture fresh Stage 203 Home, Graph, Study, and focused-Study artifacts in Windows Edge
- `scripts/playwright/stage204_post_stage203_benchmark_audit_edge.mjs`
  - stage the next audit harness so the follow-up benchmark pass can run immediately

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage203_graph_canvas_bracketing_reduction_edge.mjs`
- `node --check scripts/playwright/stage204_post_stage203_benchmark_audit_edge.mjs`

## Exit Criteria
- Graph browse mode shows a lighter selector rail and a calmer right detail dock in fresh artifacts.
- The canvas reads more dominant without losing grounded evidence, source handoffs, or decision actions.
- Home, Study, and focused Study remain visually stable.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.

## Outcome
- Stage 203 is complete.
- Graph browse mode now uses a slimmer selector rail and a softer selected-node detail dock so the canvas reads more primary.
- The rail now opens with fewer default quick picks and less extra section framing, while the peek dock defers confirm/reject actions until the expanded detail state.
- Validation is green:
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
  - `node --check scripts/playwright/stage203_graph_canvas_bracketing_reduction_edge.mjs`
  - `node --check scripts/playwright/stage204_post_stage203_benchmark_audit_edge.mjs`
  - `node scripts/playwright/stage203_graph_canvas_bracketing_reduction_edge.mjs`
- Fresh Stage 203 artifacts were captured for Home, Graph, Study, and focused Study.
- Home and focused Study matched the Stage 202 captures byte-for-byte, and Study rerendered without material visual drift on visual review.
