# ExecPlan: Stage 153 Recall Home Spotlight Deflation And Follow-On Header Demotion

## Summary
- Implement the bounded Home follow-up selected by the Stage 152 benchmark audit.
- Reduce the boxed `Start here` spotlight emphasis and demote the separate `Keep going` restart framing.
- Keep the fuller continuation, lighter footer reveal, and the stable Graph, Study, and focused-study baselines intact.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Graph
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Problem Statement
- Stage 152 confirmed that Stage 151 materially calmed Home, but Home still leads the mismatch list more narrowly.
- The remaining mismatch is now concentrated in the landing framing:
  - the boxed `Start here` spotlight still reads as a staged lead card
  - the nearby support row plus `Keep going` header still restart the flow as separate bands instead of one calmer collection surface
- The next pass should flatten that remaining opening and follow-on framing without undoing the stronger lower continuation or reopening calmer surfaces.

## Goals
- Deflate the boxed `Start here` spotlight so the landing begins more like a selective collection flow than a staged hero card.
- Demote the `Keep going` restart framing so the follow-on rows read as part of the same collection rhythm.
- Preserve the fuller continuation, lighter footer reveal, calmer Graph browse surface, current Study browse layout, and reader-led focused Study behavior.

## Non-Goals
- Do not reopen Graph, Study, Add Content, or focused reader-led work during this pass.
- Do not widen into backend, storage, search behavior, or source import logic.
- Do not revive the old dense archive wall or equal-weight card grid.
- Do not reopen the deferred narrow-width rail/top-grid regression unless the Home changes directly expose a must-fix break.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - flatten the remaining Home opening and follow-on framing around the featured spotlight and continuation header
- `frontend/src/index.css`
  - reduce boxed lead-card emphasis and soften the follow-on section restart without losing the stronger lower continuation
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - update Home assertions to cover the flatter opening and calmer follow-on framing
- `frontend/src/App.test.tsx`
  - keep broad shell continuity coverage aligned if the Home landing structure shifts materially
- `scripts/playwright/stage153_home_spotlight_deflation_edge.mjs`
  - capture fresh Stage 153 Home, Graph, Study, and focused-Study artifacts in Windows Edge
- `scripts/playwright/stage154_post_stage153_benchmark_audit_edge.mjs`
  - stage the next audit harness so the follow-up benchmark pass can run immediately

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage153_home_spotlight_deflation_edge.mjs`
- `node --check scripts/playwright/stage154_post_stage153_benchmark_audit_edge.mjs`

## Exit Criteria
- Home no longer opens as a boxed spotlight plus separate follow-on restart in fresh artifacts.
- The opening and `Keep going` handoff read more like one calmer collection flow without reviving the archive-wall feel.
- Graph, Study, and focused Study remain visually stable.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.

## Outcome
- Stage 153 flattened the remaining Home lead framing by turning `Start here` into a quieter overline-led spotlight and by replacing the `Keep going` chip/header restart with a muted in-flow continuation line.
- The Stage 153 Home artifact changed while Graph, Study, and focused Study stayed byte-stable in the fresh Edge captures.
- The next step is now a benchmark audit, not another immediate implementation pass, because the remaining top-level blocker may now have narrowed further within Home or shifted to another surface.
