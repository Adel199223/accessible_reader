# ExecPlan: Stage 149 Recall Home Opening Cluster Compaction And Lower Canvas Fill

## Summary
- Implement the bounded Home follow-up selected by the Stage 148 benchmark audit.
- Compact the remaining staged opening cluster on Home and carry the collection lower in the canvas more deliberately.
- Keep the calmer Graph browse surface and the stable Study/focused-study baselines intact.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Graph
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Problem Statement
- Stage 148 confirmed that Graph is materially closer after the Stage 147 selector-rail/detail-dock pass and no longer leads the mismatch list.
- Home now leads because the landing still feels too staged and too sparse:
  - the split `Start here` plus nearby stack still reads like one framed opening cluster instead of a lighter selective collection surface
  - the lower continuation does not carry enough of the page, so the landing still ends in too much empty canvas
- The next pass should improve Home pacing and lower-canvas continuity without reviving the old dense archive wall or reopening calmer surfaces.

## Goals
- Flatten or compact the remaining lead-plus-nearby opening so Home starts closer to one selective collection zone.
- Strengthen the lower continuation so the landing carries downward with more deliberate collection rhythm.
- Preserve the calmer Graph browse surface, the current Study browse layout, and reader-led focused Study behavior.

## Non-Goals
- Do not reopen Graph, Study, Add Content, or focused reader-led work during this pass.
- Do not widen into backend, storage, search behavior, or source import logic.
- Do not revive the old dense archive wall or equal-weight card grid.
- Do not reopen the deferred narrow-width rail/top-grid regression unless the Home changes directly expose a must-fix break.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - compact the staged Home opening cluster and rebalance the lower continuation flow
- `frontend/src/index.css`
  - reduce top-heavy framing and improve lower-canvas fill and continuation pacing
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - update Home assertions to cover the calmer opening cluster and stronger lower continuation
- `frontend/src/App.test.tsx`
  - keep broad shell continuity coverage aligned if the Home landing structure shifts materially
- `scripts/playwright/stage149_home_opening_cluster_compaction_edge.mjs`
  - capture fresh Stage 149 Home, Graph, Study, and focused-Study artifacts in Windows Edge
- `scripts/playwright/stage150_post_stage149_benchmark_audit_edge.mjs`
  - stage the next audit harness so the follow-up benchmark pass can run immediately

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage149_home_opening_cluster_compaction_edge.mjs`
- `node --check scripts/playwright/stage150_post_stage149_benchmark_audit_edge.mjs`

## Exit Criteria
- Home no longer reads as one staged split opening cluster in fresh artifacts.
- The lower continuation fills the landing more deliberately without reviving the archive-wall feel.
- Graph, Study, and focused Study remain visually stable.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
