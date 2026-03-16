# ExecPlan: Stage 127 Recall Study Support Strip Removal And Review Canvas Lift

## Summary
- Implemented the bounded Study follow-up selected by the Stage 126 benchmark audit.
- Removed the remaining empty top support-strip framing so browse-mode Study starts closer to the review task.
- Lifted and simplified the browse-mode review canvas while keeping Home, Graph, focused Study, and the deferred narrow-width shell regression stable.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Spaced repetition / review
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Quiz & Spaced Repetition](https://docs.getrecall.ai/docs/features/quiz-and-spaced-repetition)
  - [Release: 29 November 2024 // Recall Review Reminders](https://feedback.getrecall.ai/changelog/release-29-november-2024-recall-review-reminders)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Problem Statement
- Stage 125 materially improved Home, and Stage 126 confirmed that Home no longer leads the remaining mismatch list.
- Study now leads again because browse mode still opens with visible leftover framing above the review card:
  - the top support strip still leaves a mostly empty bar above the task
  - the review card still sits lower in the page than the benchmark direction wants
  - the remaining empty canvas makes the review flow feel less immediate than Recall’s task-first review surface
- The next bounded pass should preserve the calmer Stage 123 review direction while pulling the task higher and stripping away leftover browse chrome.

## Goals
- Remove or materially demote the empty top support-strip treatment in browse-mode Study.
- Lift the review card so the task owns the page sooner.
- Preserve the existing calmer prompt/evidence hierarchy gained in Stages 123 and 125-era Home stability work.

## Non-Goals
- Do not reopen Home, Graph, or focused reader-led work during this pass.
- Do not widen into the deferred narrow-width rail/top-grid regression unless the Study changes directly expose a must-fix break.
- Do not change backend or storage behavior.
- Do not reintroduce a heavy queue/sidebar frame.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - remove or collapse the remaining top support-strip scaffolding and rebalance the Study browse canvas so the review task starts higher
- `frontend/src/index.css`
  - reduce empty browse-mode Study top spacing and simplify remaining support framing
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - update Study assertions to cover the lighter top chrome and lifted review canvas
- `frontend/src/App.test.tsx`
  - keep broad shell continuity coverage aligned if the Study browse structure shifts materially
- `scripts/playwright/stage127_study_support_strip_removal_edge.mjs`
  - capture fresh Stage 127 Home, Graph, Study, and focused-Study artifacts in Windows Edge
- `scripts/playwright/stage128_post_stage127_benchmark_audit_edge.mjs`
  - stage the next audit harness so the follow-up benchmark pass can run immediately

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage127_study_support_strip_removal_edge.mjs`
- `node --check scripts/playwright/stage128_post_stage127_benchmark_audit_edge.mjs`

## Exit Criteria
- Browse-mode Study no longer opens with a visibly empty support strip above the review task.
- The review card lands higher and feels more immediate in fresh artifacts.
- Home, Graph, and focused Study remain visually stable.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
