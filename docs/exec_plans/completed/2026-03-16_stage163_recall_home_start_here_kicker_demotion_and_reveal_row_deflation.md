# ExecPlan: Stage 163 Recall Home Start Here Kicker Demotion And Reveal Row Deflation

## Summary
- Implement the bounded Home follow-up selected by the Stage 162 benchmark audit.
- Demote the remaining `Start here` kicker so the first visible cell reads less like a special stage.
- Reduce the reveal row's separate-endpoint feel so the grid ends more like one quieter collection flow.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Graph
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Problem Statement
- Stage 162 confirmed that Stage 161 materially calmed Home, but Home still leads the mismatch list more narrowly.
- The remaining mismatch is now concentrated in the two framing cues that still bracket the grid:
  - the `Start here` kicker still singles out the first visible cell more than the benchmark direction wants
  - the `Show all ...` reveal row still reads like a separate endpoint tile instead of a quieter continuation affordance
- The next pass should soften those remaining emphasis cues without reviving the old archive wall or disturbing the calmer Graph, Study, and focused-study baselines.

## Goals
- Reduce the remaining `Start here` emphasis so the first cell reads more like part of one even reopen flow.
- Make the reveal row end the landing more quietly without losing the explicit expansion affordance.
- Preserve the calmer shell, shared-grid Home opening, current Graph browse surface, current Study browse layout, and reader-led focused Study behavior.

## Non-Goals
- Do not reopen Graph, Study, Add Content, or focused reader-led work during this pass.
- Do not widen into backend, storage, search behavior, or source import logic.
- Do not revive the old dense archive wall, boxed spotlight band, or equal-weight card grid.
- Do not reopen the deferred narrow-width rail/top-grid regression unless the Home changes directly expose a must-fix break.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - soften the remaining `Start here` cue and reveal-row emphasis without reopening the older staged Home landing
- `frontend/src/index.css`
  - reduce the first-cell kicker weight and flatten the reveal-row treatment while preserving the calmer shared-grid rhythm
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - update Home assertions to cover the quieter lead cue and the more blended reveal row
- `frontend/src/App.test.tsx`
  - keep broad shell continuity coverage aligned if the Home landing structure shifts materially
- `scripts/playwright/stage163_home_start_here_kicker_demotion_edge.mjs`
  - capture fresh Stage 163 Home, Graph, Study, and focused-Study artifacts in Windows Edge
- `scripts/playwright/stage164_post_stage163_benchmark_audit_edge.mjs`
  - stage the next audit harness so the follow-up benchmark pass can run immediately

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage163_home_start_here_kicker_demotion_edge.mjs`
- `node --check scripts/playwright/stage164_post_stage163_benchmark_audit_edge.mjs`

## Exit Criteria
- Home no longer opens with a noticeably singled-out `Start here` cue in fresh artifacts.
- The reveal row ends the landing more quietly without losing the explicit expansion affordance.
- Graph, Study, and focused Study remain visually stable.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.

## Outcome
- Stage 163 demoted the remaining `Start here` emphasis by moving it out of the lead-cell kicker slot and into quieter inline meta, both for the merged lead row and the featured spotlight variant.
- The Home reveal control now spans the continuation footer as a flatter full-width row instead of reading like a separate endpoint tile.
- The Stage 163 Home artifact changed while Graph, Study, and focused Study stayed byte-stable in the fresh Edge captures.
- The next step is now a benchmark audit so the refreshed Home landing can be judged against the Recall benchmark before another surface or another Home follow-up is chosen.
