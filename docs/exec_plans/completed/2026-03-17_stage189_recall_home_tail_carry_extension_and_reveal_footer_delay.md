# ExecPlan: Stage 189 Recall Home Tail Carry Extension And Reveal Footer Delay

## Summary
- Implement the bounded Home follow-up selected by the Stage 188 benchmark audit.
- Carry the visible Home continuation farther through the landing tail before the reveal footer row so the page ends later again.
- Delay the reveal footer without reviving the old archive wall or destabilizing the calmer Graph and Study surfaces.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Graph
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Problem Statement
- Stage 188 confirmed that Stage 187 materially calmed Home again by carrying slightly more visible Home continuation through the landing tail and by pushing the reveal footer lower.
- The remaining mismatch is still concentrated in the landing endpoint:
  - the visible continuation tail still ends too soon
  - the reveal footer still lands above too much empty lower canvas
- The next pass should carry the Home landing farther through the continuation tail and delay the reveal footer while preserving the calmer shell, the restrained opening, and the current Graph, Study, and focused-study baselines.

## Goals
- Carry the visible Home continuation farther through the tail of the landing before the reveal footer row.
- Reduce the remaining empty lower-canvas stop so the landing feels more complete before the reveal.
- Preserve the calmer Stage 187 shell and keep Graph, Study, and focused Study stable.

## Non-Goals
- Do not reopen Graph, Study, Add Content, or focused reader-led work during this pass.
- Do not widen into backend, storage, search behavior, or source import logic.
- Do not revive the old dense archive wall, boxed spotlight band, or over-framed support columns.
- Do not reopen the deferred narrow-width rail/top-grid regression unless the Home changes directly expose a must-fix break.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - carry the merged Home continuation tail farther and delay the reveal footer without undoing the calmer Stage 187 landing rhythm
- `frontend/src/index.css`
  - rebalance Home follow-on spacing only as needed so the fuller tail carry still reads calm
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - update Home assertions to cover the later reveal footer and fuller visible continuation tail
- `frontend/src/App.test.tsx`
  - keep broad shell continuity coverage aligned if the Home landing structure shifts materially
- `scripts/playwright/stage189_home_tail_carry_extension_edge.mjs`
  - capture fresh Stage 189 Home, Graph, Study, and focused-Study artifacts in Windows Edge
- `scripts/playwright/stage190_post_stage189_benchmark_audit_edge.mjs`
  - stage the next audit harness so the follow-up benchmark pass can run immediately

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage189_home_tail_carry_extension_edge.mjs`
- `node --check scripts/playwright/stage190_post_stage189_benchmark_audit_edge.mjs`

## Exit Criteria
- Home shows fuller visible continuation before the reveal footer row in fresh artifacts.
- The reveal footer lands lower and the lower canvas feels more complete without regressing into the old archive-wall feel.
- Graph, Study, and focused Study remain visually stable.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.

## Outcome
- Stage 189 carried the visible Home continuation farther through the landing tail so one more reopen item stays on the page before the reveal footer row.
- The reveal footer now lands lower in the fresh Home artifact, while Graph, Study, and focused Study matched the Stage 188 artifacts byte-for-byte.
- The next step is now a benchmark audit so the fuller Home tail and lower reveal footer can be judged against the Recall benchmark before another bounded follow-up or a surface shift is chosen.
