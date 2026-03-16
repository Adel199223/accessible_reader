# ExecPlan: Stage 63 Recall Study Session Singularization And Queue Summary Demotion

## Summary
- Completed the bounded Stage 63 Study browse-mode hierarchy pass identified by the Stage 62 benchmark audit.
- Made browse-mode Study feel more like one deliberate review session by demoting the persistent queue summary into a lighter session dock.
- Trimmed extra pre-answer review-card chrome so the prompt owns the page sooner without losing source grounding, Reader reopen, local FSRS state, or focused reader-led Study behavior.

## Implemented Changes
- `frontend/src/components/RecallWorkspace.tsx`
  - collapsed browse-mode Study now labels the support rail as a lighter `Session` dock, shortens the support actions, and keeps the queue summary visibly secondary
  - browse-mode Review now opens with one compact review-session summary strip instead of the older stacked guided-flow and card-context chrome
  - pre-answer placeholder copy is shorter so the main action stays visually primary
- `frontend/src/index.css`
  - narrows the condensed Study browse layout and further flattens the collapsed dock so it reads like utility instead of a competing panel
  - adds the compact review-session summary styling and trims remaining pre-answer support spacing
  - keeps the Stage 61 evidence and support-stack gains while preserving Home, Graph, and focused Study stability
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - updates the targeted Study browse assertions to match the new session-first heading and summary treatment
- `frontend/src/App.test.tsx`
  - refreshes the broad integration expectations for the lighter browse-mode Study dock so the whole-file shell suite stays aligned with the new hierarchy
- `scripts/playwright/stage63_study_session_singularization_edge.mjs`
  - adds the repo-owned Windows Edge harness for the fresh Stage 63 Home, Graph, Study, and focused-Study captures

## Fresh Artifacts
- `output/playwright/stage63-home-landing-desktop.png`
- `output/playwright/stage63-graph-browse-desktop.png`
- `output/playwright/stage63-study-browse-desktop.png`
- `output/playwright/stage63-focused-study-desktop.png`
- `output/playwright/stage63-study-session-singularization-validation.json`

## Outcome
- Stage 63 is complete.
- The fresh Stage 63 captures show a materially calmer Study browse surface: the left-side queue summary now behaves like a compact session dock, and the review card reaches the prompt faster with less dashboard-like pre-answer framing.
- Home and Graph stayed stable, and focused Study preserved the reader-led split.
- The next step is Stage 64 `Post-Stage-63 Benchmark Audit` so the next follow-up is chosen from fresh benchmark evidence rather than from implementation momentum.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage63_study_session_singularization_edge.mjs`

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
- The broad `frontend/src/App.test.tsx` suite is now trustworthy again and was included directly in Stage 63 validation, while targeted tests plus real Edge artifacts remain the first-line UI-validation path.
