# ExecPlan: Stage 93 Recall Study Session Dock Demotion And Review Header Compaction

## Summary
- Completed the bounded Stage 93 Study pass selected by the Stage 92 benchmark audit.
- Further demoted the browse-mode `Session` dock and compressed the pre-answer review header so the prompt/reveal task owns the page sooner.
- Kept Home, Graph, and focused reader-led work stable while validating with targeted and broad frontend coverage, lint/build, and fresh Windows Edge artifacts.

## Implemented Changes
- `frontend/src/components/RecallWorkspace.tsx`
  - reduced the collapsed Study dock summary to one quieter due/new/scheduled label instead of a multi-count status cluster.
  - removed the pre-answer due-state summary from the browse-mode review-session strip so the review card no longer starts with extra scheduling chrome.
  - kept the post-answer rating path, Reader reopen access, and focused Study behavior intact.
- `frontend/src/index.css`
  - narrowed the condensed Study layout further so the dock reads more like utility and less like a standing sidebar column.
  - tightened the collapsed dock spacing, label rhythm, and glance typography so the queue support stops competing with the review card.
  - compressed the browse-mode review-session strip typography and spacing so the prompt starts sooner on desktop.
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - updated the Study browse assertions to lock in the single-summary dock label and the missing pre-answer `Due ...` strip text.
- `frontend/src/App.test.tsx`
  - kept the broader Recall integration coverage aligned with the quieter Study dock summary and the stripped-down pre-answer review header.
- `scripts/playwright/stage93_study_session_dock_demotion_edge.mjs`
  - added the repo-owned Windows Edge harness for fresh Stage 93 Home, Graph, Study, and focused-Study captures.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Spaced repetition / review
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Release: 29 November 2024 // Recall Review Reminders](https://feedback.getrecall.ai/changelog/release-29-november-2024-recall-review-reminders)
  - [Recall Release Notes: Feb 19, 2026 - Quiz 2.0 with Shared Challenges](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-19-2026-quiz-20-with-shared-challenges)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Fresh Artifacts
- `output/playwright/stage93-home-landing-desktop.png`
- `output/playwright/stage93-graph-browse-desktop.png`
- `output/playwright/stage93-study-browse-desktop.png`
- `output/playwright/stage93-focused-study-desktop.png`
- `output/playwright/stage93-study-session-dock-demotion-validation.json`

## Outcome
- Stage 93 is complete.
- The fresh Stage 93 captures show a materially calmer Study browse surface:
  - the collapsed `Session` dock now reads more like quiet utility and less like a persistent sidebar
  - the review card starts sooner because the extra pre-answer due-state framing is gone from the session strip
- Home, Graph, and focused Study stayed stable in the fresh Stage 93 artifacts.
- The next step is Stage 94 `Post-Stage-93 Benchmark Audit` so the next bounded pass is chosen from fresh screenshot evidence instead of assumptions carried forward from Stage 92.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage93_study_session_dock_demotion_edge.mjs`

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
