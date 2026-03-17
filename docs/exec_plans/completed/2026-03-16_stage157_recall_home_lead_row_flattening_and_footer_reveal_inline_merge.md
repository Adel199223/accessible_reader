# ExecPlan: Stage 157 Recall Home Lead Row Flattening And Footer Reveal Inline Merge

## Summary
- Implement the bounded Home follow-up selected by the Stage 156 benchmark audit.
- Flatten the remaining spotlight-row feel at the top of Home so the first reopen point reads less like a staged lead item.
- Integrate the lower reveal affordance more directly into the continuation flow so the landing ends with less empty footer canvas.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Graph
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Problem Statement
- Stage 156 confirmed that Stage 155 materially calmed Home, but Home still leads the mismatch list more narrowly.
- The remaining mismatch is now concentrated in the opening and ending rhythm:
  - the first reopen point still reads as a singled-out spotlight row instead of part of a flatter reopen flow
  - the lower continuation still ends too abruptly with too much empty canvas and a separate footer reveal endpoint
- The next pass should flatten those remaining Home staging cues without reviving the old archive wall or disturbing the calmer Graph, Study, and focused-study baselines.

## Goals
- Reduce the remaining spotlight-row feel of the Home opening so the first reopen point reads more like part of one continuous collection flow.
- Pull the reveal affordance into the lower continuation rhythm so the landing ends more intentionally.
- Preserve the calmer stacked opening flow, lighter nearby support row, calmer Graph browse surface, current Study browse layout, and reader-led focused Study behavior.

## Non-Goals
- Do not reopen Graph, Study, Add Content, or focused reader-led work during this pass.
- Do not widen into backend, storage, search behavior, or source import logic.
- Do not revive the old dense archive wall, boxed footer reveal card, or equal-weight card grid.
- Do not reopen the deferred narrow-width rail/top-grid regression unless the Home changes directly expose a must-fix break.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - flatten the remaining lead-row staging and integrate the lower reveal action more directly into the continuation flow
- `frontend/src/index.css`
  - reduce the spotlight-row emphasis and footer-endpoint feel while preserving the calmer landing rhythm
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - update Home assertions to cover the flatter lead-row treatment and the more inline reveal presentation
- `frontend/src/App.test.tsx`
  - keep broad shell continuity coverage aligned if the Home landing structure shifts materially
- `scripts/playwright/stage157_home_lead_row_flattening_edge.mjs`
  - capture fresh Stage 157 Home, Graph, Study, and focused-Study artifacts in Windows Edge
- `scripts/playwright/stage158_post_stage157_benchmark_audit_edge.mjs`
  - stage the next audit harness so the follow-up benchmark pass can run immediately

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage157_home_lead_row_flattening_edge.mjs`
- `node --check scripts/playwright/stage158_post_stage157_benchmark_audit_edge.mjs`

## Exit Criteria
- Home no longer opens as a singled-out spotlight row in fresh artifacts.
- The lower continuation ends more intentionally without leaving the reveal action as a separate footer endpoint.
- Graph, Study, and focused Study remain visually stable.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.

## Outcome
- Stage 157 flattened the remaining Home lead-row styling so the first reopen point reads more like the first item in one calmer collection flow instead of a boxed spotlight card.
- The grouped `Show all ...` affordance now lives as the last continuation row inside the follow-on list instead of a separate footer endpoint, which fills the lower landing more intentionally.
- The Stage 157 Home artifact changed while Graph, Study, and focused Study stayed byte-stable in the fresh Edge captures.
- The next step is now a benchmark audit, not another immediate implementation pass, because the remaining top-level blocker may now have narrowed further within Home or shifted to another surface.
