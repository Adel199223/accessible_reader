# ExecPlan: Stage 123 Recall Study Support Strip Collapse And Review Card Expansion

## Summary
- Implemented the bounded Study follow-up selected by the Stage 122 benchmark audit.
- Collapse the remaining browse-mode support-strip framing and let the review card occupy more of the Study canvas.
- Keep Home, Graph, focused Study, and the deferred narrow-width shell regression stable.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Spaced repetition / review
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Quiz & Spaced Repetition](https://docs.getrecall.ai/docs/features/quiz-and-spaced-repetition)
  - [Release: 22 August 2024 // UI Improvements](https://feedback.getrecall.ai/changelog/release-22-august-2024-ui-improvements)
  - [Release: 29 November 2024 // Recall Review Reminders](https://feedback.getrecall.ai/changelog/release-29-november-2024-recall-review-reminders)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Problem Statement
- Stage 121 materially improved Home, and Stage 122 confirmed that Home, Graph, and focused Study stayed stable afterward.
- Study now leads the remaining mismatch list because two browse-mode framing issues still stand out:
  - the top support strip still reads like residual dashboard chrome instead of quiet in-flow utility
  - the review card still lands too narrowly inside too much empty canvas, so the task does not own the page strongly enough
- The next bounded pass should reduce the leftover framing and let the prompt/reveal flow fill more of the surface.

## Goals
- Collapse the remaining top support-strip treatment into quieter, less separated utility.
- Expand and recenter the review card so the active task occupies more of the browse canvas.
- Preserve the calmer Study hierarchy gained in Stages 105, 113, and 119 without reviving a sidebar or dashboard feel.

## Non-Goals
- Do not reopen Home, Graph, or focused reader-led work during this pass.
- Do not widen into the deferred narrow-width rail/top-grid regression unless the Study changes directly expose a must-fix break.
- Do not remove local FSRS context, source evidence, or Reader reopen access.
- Do not change backend or storage behavior.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - rebalance the browse-mode Study support strip and review-card structure so the task lands sooner and more prominently
- `frontend/src/index.css`
  - reduce remaining support-strip separation and let the review card occupy more of the available browse canvas
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - update Study assertions to cover the quieter support-strip treatment and larger review-card landing
- `frontend/src/App.test.tsx`
  - keep broad shell continuity coverage aligned if the Study browse structure shifts materially
- `scripts/playwright/stage123_study_support_strip_collapse_edge.mjs`
  - capture fresh Stage 123 Home, Graph, Study, and focused-Study artifacts in Windows Edge
- `scripts/playwright/stage124_post_stage123_benchmark_audit_edge.mjs`
  - stage the next audit harness so the follow-up benchmark pass can run immediately

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage123_study_support_strip_collapse_edge.mjs`
- `node --check scripts/playwright/stage124_post_stage123_benchmark_audit_edge.mjs`

## Exit Criteria
- Browse-mode Study uses a quieter, less separated support strip.
- The review card occupies more of the page and feels more task-first in fresh artifacts.
- Home, Graph, and focused Study remain visually stable.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
