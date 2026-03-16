# ExecPlan: Stage 91 Recall Home Header Merge And First Reopen Lift

## Summary
- Completed the bounded Stage 91 Home pass selected by the Stage 90 benchmark audit.
- Merged the no-resume `Saved sources` header and first reopen handoff so the landing now opens as one immediate reopen flow instead of as split setup bands.
- Kept the pass tightly bounded to Home and validated it with targeted plus broad frontend coverage, lint/build, and fresh Windows Edge artifacts.

## Implemented Changes
- `frontend/src/components/RecallWorkspace.tsx`
  - completed the no-resume Home merge path so `Saved sources`, the `Earlier` context, `Show all … earlier sources`, and `Add source` now live in one shared section header instead of as separate stacked bands.
  - shortened the merged handoff copy and kept the featured spotlight plus same-section follow-on flow immediately below that merged header.
  - left the resume-path, search-path, Study surface, Graph surface, and focused reader-led work unchanged.
- `frontend/src/index.css`
  - added the merged Home header/layout treatment that keeps the heading and utility actions together on desktop.
  - tightened the merged section spacing so the first featured reopen card starts higher on the page.
  - added a responsive fallback so the merged header still collapses cleanly below the desktop breakpoint.
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - added a no-resume Home regression that asserts the landing uses one `Saved sources` heading, removes the separate `Earlier` heading band, and starts the featured reopen content immediately in that same section.
- `scripts/playwright/stage91_home_header_merge_and_first_reopen_lift_edge.mjs`
  - added the repo-owned Windows Edge harness for fresh Stage 91 Home, Graph, Study, and focused-Study captures.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Release: 22 August 2024 // UI Improvements](https://feedback.getrecall.ai/changelog/release-22-august-2024-ui-improvements)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Fresh Artifacts
- `output/playwright/stage91-home-landing-desktop.png`
- `output/playwright/stage91-graph-browse-desktop.png`
- `output/playwright/stage91-study-browse-desktop.png`
- `output/playwright/stage91-focused-study-desktop.png`
- `output/playwright/stage91-home-header-merge-validation.json`

## Outcome
- Stage 91 is complete.
- The fresh Stage 91 captures show a materially calmer no-resume Home landing:
  - the first featured reopen now begins directly under the merged `Saved sources` header
  - the separate staged `Earlier` intro band is gone from the no-resume flow
  - the Stage 89 utility/search rail remains calmer and secondary
- Study, Graph, and focused Study stayed stable in the fresh Stage 91 artifacts.
- The next step is Stage 92 `Post-Stage-91 Benchmark Audit` so the next bounded pass is chosen from the new screenshots rather than from the pre-implementation Stage 90 diagnosis.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage91_home_header_merge_and_first_reopen_lift_edge.mjs`

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
