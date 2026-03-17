# ExecPlan: Stage 165 Recall Home Lead Row Meta Equalization And Reveal Footer Utility Merge

## Summary
- Implement the bounded Home follow-up selected by the Stage 164 benchmark audit.
- Equalize the remaining lead-row meta so the first visible cell reads less singled out beside adjacent rows.
- Merge the reveal footer utility into one calmer continuation line so the lower edge no longer splits attention across the page.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Graph
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Problem Statement
- Stage 164 confirmed that Stage 163 materially calmed Home, but Home still leads the mismatch list more narrowly.
- The remaining mismatch is now concentrated in two residual framing cues:
  - the first visible cell still reads like a singled-out reopen point because its inline meta includes an extra `Start here` cue while adjacent rows do not
  - the footer reveal still splits attention with a left command and a distant right utility count instead of reading like one calmer continuation line
- The next pass should equalize that remaining lead-row meta treatment and merge the reveal footer utility without reviving the old archive wall or disturbing the calmer Graph, Study, and focused-study baselines.

## Goals
- Reduce the remaining first-row singled-out feel so the opening reads more like one even reopen flow.
- Make the reveal footer read like one calmer continuation line while keeping the expansion affordance explicit.
- Preserve the calmer shell, current Graph browse surface, current Study browse layout, and reader-led focused Study behavior.

## Non-Goals
- Do not reopen Graph, Study, Add Content, or focused reader-led work during this pass.
- Do not widen into backend, storage, search behavior, or source import logic.
- Do not revive the old dense archive wall, boxed spotlight band, or separate endpoint tile treatment.
- Do not reopen the deferred narrow-width rail/top-grid regression unless the Home changes directly expose a must-fix break.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - equalize the lead-row meta treatment and consolidate the reveal footer utility without reopening the older staged Home landing
- `frontend/src/index.css`
  - reduce the remaining first-row uniqueness and merge the footer utility into one calmer continuation line while preserving the shared-grid rhythm
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - update Home assertions to cover the equalized lead-row meta and the merged reveal footer utility
- `frontend/src/App.test.tsx`
  - keep broad shell continuity coverage aligned if the Home landing structure shifts materially
- `scripts/playwright/stage165_home_lead_row_meta_equalization_edge.mjs`
  - capture fresh Stage 165 Home, Graph, Study, and focused-Study artifacts in Windows Edge
- `scripts/playwright/stage166_post_stage165_benchmark_audit_edge.mjs`
  - stage the next audit harness so the follow-up benchmark pass can run immediately

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage165_home_lead_row_meta_equalization_edge.mjs`
- `node --check scripts/playwright/stage166_post_stage165_benchmark_audit_edge.mjs`

## Exit Criteria
- Home no longer opens with a noticeably singled-out first-row meta treatment in fresh artifacts.
- The reveal footer reads like one calmer continuation line without losing the expansion affordance.
- Graph, Study, and focused Study remain visually stable.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.

## Outcome
- Stage 165 equalized the remaining first-row meta treatment by removing the extra lead cue from the first visible Home cell so it now reads more like part of the same reopen flow as adjacent rows.
- The Home reveal control now reads as one calmer continuation line with the hidden-count utility merged into the main footer copy instead of splitting attention across the lower edge.
- The Stage 165 Home artifact changed while Graph, Study, and focused Study stayed byte-stable in the fresh Edge captures.
- The next step is now a benchmark audit so the refreshed Home landing can be judged against the Recall benchmark before another surface or another Home follow-up is chosen.
