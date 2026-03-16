# ExecPlan: Stage 67 Recall Study Session Dock Narrowing And Review Header Demotion

## Summary
- Completed the bounded Stage 67 Study browse-mode hierarchy pass identified by the Stage 66 benchmark audit.
- Narrowed the browse-mode Study session dock so it behaves more like secondary utility than like a sibling panel.
- Demoted the pre-answer review header and flow chrome so the prompt owns the page sooner without losing source grounding, Reader reopen, local FSRS state, or focused reader-led Study behavior.

## Implemented Changes
- `frontend/src/components/RecallWorkspace.tsx`
  - collapsed browse-mode Study now uses shorter dock summary copy so the dock carries only the active question plus compact due/status context
  - browse-mode review-session header now drops repeated evidence-count metadata before reveal and keeps the top summary focused on due/review state
  - browse-mode review-card intro copy is shorter so the active question stays visually primary
- `frontend/src/index.css`
  - narrows the condensed Study browse layout and trims the collapsed dock spacing, typography, and utility-button emphasis
  - demotes the browse-mode review-session strip by turning the old pill-heavy step row into quieter inline progress text and by reducing summary typography weight
  - preserves the calmer Home, Graph, and focused Study baselines while tightening only browse-mode Study chrome
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - extends targeted Study browse assertions to verify the lighter pre-answer review-session summary treatment
- `frontend/src/App.test.tsx`
  - refreshes the broad integration expectations so the whole-file shell suite stays aligned with the quieter Study browse header
- `scripts/playwright/stage67_study_session_dock_narrowing_edge.mjs`
  - adds the repo-owned Windows Edge harness for the fresh Stage 67 Home, Graph, Study, and focused-Study captures

## Fresh Artifacts
- `output/playwright/stage67-home-landing-desktop.png`
- `output/playwright/stage67-graph-browse-desktop.png`
- `output/playwright/stage67-study-browse-desktop.png`
- `output/playwright/stage67-focused-study-desktop.png`
- `output/playwright/stage67-study-session-dock-narrowing-validation.json`

## Outcome
- Stage 67 is complete.
- The fresh Stage 67 captures show a materially calmer Study browse surface: the left dock is narrower and lighter, and the pre-answer review header now reads more like quiet context than like a competing status panel.
- Home and Graph stayed stable, and focused Study preserved the reader-led split.
- The next step is Stage 68 `Post-Stage-67 Benchmark Audit` so the next follow-up is chosen from fresh benchmark evidence rather than from implementation momentum.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage67_study_session_dock_narrowing_edge.mjs`

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
- The broad `frontend/src/App.test.tsx` suite is trustworthy again and was included directly in Stage 67 validation, while targeted tests plus real Edge artifacts remain the first-line UI-validation path.
