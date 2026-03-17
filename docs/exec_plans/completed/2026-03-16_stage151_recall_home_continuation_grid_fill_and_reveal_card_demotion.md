# ExecPlan: Stage 151 Recall Home Continuation Grid Fill And Reveal Card Demotion

## Summary
- Implement the bounded Home follow-up selected by the Stage 150 benchmark audit.
- Extend the lower continuation so it fills more of the landing and demote the boxed reveal card into a lighter in-flow endpoint.
- Keep the calmer Graph browse surface and the stable Study/focused-study baselines intact.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Graph
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Problem Statement
- Stage 150 confirmed that Stage 149 materially calmed Home, but Home still leads the mismatch list.
- The remaining mismatch is now concentrated in the lower half of the landing:
  - the continuation still ends too quickly for the available canvas
  - the `Show all ...` reveal still reads like a separate boxed card rather than a lighter in-flow continuation control
- The next pass should strengthen lower-canvas fill and soften the reveal endpoint without reviving the old archive wall or reopening calmer surfaces.

## Goals
- Carry the Home continuation farther down the page with a more deliberate lower-grid rhythm.
- Demote the reveal control so it reads as an in-flow continuation affordance instead of a separate boxed endpoint.
- Preserve the calmer Home opening, Graph browse surface, current Study browse layout, and reader-led focused Study behavior.

## Non-Goals
- Do not reopen Graph, Study, Add Content, or focused reader-led work during this pass.
- Do not widen into backend, storage, search behavior, or source import logic.
- Do not revive the old dense archive wall or equal-weight card grid.
- Do not reopen the deferred narrow-width rail/top-grid regression unless the Home changes directly expose a must-fix break.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - rebalance the Home continuation flow and demote the reveal control within the lower collection rhythm
- `frontend/src/index.css`
  - improve lower-canvas fill and reduce the boxed endpoint feel of the reveal treatment
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - update Home assertions to cover the fuller continuation grid and lighter reveal endpoint
- `frontend/src/App.test.tsx`
  - keep broad shell continuity coverage aligned if the Home landing structure shifts materially
- `scripts/playwright/stage151_home_continuation_grid_fill_edge.mjs`
  - capture fresh Stage 151 Home, Graph, Study, and focused-Study artifacts in Windows Edge
- `scripts/playwright/stage152_post_stage151_benchmark_audit_edge.mjs`
  - stage the next audit harness so the follow-up benchmark pass can run immediately

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage151_home_continuation_grid_fill_edge.mjs`
- `node --check scripts/playwright/stage152_post_stage151_benchmark_audit_edge.mjs`

## Exit Criteria
- Home no longer ends with a short lower continuation and separate boxed reveal endpoint in fresh artifacts.
- The lower continuation fills the landing more deliberately without reviving the archive-wall feel.
- Graph, Study, and focused Study remain visually stable.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
