# ExecPlan: Stage 85 Recall Home Follow-On Reopen Flow And Lower-Canvas Fill

## Summary
- Completed the bounded Stage 85 Home pass selected by the Stage 84 benchmark audit.
- Extended the Home landing beyond the single featured band so the saved-source flow feels more continuous and the lower canvas feels less empty.
- Kept Study, Graph, and focused reader-led work stable while validating with targeted and broad frontend coverage, lint/build, and fresh Windows Edge artifacts.

## Implemented Changes
- `frontend/src/components/RecallWorkspace.tsx`
  - the featured Home section now uses the broader section display limit by default instead of stopping after the spotlight band.
  - the featured section still opens with one `Start here` spotlight plus quieter `Nearby` support rows, but now continues into a subdued `Keep going` reopen list beneath that band.
  - the follow-on reopen list stays within the same recency section so Home reads like one continued selective reopen flow rather than a separate archive wall.
- `frontend/src/index.css`
  - adds a lighter `Keep going` continuation header and a quieter follow-on list treatment under the featured band.
  - keeps the continuation list visually softer than the main featured band so the lower canvas fills without reintroducing heavy card-wall density.
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - updates the Home browse assertions to lock in the new `Keep going` continuation and the fact that additional earlier reopen rows are visible before the explicit full expansion.
- `scripts/playwright/stage85_home_follow_on_reopen_flow_edge.mjs`
  - adds the repo-owned Windows Edge harness for fresh Stage 85 Home, Graph, Study, and focused-Study captures.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Release: 22 August 2024 // UI Improvements](https://feedback.getrecall.ai/changelog/release-22-august-2024-ui-improvements)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Fresh Artifacts
- `output/playwright/stage85-home-landing-desktop.png`
- `output/playwright/stage85-graph-browse-desktop.png`
- `output/playwright/stage85-study-browse-desktop.png`
- `output/playwright/stage85-focused-study-desktop.png`
- `output/playwright/stage85-home-follow-on-reopen-flow-validation.json`

## Outcome
- Stage 85 is complete.
- The fresh Stage 85 captures show a materially more continuous Home landing:
  - the saved-source flow no longer visually stops after the single featured band
  - the lower canvas now carries a quieter continuation without reviving the old archive-wall feel
- Study, Graph, and focused Study stayed stable in the fresh Stage 85 artifacts.
- The next step is Stage 86 `Post-Stage-85 Benchmark Audit` so the next bounded pass is chosen from fresh screenshot evidence instead of assumptions carried forward from Stage 84.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage85_home_follow_on_reopen_flow_edge.mjs`

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
