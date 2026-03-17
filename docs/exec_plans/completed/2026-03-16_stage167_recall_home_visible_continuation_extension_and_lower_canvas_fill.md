# ExecPlan: Stage 167 Recall Home Visible Continuation Extension And Lower Canvas Fill

## Summary
- Implement the bounded Home follow-up selected by the Stage 166 benchmark audit.
- Extend the visible reopen continuation so the landing carries farther before the reveal row.
- Fill more of the lower Home canvas without reviving the old archive wall or destabilizing the calmer Graph and Study surfaces.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Graph
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Problem Statement
- Stage 166 confirmed that Stage 165 materially calmed Home by removing the extra first-row cue and by merging the reveal footer utility into one calmer continuation line.
- The remaining mismatch is now concentrated in the Home landing's carry:
  - the visible collection still ends too soon after the first few reopen rows
  - the page still drops into too much empty lower canvas instead of reading like one fuller selective collection surface
- The next pass should extend the visible continuation and fill more of the lower canvas while preserving the calmer shell, the restrained Home opening, and the current Graph, Study, and focused-study baselines.

## Goals
- Carry the visible Home continuation farther down the page before the reveal row.
- Reduce the empty lower-canvas stop so the landing feels more like one active collection surface.
- Preserve the calmer opening rhythm and keep Graph, Study, and focused Study stable.

## Non-Goals
- Do not reopen Graph, Study, Add Content, or focused reader-led work during this pass.
- Do not widen into backend, storage, search behavior, or source import logic.
- Do not revive the old dense archive wall, boxed spotlight band, or over-framed support columns.
- Do not reopen the deferred narrow-width rail/top-grid regression unless the Home changes directly expose a must-fix break.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - extend the visible Home continuation and lower-canvas carry without undoing the calmer Stage 165 opening treatment
- `frontend/src/index.css`
  - rebalance Home row spacing and continuation rhythm so the lower landing fills more intentionally
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - update Home assertions to cover the fuller visible continuation and calmer lower-canvas carry
- `frontend/src/App.test.tsx`
  - keep broad shell continuity coverage aligned if the Home landing structure shifts materially
- `scripts/playwright/stage167_home_visible_continuation_extension_edge.mjs`
  - capture fresh Stage 167 Home, Graph, Study, and focused-Study artifacts in Windows Edge
- `scripts/playwright/stage168_post_stage167_benchmark_audit_edge.mjs`
  - stage the next audit harness so the follow-up benchmark pass can run immediately

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage167_home_visible_continuation_extension_edge.mjs`
- `node --check scripts/playwright/stage168_post_stage167_benchmark_audit_edge.mjs`

## Exit Criteria
- Home shows a fuller visible continuation before the reveal row in fresh artifacts.
- The landing fills more of the lower canvas without regressing into the old archive-wall feel.
- Graph, Study, and focused Study remain visually stable.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.

## Outcome
- Stage 167 extended the compact merged Home continuation so the landing carries farther before the reveal row and fills more of the lower canvas without reviving the old archive wall.
- The fresh Stage 167 Home artifact changed, while Graph, Study, and focused Study matched the Stage 166 artifacts byte-for-byte.
- The next step is now a benchmark audit so the fuller Home carry can be judged against the Recall benchmark before another Home follow-up or a surface shift is chosen.
