# ExecPlan: Stage 171 Recall Home Continuation Carry Extension And Reveal Row Delay

## Summary
- Implement the bounded Home follow-up selected by the Stage 170 benchmark audit.
- Carry the visible Home continuation a bit farther before the reveal row so the landing ends later.
- Delay the reveal row without reviving the old archive wall or destabilizing the calmer Graph and Study surfaces.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Graph
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Problem Statement
- Stage 170 confirmed that Stage 169 materially calmed Home again by lifting the visible continuation density and by pushing the reveal row lower.
- The remaining mismatch is now concentrated in the landing carry:
  - the visible continuation still ends too soon
  - the reveal row still lands above too much empty lower canvas
- The next pass should carry the visible continuation farther and delay the reveal row while preserving the calmer shell, the restrained Home opening, and the current Graph, Study, and focused-study baselines.

## Goals
- Carry the visible Home continuation farther down the page before the reveal row.
- Reduce the remaining empty lower-canvas stop so the landing feels more complete before the reveal.
- Preserve the calmer Stage 169 shell and keep Graph, Study, and focused Study stable.

## Non-Goals
- Do not reopen Graph, Study, Add Content, or focused reader-led work during this pass.
- Do not widen into backend, storage, search behavior, or source import logic.
- Do not revive the old dense archive wall, boxed spotlight band, or over-framed support columns.
- Do not reopen the deferred narrow-width rail/top-grid regression unless the Home changes directly expose a must-fix break.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - carry the merged Home continuation farther and delay the reveal row without undoing the calmer Stage 169 landing rhythm
- `frontend/src/index.css`
  - rebalance Home follow-on spacing only as needed so the fuller continuation still reads calm
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - update Home assertions to cover the later reveal row and fuller visible continuation
- `frontend/src/App.test.tsx`
  - keep broad shell continuity coverage aligned if the Home landing structure shifts materially
- `scripts/playwright/stage171_home_continuation_carry_extension_edge.mjs`
  - capture fresh Stage 171 Home, Graph, Study, and focused-Study artifacts in Windows Edge
- `scripts/playwright/stage172_post_stage171_benchmark_audit_edge.mjs`
  - stage the next audit harness so the follow-up benchmark pass can run immediately

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage171_home_continuation_carry_extension_edge.mjs`
- `node --check scripts/playwright/stage172_post_stage171_benchmark_audit_edge.mjs`

## Exit Criteria
- Home shows fuller visible continuation before the reveal row in fresh artifacts.
- The reveal row lands lower and the lower canvas feels more complete without regressing into the old archive-wall feel.
- Graph, Study, and focused Study remain visually stable.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.

## Outcome
- Stage 171 carried the merged Home continuation farther so one more visible reopen item appears before the reveal row.
- The reveal row now lands lower in the fresh Home artifact, while Graph, Study, and focused Study matched the Stage 170 artifacts byte-for-byte.
- The next step is now a benchmark audit so the fuller Home carry can be judged against the Recall benchmark before another bounded follow-up or a surface shift is chosen.
