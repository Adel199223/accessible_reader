# ExecPlan: Stage 43 Recall Library Selectivity And Add-Source Hierarchy Cleanup

## Summary
- Stage 42 correctly identified Library/home as the highest-leverage benchmark mismatch after the shared-shell rewrite.
- This slice made the entry surface more selective and calmer while also collapsing the duplicated add-content hierarchy.
- Stage 41 shell changes, Stage 37 browse-first entry, and Stage 34 reader-led focused work all remained intact.

## Landed Behavior
- Library landing:
  - saved sources are now grouped into lighter recency sections instead of one undifferentiated archive wall
  - the newest material stays in a clearer primary collection area, while older sources move into compact reopen rows
  - the sidebar is lighter, with search, resume, and recently updated sources supporting the canvas instead of competing with it
  - `Add source` now reads as a top-level header action instead of a large sidebar callout
- Add content:
  - the global dialog now uses one clear `Add content` heading
  - grouped `Paste text`, `Web page`, and `Choose file` modes remain intact
  - the support column is lighter and no longer competes with a second embedded title

## Validation
- `frontend npm run build`
- file-scoped ESLint on:
  - `src/App.tsx`
  - `src/components/ImportPanel.tsx`
  - `src/components/RecallWorkspace.tsx`
  - `src/components/RecallWorkspace.stage37.test.tsx`
  - `src/components/ImportPanel.test.tsx`
- `frontend vitest run src/components/ImportPanel.test.tsx src/components/RecallWorkspace.stage37.test.tsx src/components/RecallWorkspace.stage34.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose`
- repo-owned real Edge screenshot harness via `node scripts/playwright/stage43_library_selectivity_edge.mjs`

## Artifacts
- `output/playwright/stage43-library-landing-desktop.png`
- `output/playwright/stage43-library-landing-tablet.png`
- `output/playwright/stage43-add-content-dialog-desktop.png`
- `output/playwright/stage43-library-selectivity-validation.json`

## Notes
- The user-granted permission to delete local test/generated content was not needed for this slice; the structural Library changes were clear enough against the current dataset.
- Library/home and Add Content are materially closer to the benchmark now, which clears the way for the next audit to choose between Graph and Study as the next bounded surface pass.
