# ExecPlan: Stage 155 Recall Home Opening Column Collapse And Support Row Inline Merge

## Summary
- Implement the bounded Home follow-up selected by the Stage 154 benchmark audit.
- Collapse the remaining split opening so the nearby support row no longer reads like a separate right-side panel beside the lead item.
- Keep the flatter spotlight, quieter continuation intro, and the stable Graph, Study, and focused-study baselines intact.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Graph
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Problem Statement
- Stage 154 confirmed that Stage 153 materially calmed Home, but Home still leads the mismatch list more narrowly.
- The remaining mismatch is now concentrated in the opening split:
  - the nearby support row still sits as a distinct right-side column beside the lead item
  - the opening still reads as a balanced two-panel stage instead of one calmer reopen flow
- The next pass should collapse that remaining opening split without undoing the flatter spotlight, quieter continuation intro, or the stronger lower continuation.

## Goals
- Merge the remaining opening pair into one calmer flow so the nearby support row reads more inline with the lead item.
- Reduce the panel-like feel of the opening support row without reviving the old archive wall.
- Preserve the flatter spotlight, quieter follow-on intro, fuller continuation, calmer Graph browse surface, current Study browse layout, and reader-led focused Study behavior.

## Non-Goals
- Do not reopen Graph, Study, Add Content, or focused reader-led work during this pass.
- Do not widen into backend, storage, search behavior, or source import logic.
- Do not revive the old dense archive wall or equal-weight card grid.
- Do not reopen the deferred narrow-width rail/top-grid regression unless the Home changes directly expose a must-fix break.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - collapse the remaining split opening and inline the nearby support row more tightly with the lead item
- `frontend/src/index.css`
  - reduce the right-column/panel feel of the opening support row while preserving the calmer landing rhythm
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - update Home assertions to cover the flatter opening merge and calmer nearby support presentation
- `frontend/src/App.test.tsx`
  - keep broad shell continuity coverage aligned if the Home landing structure shifts materially
- `scripts/playwright/stage155_home_opening_column_collapse_edge.mjs`
  - capture fresh Stage 155 Home, Graph, Study, and focused-Study artifacts in Windows Edge
- `scripts/playwright/stage156_post_stage155_benchmark_audit_edge.mjs`
  - stage the next audit harness so the follow-up benchmark pass can run immediately

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage155_home_opening_column_collapse_edge.mjs`
- `node --check scripts/playwright/stage156_post_stage155_benchmark_audit_edge.mjs`

## Exit Criteria
- Home no longer opens as a split lead-plus-support column in fresh artifacts.
- The opening reads more like one calmer reopen flow without reviving the archive-wall feel.
- Graph, Study, and focused Study remain visually stable.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.

## Outcome
- Stage 155 collapsed the remaining Home lead-plus-support split into one calmer stacked opening flow and softened the nearby support row so it reads more like the next reopen step than a side panel.
- The Stage 155 Home artifact changed while Graph, Study, and focused Study stayed byte-stable in the fresh Edge captures.
- The next step is now a benchmark audit, not another immediate implementation pass, because the remaining top-level blocker may now have narrowed further within Home or shifted to another surface.
