# ExecPlan: Stage 145 Recall Home Lead Card Deflation And Lower Canvas Continuation Fill

## Summary
- Implement the bounded Home follow-up selected by the Stage 144 benchmark audit.
- Reduce the oversized lead-card footprint on the Home landing and make the lower continuation carry more of the page.
- Keep the calmer shared shell and the newly improved Graph baseline intact.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Graph
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Add Content tutorial](https://docs.getrecall.ai/docs/tutorials/add-content)
  - [Knowledge Graph overview](https://docs.getrecall.ai/docs/features/knowledge-graph/overview)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Problem Statement
- Stage 144 confirmed that Home, not Graph, is now the clearest remaining mismatch.
- The landing is calmer than the earlier archive wall, but it still feels too top-heavy:
  - the first lead band still spans too broadly and reads as one dominant boxed feature
  - the lower continuation is too sparse, so the page ends in empty canvas instead of a deliberate continuation flow
- The next pass should improve landing pacing and vertical fill without reopening the previous heavy archive treatment.

## Goals
- Shorten or soften the broad top lead-card footprint so the Home landing feels less dominated by one boxed feature.
- Give the lower continuation stronger structure so the page carries downward with a deliberate collection rhythm.
- Preserve the calmer shell, the current Graph/Study/focused-study baselines, and the grouped reveal behavior.

## Non-Goals
- Do not reopen Graph, Study, Add Content, or focused reader-led work during this pass.
- Do not widen into backend, storage, search behavior, or source import logic.
- Do not revive the old dense archive wall or equal-weight grid of cards.
- Do not reopen the deferred narrow-width rail/top-grid regression unless the Home changes directly expose a must-fix break.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - rebalance the Home lead band and lower continuation structure
- `frontend/src/index.css`
  - reduce the top feature footprint and improve lower-canvas fill and pacing
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - update Home assertions to cover the rebalanced landing rhythm
- `frontend/src/App.test.tsx`
  - keep broad shell continuity coverage aligned if the Home landing structure shifts materially
- `scripts/playwright/stage145_home_lead_card_deflation_edge.mjs`
  - capture fresh Stage 145 Home, Graph, Study, and focused-Study artifacts in Windows Edge
- `scripts/playwright/stage146_post_stage145_benchmark_audit_edge.mjs`
  - stage the next audit harness so the follow-up benchmark pass can run immediately

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage145_home_lead_card_deflation_edge.mjs`
- `node --check scripts/playwright/stage146_post_stage145_benchmark_audit_edge.mjs`

## Exit Criteria
- Home no longer feels dominated by one oversized top feature band in fresh artifacts.
- The lower continuation fills the landing more deliberately without reviving the old archive-wall feel.
- Graph, Study, and focused Study remain visually stable.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
