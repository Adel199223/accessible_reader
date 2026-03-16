# ExecPlan: Stage 87 Recall Study Session Dock Minimization And Review Canvas Recentering

## Summary
- Completed the bounded Stage 87 Study pass selected by the Stage 86 benchmark audit.
- Further minimized the browse-mode `Session` dock and tightened the pre-answer review framing so the prompt and reveal flow own the page sooner.
- Kept Home, Graph, and focused reader-led work stable while validating with targeted and broad frontend coverage, lint/build, and fresh Windows Edge artifacts.

## Implemented Changes
- `frontend/src/components/RecallWorkspace.tsx`
  - the collapsed Study dock now removes the redundant source-summary line and keeps one smaller `Up next` summary instead of repeating source context.
  - the browse-mode review header no longer repeats the extra descriptive paragraph when an active card is already present.
  - the pre-answer review-session strip now keeps only the compact state plus due-date summary instead of repeating the source title.
  - the pre-answer reveal copy is shorter and the `Grounded` summary now uses only the evidence label instead of repeating the source title again.
- `frontend/src/index.css`
  - narrows the condensed Study layout further so the dock behaves more like lightweight utility than like a standing sidebar column.
  - trims the collapsed dock spacing and glance typography.
  - recenters the browse-mode review card by tightening the section width, card padding, and pre-answer frame spacing.
  - keeps the lower `Grounded` utility row lighter and more compact.
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - updates the Study browse assertions to lock in the missing redundant source lines in both the dock and the review-session strip.
  - keeps the pre-answer evidence summary aligned with the shorter evidence-label-only summary.
- `frontend/src/App.test.tsx`
  - keeps the broader Recall integration coverage aligned with the slimmer dock summary, shorter session strip, and lighter pre-answer evidence summary.
- `scripts/playwright/stage87_study_session_dock_minimization_edge.mjs`
  - adds the repo-owned Windows Edge harness for fresh Stage 87 Home, Graph, Study, and focused-Study captures.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Spaced repetition / review
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Release: 29 November 2024 // Recall Review Reminders](https://feedback.getrecall.ai/changelog/release-29-november-2024-recall-review-reminders)
  - [Recall Release Notes: Feb 19, 2026 - Quiz 2.0 with Shared Challenges](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-19-2026-quiz-20-with-shared-challenges)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Fresh Artifacts
- `output/playwright/stage87-home-landing-desktop.png`
- `output/playwright/stage87-graph-browse-desktop.png`
- `output/playwright/stage87-study-browse-desktop.png`
- `output/playwright/stage87-focused-study-desktop.png`
- `output/playwright/stage87-study-session-dock-minimization-validation.json`

## Outcome
- Stage 87 is complete.
- The fresh Stage 87 captures show a materially calmer Study browse surface:
  - the `Session` dock now reads more like compact utility and less like a standing sidebar
  - the review card begins sooner because the redundant browse header and source-repeat strip were removed
- Home, Graph, and focused Study stayed stable in the fresh Stage 87 artifacts.
- The next step is Stage 88 `Post-Stage-87 Benchmark Audit` so the next bounded pass is chosen from fresh screenshot evidence instead of assumptions carried forward from Stage 86.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage87_study_session_dock_minimization_edge.mjs`

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
