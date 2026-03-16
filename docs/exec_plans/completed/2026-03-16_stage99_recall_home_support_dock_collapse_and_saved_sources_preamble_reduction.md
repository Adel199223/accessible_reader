# ExecPlan: Stage 99 Recall Home Support Dock Collapse And Saved Sources Preamble Reduction

## Summary
- Completed the bounded Stage 99 Home pass selected by the Stage 98 benchmark audit.
- Tightened the remaining Home support/search copy and footprint and shortened the merged `Saved sources` preamble so the featured reopen flow starts with less setup.
- Kept Study, Graph, and focused reader-led work stable while validating with targeted plus broad frontend coverage, lint/build, and fresh Windows Edge artifacts.

## Implemented Changes
- `frontend/src/components/RecallWorkspace.tsx`
  - shortened the merged no-resume `Saved sources` preamble to `Open one saved source now.`
  - compressed the Home support/search copy and control labels so the dock reads more like utility than like a separate setup panel
  - preserved the in-rail add-source entry, search, grouped reveals, and featured reopen flow
- `frontend/src/index.css`
  - narrowed and tightened the Home support/search dock rhythm, helper copy, and merged-section spacing
  - reduced the remaining merged section copy footprint so the featured reopen card begins with less preamble on desktop
  - kept Study, Graph, and focused reader-led layouts unchanged
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - updated Home assertions so the quieter support copy remains covered while preserving search and add-source expectations
- `scripts/playwright/stage99_home_support_dock_collapse_edge.mjs`
  - added the repo-owned Windows Edge harness for fresh Stage 99 Home, Graph, Study, and focused-Study captures

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Release: 22 August 2024 // UI Improvements](https://feedback.getrecall.ai/changelog/release-22-august-2024-ui-improvements)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Fresh Artifacts
- `output/playwright/stage99-home-landing-desktop.png`
- `output/playwright/stage99-graph-browse-desktop.png`
- `output/playwright/stage99-study-browse-desktop.png`
- `output/playwright/stage99-focused-study-desktop.png`
- `output/playwright/stage99-home-support-dock-collapse-validation.json`

## Outcome
- Stage 99 is complete.
- The fresh Stage 99 captures show a materially calmer Home landing:
  - the left support/search dock is smaller and reads more like utility than like a setup column
  - the merged `Saved sources` preamble is shorter, so the featured reopen flow begins with less staged setup
- Study, Graph, and focused Study stayed stable in the fresh Stage 99 artifacts.
- The next step remained Stage 100 `Post-Stage-99 Benchmark Audit` so the follow-up decision came from fresh screenshot evidence instead of assumption.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage99_home_support_dock_collapse_edge.mjs`

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
