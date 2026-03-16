# ExecPlan: Stage 101 Recall Home Support Utility Inlining And Saved Sources Preamble Removal

## Summary
- Completed the bounded Stage 101 Home pass selected by the Stage 100 benchmark audit.
- Inlined the remaining Home support utilities into one compact header row and removed the lingering saved-sources preamble above the first featured reopen flow.
- Kept Study, Graph, and focused reader-led work stable while validating with targeted plus broad frontend coverage, lint/build, and fresh Windows Edge artifacts.

## Implemented Changes
- `frontend/src/components/RecallWorkspace.tsx`
  - replaced the old no-resume Home side dock with an inline Home utility header that keeps search, add-source entry, and collection snapshot closer to the main reopen flow
  - removed the merged `Saved sources` heading/preamble above the first featured reopen section when Home is in the no-resume landing state
  - preserved grouped recency reveals, the featured `Start here` card, and the existing resume/search/focused workflows
- `frontend/src/index.css`
  - converted the Home landing from the old narrow sidebar grid into a one-flow landing with inline header actions
  - added the lighter inline Home heading, summary, and utility-action layout
  - kept Study, Graph, and focused reader-led layouts unchanged
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - updated Home assertions so the tests follow the inline Home utility header and the removed saved-sources preamble
- `frontend/src/App.test.tsx`
  - refreshed broad Home landing expectations so the app suite no longer assumes the old `Saved sources` heading is the primary Home heading
- `scripts/playwright/stage101_home_support_utility_inlining_edge.mjs`
  - added the repo-owned Windows Edge harness for fresh Stage 101 Home, Graph, Study, and focused-Study captures

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Release: 22 August 2024 // UI Improvements](https://feedback.getrecall.ai/changelog/release-22-august-2024-ui-improvements)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Fresh Artifacts
- `output/playwright/stage101-home-landing-desktop.png`
- `output/playwright/stage101-graph-browse-desktop.png`
- `output/playwright/stage101-study-browse-desktop.png`
- `output/playwright/stage101-focused-study-desktop.png`
- `output/playwright/stage101-home-support-utility-inlining-validation.json`

## Outcome
- Stage 101 is complete.
- The fresh Stage 101 captures show a materially calmer Home landing:
  - the old left support/search dock is gone from the no-resume landing
  - the first featured reopen flow now begins much closer to the Home heading
  - the remaining utility actions read like support, not setup chrome
- Study, Graph, and focused Study stayed stable in the fresh Stage 101 artifacts.
- The next step is Stage 102 `Post-Stage-101 Benchmark Audit` so the next bounded surface pass is chosen from fresh screenshot evidence instead of assumption.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage101_home_support_utility_inlining_edge.mjs`

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
