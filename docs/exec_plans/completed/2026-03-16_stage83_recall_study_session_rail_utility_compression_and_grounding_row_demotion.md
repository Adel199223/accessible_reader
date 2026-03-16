# ExecPlan: Stage 83 Recall Study Session Rail Utility Compression And Grounding Row Demotion

## Summary
- Completed the bounded Stage 83 Study pass selected by the Stage 82 benchmark audit.
- Compressed the browse-mode `Session` rail and demoted the pre-answer `Grounded` row so the review task feels more singular and utility-led.
- Kept Home, Graph, and focused reader-led work stable while validating with targeted and broad frontend coverage, lint/build, and fresh Windows Edge artifacts.

## Implemented Changes
- `frontend/src/components/RecallWorkspace.tsx`
  - the collapsed Study rail now uses `Up next` and drops the duplicated due-date line from the compact summary.
  - the compact rail now keeps only the active source title below the prompt instead of repeating both source and schedule context.
  - the pre-answer grounding summary is shorter and now reads as one quieter support line.
- `frontend/src/index.css`
  - narrows and tightens the collapsed Study rail so it reads more like lightweight utility than like a sidebar card.
  - demotes the collapsed rail buttons into quieter text-like utilities and trims the compact summary typography.
  - turns the pre-answer `Grounded` row into a lighter kicker-plus-summary line with smaller utility actions.
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - updates the Study browse assertions to lock in the `Up next` rail label, the missing duplicate due line, and the quieter grounding summary copy.
- `frontend/src/App.test.tsx`
  - keeps the broader Recall integration coverage aligned with the slimmer Study browse rail and the updated grounding summary.
- `scripts/playwright/stage83_study_session_rail_utility_compression_edge.mjs`
  - adds the repo-owned Windows Edge harness for fresh Stage 83 Home, Graph, Study, and focused-Study captures.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Spaced repetition / review
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Release: 29 November 2024 // Recall Review Reminders](https://feedback.getrecall.ai/changelog/release-29-november-2024-recall-review-reminders)
  - [Recall Release Notes: Feb 19, 2026 - Quiz 2.0 with Shared Challenges](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-19-2026-quiz-20-with-shared-challenges)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Fresh Artifacts
- `output/playwright/stage83-home-landing-desktop.png`
- `output/playwright/stage83-graph-browse-desktop.png`
- `output/playwright/stage83-study-browse-desktop.png`
- `output/playwright/stage83-focused-study-desktop.png`
- `output/playwright/stage83-study-session-rail-utility-compression-validation.json`

## Outcome
- Stage 83 is complete.
- The fresh Stage 83 captures show a materially calmer Study browse surface:
  - the collapsed `Session` rail now reads more like lightweight utility and less like a standing sidebar summary
  - the pre-answer `Grounded` row now sits lower and quieter under the reveal area
- Home, Graph, and focused Study stayed stable in the fresh Stage 83 artifacts.
- The next step is Stage 84 `Post-Stage-83 Benchmark Audit` so the next bounded pass is chosen from fresh screenshot evidence instead of assumptions carried forward from Stage 82.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage83_study_session_rail_utility_compression_edge.mjs`

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
