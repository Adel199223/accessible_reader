# ExecPlan: Stage 105 Recall Study Session Rail Demotion And Review Canvas Recentering

## Summary
- Completed the bounded Study pass selected by the Stage 104 benchmark audit.
- Demoted the browse-mode `Session` rail into a lightweight support strip instead of a standing sidebar.
- Recentered the browse-mode review canvas so the active card owns more of the page without disturbing focused Study or the calmer Home/Graph surfaces.

## Implemented Changes
- `frontend/src/components/RecallWorkspace.tsx`
  - converted the condensed browse-mode Study rail into a top support strip instead of a left standing column
  - removed the repeated active-card prompt from the collapsed rail so the main review card becomes the first strong content
  - kept queue access, refresh behavior, source evidence, reveal/rating flow, and Reader reopen intact
- `frontend/src/index.css`
  - changed the condensed Study browse layout to a single-column, centered frame
  - softened the collapsed `Session` rail into lighter utility support with a flatter top strip treatment
  - widened and recentered the review canvas slightly without changing focused Study, Home, or Graph layouts
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - extended Study assertions so the collapsed queue summary no longer repeats the active prompt
- `frontend/src/App.test.tsx`
  - refreshed the broad Study browse assertions so the calmer collapsed summary stays covered in the whole-app path
- `scripts/playwright/stage105_study_session_rail_demotion_edge.mjs`
  - added the repo-owned Windows Edge harness for fresh Stage 105 Home, Graph, Study, and focused-Study captures
- `scripts/playwright/stage106_post_stage105_benchmark_audit_edge.mjs`
  - staged the next audit harness so the post-implementation benchmark pass can run immediately

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Spaced repetition / review
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Quiz & Spaced Repetition](https://docs.getrecall.ai/docs/features/quiz-and-spaced-repetition)
  - [Release: 29 November 2024 // Recall Review Reminders](https://feedback.getrecall.ai/changelog/release-29-november-2024-recall-review-reminders)
  - [Recall Release Notes: Feb 19, 2026 - Quiz 2.0 with Shared Challenges](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-19-2026-quiz-20-with-shared-challenges)

## Fresh Artifacts
- `output/playwright/stage105-home-landing-desktop.png`
- `output/playwright/stage105-graph-browse-desktop.png`
- `output/playwright/stage105-study-browse-desktop.png`
- `output/playwright/stage105-focused-study-desktop.png`
- `output/playwright/stage105-study-session-rail-demotion-validation.json`

## Outcome
- Stage 105 is complete.
- The fresh Stage 105 state materially calms browse-mode Study:
  - the collapsed `Session` rail now reads like top support utility rather than a persistent sidebar
  - the review card now owns the page sooner because the condensed browse layout no longer reserves a standing left column
  - the active prompt no longer repeats inside the collapsed rail, so the task frame stays singular
- Home, Graph, and focused Study stayed stable in the fresh Stage 105 artifacts.
- The next step is Stage 106 `Post-Stage-105 Benchmark Audit` so the next bounded surface pass is still chosen from fresh screenshot evidence instead of assumption.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage105_study_session_rail_demotion_edge.mjs`
- `node --check scripts/playwright/stage106_post_stage105_benchmark_audit_edge.mjs`

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
