# ExecPlan: Stage 161 Recall Home Lead Row Demotion And Visible Continuation Extension

## Summary
- Implement the bounded Home follow-up selected by the Stage 160 benchmark audit.
- Demote the remaining singled-out lead row so the opening reads more like one continuous reopen flow.
- Extend the visible continuation slightly so the landing fills more of the lower canvas before expansion.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Graph
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Problem Statement
- Stage 160 confirmed that Stage 159 materially calmed Home, but Home still leads the mismatch list more narrowly.
- The remaining mismatch is now concentrated in the opening emphasis and the lower carry:
  - the first reopen point still reads like a singled-out lead row above the collection instead of part of the same reopen rhythm
  - the visible continuation still ends too soon, leaving too much empty lower canvas before expansion
- The next pass should demote that remaining lead-row separation and extend the visible continuation without reviving the old archive wall or disturbing the calmer Graph, Study, and focused-study baselines.

## Goals
- Reduce the remaining singled-out lead-row feel so the Home opening reads more like one even reopen flow.
- Increase the visible continuation just enough to fill more of the landing before expansion.
- Preserve the calmer shell, current Graph browse surface, current Study browse layout, and reader-led focused Study behavior.

## Non-Goals
- Do not reopen Graph, Study, Add Content, or focused reader-led work during this pass.
- Do not widen into backend, storage, search behavior, or source import logic.
- Do not revive the old dense archive wall, boxed reveal card, or equal-weight card grid.
- Do not reopen the deferred narrow-width rail/top-grid regression unless the Home changes directly expose a must-fix break.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - demote the remaining lead-row emphasis and extend the visible continuation without reintroducing the old staged opening
- `frontend/src/index.css`
  - reduce the top-row singled-out feel and support the longer visible continuation rhythm while preserving the calmer landing treatment
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - update Home assertions to cover the calmer lead-row treatment and the longer visible continuation
- `frontend/src/App.test.tsx`
  - keep broad shell continuity coverage aligned if the Home landing structure shifts materially
- `scripts/playwright/stage161_home_lead_row_demotion_edge.mjs`
  - capture fresh Stage 161 Home, Graph, Study, and focused-Study artifacts in Windows Edge
- `scripts/playwright/stage162_post_stage161_benchmark_audit_edge.mjs`
  - stage the next audit harness so the follow-up benchmark pass can run immediately

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage161_home_lead_row_demotion_edge.mjs`
- `node --check scripts/playwright/stage162_post_stage161_benchmark_audit_edge.mjs`

## Exit Criteria
- Home no longer opens with a singled-out lead row in fresh artifacts.
- The visible continuation fills more of the landing before expansion without reviving the archive wall.
- Graph, Study, and focused Study remain visually stable.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.

## Outcome
- Stage 161 demoted the remaining singled-out Home lead row by pulling it into the same continuation grid as the rest of the reopen flow instead of leaving it in a separate spotlight block.
- The merged no-resume landing now starts immediately with one lighter `Start here` continuation row, and the shared grid carries farther down the page before the inline reveal control.
- The Stage 161 Home artifact changed while Graph, Study, and focused Study stayed byte-stable in the fresh Edge captures.
- The next step is now a benchmark audit, not another immediate implementation pass, because the remaining top-level blocker may now have narrowed further within Home or shifted to another surface.
