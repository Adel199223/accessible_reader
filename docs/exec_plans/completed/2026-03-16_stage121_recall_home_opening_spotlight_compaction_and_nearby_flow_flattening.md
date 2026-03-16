# ExecPlan: Stage 121 Recall Home Opening Spotlight Compaction And Nearby Flow Flattening

## Summary
- Implement the bounded Home follow-up selected by the Stage 120 benchmark audit.
- Reduce the remaining oversized opening spotlight and flatten the nearby reopen handoff so Home reads more like one selective reopen flow.
- Keep Study, Graph, focused Study, and the deferred narrow-width shell regression stable.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Release: 22 August 2024 // UI Improvements](https://feedback.getrecall.ai/changelog/release-22-august-2024-ui-improvements)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Problem Statement
- Stage 119 materially improved Study, and Stage 120 confirmed that Study, Graph, and focused Study stayed stable after that pass.
- Home now leads the remaining mismatch list again because its opening is close but still slightly too staged:
  - the `Start here` spotlight still occupies too much weight relative to the calmer lower continuation
  - the nearby reopen handoff still reads like a separate card band instead of part of the same selective flow
- The next bounded pass should keep the calmer Home hierarchy while making the opening feel more immediate and continuous.

## Goals
- Compact the opening `Start here` spotlight without losing its role as the first reopen target.
- Flatten the nearby reopen handoff so it feels like part of the same selective flow.
- Preserve the calmer lower continuation and reveal-control integration from Stages 115 through 117.

## Non-Goals
- Do not reopen browse-mode Study, Graph, or focused reader-led work during this pass.
- Do not broaden into the deferred narrow-width rail/top-grid regression unless the Home changes directly expose a must-fix break.
- Do not restore the old archive-wall feel or add new product scope.
- Do not change backend or storage behavior.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - rebalance the opening Home spotlight and nearby handoff so the landing starts sooner and reads as one calmer flow
- `frontend/src/index.css`
  - reduce oversized opening-card weight and flatten the nearby support rhythm
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - update Home assertions to cover the calmer spotlight and nearby-flow treatment
- `frontend/src/App.test.tsx`
  - keep broad shell continuity coverage aligned if the Home browse structure shifts materially
- `scripts/playwright/stage121_home_opening_spotlight_compaction_edge.mjs`
  - capture fresh Stage 121 Home, Graph, Study, and focused-Study artifacts in Windows Edge
- `scripts/playwright/stage122_post_stage121_benchmark_audit_edge.mjs`
  - stage the next audit harness so the follow-up benchmark pass can run immediately

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage121_home_opening_spotlight_compaction_edge.mjs`
- `node --check scripts/playwright/stage122_post_stage121_benchmark_audit_edge.mjs`

## Exit Criteria
- Browse-mode Home opens with a lighter `Start here` spotlight and a flatter nearby handoff.
- The top of the landing feels more immediate and less staged in fresh artifacts.
- Study, Graph, and focused Study remain visually stable.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
