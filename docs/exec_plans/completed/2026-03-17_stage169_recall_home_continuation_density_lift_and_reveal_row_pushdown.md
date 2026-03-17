# ExecPlan: Stage 169 Recall Home Continuation Density Lift And Reveal Row Pushdown

## Summary
- Implement the bounded Home follow-up selected by the Stage 168 benchmark audit.
- Carry a bit more visible continuation before the reveal row so the landing ends later.
- Push the reveal row lower without reviving the old archive wall or destabilizing the calmer Graph and Study surfaces.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Graph
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Problem Statement
- Stage 168 confirmed that Stage 167 materially calmed Home by extending the visible continuation and filling more of the lower canvas.
- The remaining mismatch is now concentrated in the landing endpoint:
  - the reveal row still arrives too early
  - the page still leaves too much empty lower canvas after the visible continuation
- The next pass should lift the visible continuation density just enough to push the reveal row lower while preserving the calmer shell, the restrained Home opening, and the current Graph, Study, and focused-study baselines.

## Goals
- Push the Home reveal row lower by showing slightly more visible continuation before expansion.
- Reduce the remaining empty lower-canvas stop so the landing feels more complete before the reveal.
- Preserve the calmer Stage 167 opening and keep Graph, Study, and focused Study stable.

## Non-Goals
- Do not reopen Graph, Study, Add Content, or focused reader-led work during this pass.
- Do not widen into backend, storage, search behavior, or source import logic.
- Do not revive the old dense archive wall, boxed spotlight band, or over-framed support columns.
- Do not reopen the deferred narrow-width rail/top-grid regression unless the Home changes directly expose a must-fix break.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - lift the visible Home continuation density and push the reveal row lower without undoing the calmer Stage 167 landing rhythm
- `frontend/src/index.css`
  - rebalance Home follow-on spacing only as needed so the denser continuation still reads calm
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - update Home assertions to cover the fuller visible continuation and later reveal row
- `frontend/src/App.test.tsx`
  - keep broad shell continuity coverage aligned if the Home landing structure shifts materially
- `scripts/playwright/stage169_home_continuation_density_lift_edge.mjs`
  - capture fresh Stage 169 Home, Graph, Study, and focused-Study artifacts in Windows Edge
- `scripts/playwright/stage170_post_stage169_benchmark_audit_edge.mjs`
  - stage the next audit harness so the follow-up benchmark pass can run immediately

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage169_home_continuation_density_lift_edge.mjs`
- `node --check scripts/playwright/stage170_post_stage169_benchmark_audit_edge.mjs`

## Exit Criteria
- Home shows slightly more visible continuation before the reveal row in fresh artifacts.
- The reveal row lands lower and the lower canvas feels more complete without regressing into the old archive-wall feel.
- Graph, Study, and focused Study remain visually stable.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.

## Outcome
- Stage 169 lifted the merged Home continuation density so the landing shows slightly more visible reopen rows before the reveal row.
- The reveal row now lands lower in the fresh Home artifact, while Graph, Study, and focused Study matched the Stage 168 artifacts byte-for-byte.
- The next step is now a benchmark audit so the later reveal row and fuller landing carry can be judged against the Recall benchmark before another bounded follow-up is selected.
