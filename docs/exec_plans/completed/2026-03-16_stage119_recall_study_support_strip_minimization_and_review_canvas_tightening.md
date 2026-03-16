# ExecPlan: Stage 119 Recall Study Support Strip Minimization And Review Canvas Tightening

## Summary
- Implement the bounded Study follow-up selected by the Stage 118 benchmark audit.
- Reduce the remaining browse-mode support-strip framing and tighten the review canvas so the task owns the page sooner.
- Keep Home, Graph, focused Study, and the deferred narrow-width shell regression stable.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Spaced repetition / review
  - Home / items
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Quiz & Spaced Repetition](https://docs.getrecall.ai/docs/features/quiz-and-spaced-repetition)
  - [Release: 29 November 2024 // Recall Review Reminders](https://feedback.getrecall.ai/changelog/release-29-november-2024-recall-review-reminders)
  - [Release: 22 August 2024 // UI Improvements](https://feedback.getrecall.ai/changelog/release-22-august-2024-ui-improvements)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Problem Statement
- Stage 117 materially improved Home, and Stage 118 confirmed that Home is no longer the clearest remaining blocker.
- Study now leads the remaining mismatch list again because browse mode still carries too much framing around the review task:
  - the `Session` support strip still reads too much like lingering dashboard chrome
  - the main review card still sits inside more empty canvas than the Recall direction wants
- The next bounded pass should keep the calmer centered review direction while making the task feel more immediate and less staged.

## Goals
- Minimize the remaining support-strip weight around the browse-mode Study task.
- Tighten the review canvas so the card lands higher and feels more task-first.
- Preserve source evidence, Reader reopen access, and focused reader-led Study work.

## Non-Goals
- Do not reopen Home, Graph, or focused Study layout work during this pass.
- Do not broaden into the deferred narrow-width rail/top-grid regression unless the Study changes directly expose a must-fix break.
- Do not change backend or storage behavior.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - reduce remaining browse-mode Study support-strip framing
  - tighten the review card landing so the task begins sooner
- `frontend/src/index.css`
  - reduce empty browse-mode Study canvas and soften any remaining support-strip chrome
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - update Study assertions to cover the calmer support strip and tighter review-card landing
- `frontend/src/App.test.tsx`
  - keep broad shell continuity coverage aligned if the Study browse structure shifts materially
- `scripts/playwright/stage119_study_support_strip_minimization_edge.mjs`
  - capture fresh Stage 119 Home, Graph, Study, and focused-Study artifacts in Windows Edge
- `scripts/playwright/stage120_post_stage119_benchmark_audit_edge.mjs`
  - stage the next audit harness so the follow-up benchmark pass can run immediately

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage119_study_support_strip_minimization_edge.mjs`
- `node --check scripts/playwright/stage120_post_stage119_benchmark_audit_edge.mjs`

## Exit Criteria
- Browse-mode Study feels more centered on the review task with lighter surrounding support chrome.
- The remaining empty dashboard-canvas feel is materially reduced in fresh artifacts.
- Home, Graph, and focused Study remain visually stable.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
