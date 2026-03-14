# ExecPlan: Stage 14 Recall Density and Contextual Reader Polish

## Summary
- Stage 13 fixed the biggest workflow-access gaps by surfacing `New`, surfacing `Search`, and moving Reader into a focused split-view layout.
- The next highest-leverage UX gap was density and contextual usefulness: too much persistent chrome still sat above the working surface, and the Reader context column was present but not yet maximally informative.
- This slice moved the app closer to the original Recall benchmark for information density and glanceability without reopening storage, routing, or AI scope.

## Implemented
- Shared shell density:
  - compacted the shared shell header, hero, and workspace section tabs during active working states
  - shortened repeated hero/support copy so Recall and Reader start useful work higher on the page
  - kept the shared Recall shell identity intact instead of forking separate density rules per section
- Reader context polish:
  - added a current-source glance block with source type, note count, capture readiness, updated time, and direct actions
  - made the contextual side panel stickier and more useful while keeping it visually subordinate to the document
  - defaulted Reader context toward `Source` and automatically shifted to `Notes` only when anchor/note state made that the better handoff
- Narrower-width fallbacks:
  - tightened shared spacing in Recall and Reader working surfaces
  - refined the Reader context panel to move from sticky desktop rail to denser two-column and then stacked fallbacks on narrower widths
- Validation tooling:
  - added a repo-owned real Edge smoke harness at `scripts/playwright/stage14_reader_density_edge.mjs`
  - the harness imports a disposable source through the live shell `New` flow, captures desktop and narrow-width artifacts, and cleans up its temporary documents afterward
- Accessibility/quality correction:
  - corrected the Reader document toolbar markup so it no longer creates a second page-level `banner` landmark
  - hardened the affected frontend tests around the actual shell and Reader toolbar structure

## Validation
- Frontend:
  - `npm test -- --run`
  - `npm run lint`
  - `npm run build`
- Live browser:
  - real Edge localhost smoke via `scripts/playwright/stage14_reader_density_edge.mjs`
  - smoke confirmed the denser shell, useful current-source context, and narrower-width fallback against the actual app
- Visual artifacts:
  - `output/playwright/stage14-reader-density-desktop.png`
  - `output/playwright/stage14-reader-density-narrow.png`
  - `output/playwright/stage14-reader-density-validation.json`

## Outcome
- Stage 14 is complete.
- The remaining high-leverage UX gap is no longer the shared shell or the Reader-side context rail; it is the density, scan speed, and action hierarchy of Recall's collection surfaces themselves, especially `Library` and `Notes`.
