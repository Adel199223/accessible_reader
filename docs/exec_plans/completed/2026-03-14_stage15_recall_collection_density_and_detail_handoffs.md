# ExecPlan: Stage 15 Recall Collection Density and Detail Handoffs

## Summary
- Stage 14 compacted the shared shell and made Reader's contextual side panel more useful without giving back the focused split-view gains from Stage 13.
- This slice moved the densification work into Recall's saved-item surfaces so `Library` and `Notes` are faster to scan, easier to inspect, and easier to act on.

## Completed Work
- Shared collection pattern:
  - introduced a denser collection-rail treatment for Recall saved-item surfaces so filters stay visually attached to the list they control
  - kept section state and route behavior stable while tightening row density, spacing, and selection clarity
- Library:
  - added an in-rail `Filter sources` control so local scan/refine happens where sources already live
  - compressed source rows to surface title, source context, type, freshness, and quick metadata sooner
  - tightened the selected-document detail panel into a more glanceable brief with nearby `Open in Reader`, `Export Markdown`, and `View notes` actions
- Notes:
  - replaced the looser document-selector/search stack with a denser filter row attached to the note list
  - compressed note rows to show anchor text, note preview, document context, and sentence span at scan speed
  - regrouped note-detail actions so `Open in Reader`, save, and delete stay primary while note-promotion actions live in a dedicated adjacent panel
- Handoff continuity:
  - preserved Library -> Reader reopen, Notes -> Reader anchored reopen, note promotion, and export behavior
  - kept local-first storage contracts and frontend/backend route semantics unchanged
- Validation harness:
  - added a repo-owned real Edge smoke at `scripts/playwright/stage15_recall_collection_density_edge.mjs`
  - verified Library filter, Notes detail handoff, and anchored Reader reopen through the live localhost app

## Validation
- Frontend:
  - `npm test -- --run`
  - `npm run lint`
  - `npm run build`
- Live browser:
  - green real Edge smoke covering source import, note capture, Library filter/detail selection, Notes detail, and anchored `Open in Reader`
  - artifacts written to `output/playwright/stage15-recall-library-density.png`, `output/playwright/stage15-recall-notes-density.png`, `output/playwright/stage15-recall-notes-reader-handoff.png`, and `output/playwright/stage15-recall-collection-density-validation.json`

## Outcome
- Stage 15 is complete.
- The next bounded UX gap is now `Graph` and `Study`, where review flows still need the same density, evidence adjacency, and lower-friction handoffs that `Library` and `Notes` now have.
