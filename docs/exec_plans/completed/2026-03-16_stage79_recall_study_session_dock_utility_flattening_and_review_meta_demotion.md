# ExecPlan: Stage 79 Recall Study Session Dock Utility Flattening And Review Meta Demotion

## Summary
- Completed the bounded Stage 79 Study pass selected by the Stage 78 benchmark audit.
- Flattened the browse-mode `Session` dock and demoted the pre-answer review meta so the prompt owns the page sooner and the page feels less dashboard-like.
- Kept Home, Graph, and focused reader-led work stable while validating with targeted/broad frontend coverage, lint/build, and fresh Windows Edge artifacts.

## Implemented Changes
- `frontend/src/components/RecallWorkspace.tsx`
  - the collapsed Study dock now uses a lighter `Next` utility summary instead of repeating the old filter-chip emphasis.
  - the pre-answer review strip now uses quieter due-state copy and drops the louder `Choose · Reveal · Rate` framing before the prompt.
  - the browse-mode review subtitle is shorter so the main task begins sooner.
- `frontend/src/index.css`
  - narrows and softens the collapsed Study dock, reduces button and summary weight, and tightens the browse-mode review strip.
  - slightly compresses the centered review card shell so the prompt begins higher in the page.
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - updates the Study browse assertions to lock in the lighter `Next` dock summary and the quieter pre-answer strip.
- `frontend/src/App.test.tsx`
  - keeps the broader Recall integration coverage aligned with the calmer Study browse behavior and the source-focused return flow.
- `scripts/playwright/stage79_study_session_dock_utility_flattening_edge.mjs`
  - adds the repo-owned Windows Edge harness for fresh Stage 79 Home, Graph, Study, and focused-Study captures.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Spaced repetition / review
- Official supporting Recall sources:
  - [Recall docs introduction](https://docs.getrecall.ai/docs/introduction)
  - [Release: 29 November 2024 // Recall Review Reminders](https://feedback.getrecall.ai/changelog/release-29-november-2024-recall-review-reminders)
  - [Recall Release Notes: Feb 19, 2026 - Quiz 2.0 with Shared Challenges](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-19-2026-quiz-20-with-shared-challenges)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Fresh Artifacts
- `output/playwright/stage79-home-landing-desktop.png`
- `output/playwright/stage79-graph-browse-desktop.png`
- `output/playwright/stage79-study-browse-desktop.png`
- `output/playwright/stage79-focused-study-desktop.png`
- `output/playwright/stage79-study-session-dock-utility-flattening-validation.json`

## Outcome
- Stage 79 is complete.
- The fresh Stage 79 captures show a materially calmer Study browse surface:
  - the collapsed `Session` dock now reads more like utility than like a persistent dashboard sidebar
  - the pre-answer review strip is quieter, so the prompt becomes the main focal point sooner
- Home, Graph, and focused Study stayed stable in the fresh Stage 79 artifacts.
- The next step is Stage 80 `Post-Stage-79 Benchmark Audit` so the next bounded pass is chosen from fresh screenshot evidence instead of assumptions carried forward from Stage 78.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage79_study_session_dock_utility_flattening_edge.mjs`

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
