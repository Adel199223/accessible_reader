# ExecPlan: Stage 39 Recall Hierarchy Cleanup and Responsive Card Density

## Summary
- Stage 38 confirmed the remaining UX break was no longer browse-vs-focused entry behavior, but that Recall still looked denser and noisier than the benchmark.
- This slice cleaned up the default landing hierarchy, reduced repeated shell labeling, widened and clarified source cards, removed the redundant focused-Library search panel, and softened the focused-source strip without reopening navigation or backend scope.
- The browse-first landing and reader-led focused work from Stages 34 and 37 stayed intact.

## Landed Behavior
- Default landing:
  - source cards are wider and easier to scan
  - date/title/source hierarchy is clearer
  - long source text clamps cleanly instead of reading like a dense log wall
  - tablet widths now choose fewer columns instead of over-compressing cards
- Shell chrome:
  - the default Library top bar is quieter and no longer repeats `Recall`/`Library`/workspace copy as heavily
  - focused mode no longer duplicates `Focused source` in both the top bar and the source strip
- Focused Library:
  - the inline `Search workspace` panel was removed
  - source overview chips/actions were trimmed so the page reads more like one source summary and less like stacked dashboard modules
- Focused source strip:
  - source locator moved into calmer supporting text
  - visual weight and chip overload were reduced
- Live regression cleanup included:
  - fixing dark-on-dark landing card text
  - fixing the high-contrast `New` button so it keeps its active background

## Validation
- `frontend npm run lint`
- `frontend npm run build`
- `frontend vitest run src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose`
- `frontend vitest run src/App.test.tsx -t "source-focused mode swaps the utility dock for the compact source strip|manual Library clicks return to the browse-first landing without forgetting the last focused source tab" --maxWorkers=1 --pool=threads --testTimeout=30000 --reporter=verbose`
- repo-owned real Edge browse-first smoke via `scripts/playwright/stage37_collection_first_landing_edge.mjs`
- repo-owned real Edge screenshot capture via `scripts/playwright/stage39_hierarchy_density_edge.mjs`

## Artifacts
- `output/playwright/stage39-landing-desktop.png`
- `output/playwright/stage39-focused-library-desktop.png`
- `output/playwright/stage39-focused-notes-desktop.png`
- `output/playwright/stage39-landing-tablet.png`
- `output/playwright/stage39-hierarchy-density-validation.json`

## Notes
- The landing and focused Library are materially calmer now, but the fresh screenshots still show the next likely bottleneck: focused split-work panes remain somewhat over-framed compared with the benchmark, especially in `Notes`.
