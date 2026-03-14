# ExecPlan: Stage 16 Recall Graph and Study Density plus Evidence Handoffs

## Summary
- Stage 15 brought `Library` and `Notes` closer to the original Recall workflow benchmark by making saved-item browsing denser and more action-ready.
- This slice extended that same UX correction into `Graph` and `Study`, where review still traveled farther than it should and source evidence was not yet as adjacent or glanceable as the rest of the workspace.

## Completed Work
- Graph:
  - converted the node list into a denser review rail with scan-speed status, confidence, mention counts, and source-document counts
  - reshaped node detail around evidence-first mentions and relations, with nearby Reader reopen actions instead of evidence-only text blocks
  - kept confirm/reject actions adjacent to relation evidence so graph review now behaves more like the rest of the Recall workspace
- Study:
  - converted the queue into a denser card rail with clearer type, due, review-count, and source context
  - reshaped active-card detail around source evidence, nearby Reader reopen, and tighter answer/review controls
  - added anchored Reader reopen from note-promoted study-card evidence when sentence-range note anchors are available
- Handoff continuity:
  - preserved Notes -> Graph/Study promotion results, Graph/Study -> Reader reopen, and local-first graph/study behavior
  - fixed a real Study handoff bug: targeted cards could fall out of the loaded queue window and silently fall back to some unrelated visible card; the queue loader now sizes itself from the local study overview so focused cards remain available in the local UI
- Validation harness:
  - added a repo-owned real Edge smoke at `scripts/playwright/stage16_recall_graph_study_density_edge.mjs`
  - validated graph/detail inspection, Reader reopen from Graph evidence, Study open-through-search, and anchored Reader reopen from note-promoted Study evidence

## Validation
- Frontend:
  - `npm test -- --run`
  - `npm run lint`
  - `npm run build`
- Live browser:
  - green real Edge smoke covering promoted graph/study evidence inspection and Reader reopen
  - artifacts written to `output/playwright/stage16-recall-graph-density.png`, `output/playwright/stage16-recall-graph-reader-handoff.png`, `output/playwright/stage16-recall-study-density.png`, `output/playwright/stage16-recall-study-reader-handoff.png`, and `output/playwright/stage16-recall-graph-study-density-validation.json`

## Outcome
- Stage 16 is complete.
- The next best step is no longer another guessed UI slice; it is a fresh Recall-benchmark UX audit now that the Stage 13-16 workflow and density passes have landed.
