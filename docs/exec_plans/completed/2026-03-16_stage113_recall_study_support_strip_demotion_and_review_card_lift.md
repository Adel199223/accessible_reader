# ExecPlan: Stage 113 Recall Study Support Strip Demotion And Review Card Lift

## Summary
- Implement the bounded Study follow-up selected by the Stage 112 benchmark audit.
- Reduce the remaining dashboard feel in browse-mode Study by demoting the top support strip and lifting the review task higher into the canvas.
- Keep the review flow feeling more singular and benchmark-aligned without destabilizing Home, Graph, or focused reader-led work.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Spaced repetition / review
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Quiz & Spaced Repetition](https://docs.getrecall.ai/docs/features/quiz-and-spaced-repetition)
  - [Release: 29 November 2024 // Recall Review Reminders](https://feedback.getrecall.ai/changelog/release-29-november-2024-recall-review-reminders)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Problem Statement
- Stage 105 and later passes materially calmed Study, and Stage 112 confirmed that Home is no longer the clearest blocker after Stage 111.
- The remaining Study mismatch is that browse mode still reads like a centered review card set inside a larger dashboard canvas, with a visible support strip and too much dead space above and around the task.
- The next bounded pass should make the review task feel more immediate and singular without reopening the calmer Home or Graph baselines.

## Goals
- Demote the remaining browse-mode support strip so it reads as utility rather than a persistent dashboard header.
- Lift or tighten the review card within the canvas so the main task owns the page sooner.
- Keep source grounding and Reader reopen available without letting them over-frame the review flow.

## Non-Goals
- Do not reopen Home, Graph, or focused source layouts during this pass.
- Do not broaden into a responsive-shell correction unless the Study implementation directly exposes a must-fix regression.
- Do not change backend or storage behavior.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - rebalance the browse-mode Study opening so the support strip and utility state are quieter and the review card lands higher
  - preserve queue access, source grounding, and Reader reopen actions while reducing dashboard framing
- `frontend/src/index.css`
  - tighten Study browse spacing and support-strip treatment so the review card dominates the surface earlier
  - keep Home, Graph, and focused reader-led surfaces visually stable
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - update Study assertions to cover the calmer support-strip and higher review-card composition
- `frontend/src/App.test.tsx`
  - keep broad shell continuity coverage aligned if browse-mode Study structure shifts
- `scripts/playwright/stage113_study_support_strip_demotion_edge.mjs`
  - capture fresh Stage 113 Home, Graph, Study, and focused-Study artifacts in Windows Edge
- `scripts/playwright/stage114_post_stage113_benchmark_audit_edge.mjs`
  - stage the next audit harness so the follow-up benchmark pass can run immediately

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage113_study_support_strip_demotion_edge.mjs`
- `node --check scripts/playwright/stage114_post_stage113_benchmark_audit_edge.mjs`

## Exit Criteria
- Browse-mode Study reads less like a dashboard and more like a singular review flow.
- The review card lands higher in the canvas with quieter surrounding support chrome.
- Home, Graph, and focused Study remain visually stable in fresh artifacts.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
