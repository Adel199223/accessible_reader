# ExecPlan: Stage 159 Recall Home Opening Pair Equalization And Continuation Density Lift

## Summary
- Implement the bounded Home follow-up selected by the Stage 158 benchmark audit.
- Equalize the remaining opening pair so the nearby support item no longer reads like a staged counterpart to the lead row.
- Raise the visible continuation density slightly so the landing fills more of the lower canvas before expansion.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Graph
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Problem Statement
- Stage 158 confirmed that Stage 157 materially calmed Home, but Home still leads the mismatch list more narrowly.
- The remaining mismatch is now concentrated in the opening pair and the visible lower density:
  - the lead row and nearby support item still read as a composed opening duo above the continuation grid instead of one more even collection rhythm
  - the lower continuation still stays too sparse because only one visible continuation row plus the reveal row carry the landing before the empty lower canvas begins
- The next pass should equalize that remaining opening-pair staging and lift the visible continuation density without reviving the old archive wall or disturbing the calmer Graph, Study, and focused-study baselines.

## Goals
- Reduce the remaining lead-plus-nearby pair staging so the first visible rows read more like one calmer collection flow.
- Increase the visible continuation density just enough to fill more of the landing before expansion.
- Preserve the flatter lead row, inline reveal row, calmer Graph browse surface, current Study browse layout, and reader-led focused Study behavior.

## Non-Goals
- Do not reopen Graph, Study, Add Content, or focused reader-led work during this pass.
- Do not widen into backend, storage, search behavior, or source import logic.
- Do not revive the old dense archive wall, equal-weight card grid, or heavy footer reveal control.
- Do not reopen the deferred narrow-width rail/top-grid regression unless the Home changes directly expose a must-fix break.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - equalize the remaining opening pair and increase the visible continuation carry without reopening the old staged landing
- `frontend/src/index.css`
  - reduce the opening-duo feel and support the denser lower continuation rhythm while preserving the calmer landing treatment
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - update Home assertions to cover the equalized opening pair and the fuller visible continuation
- `frontend/src/App.test.tsx`
  - keep broad shell continuity coverage aligned if the Home landing structure shifts materially
- `scripts/playwright/stage159_home_opening_pair_equalization_edge.mjs`
  - capture fresh Stage 159 Home, Graph, Study, and focused-Study artifacts in Windows Edge
- `scripts/playwright/stage160_post_stage159_benchmark_audit_edge.mjs`
  - stage the next audit harness so the follow-up benchmark pass can run immediately

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage159_home_opening_pair_equalization_edge.mjs`
- `node --check scripts/playwright/stage160_post_stage159_benchmark_audit_edge.mjs`

## Exit Criteria
- Home no longer opens as a deliberate lead-plus-nearby pair in fresh artifacts.
- The visible continuation fills more of the landing before expansion without reviving the archive wall.
- Graph, Study, and focused Study remain visually stable.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.

## Outcome
- Stage 159 equalized the remaining Home opening by limiting the merged no-resume featured band to one lead item, so the landing no longer opens as a deliberate lead-plus-nearby pair.
- The former nearby support item now lands inside the follow-on list, which lifts the visible continuation density before the inline `Show all ...` reveal row.
- The Stage 159 Home artifact changed while Graph, Study, and focused Study stayed byte-stable in the fresh Edge captures.
- The next step is now a benchmark audit, not another immediate implementation pass, because the remaining top-level blocker may now have narrowed further within Home or shifted to another surface.
