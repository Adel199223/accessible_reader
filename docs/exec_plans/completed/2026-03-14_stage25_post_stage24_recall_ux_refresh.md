# ExecPlan: Stage 25 Post-Stage-24 Recall UX Refresh

## Summary
- Completed on 2026-03-14.
- Stage 24 materially reduced note-work context switching inside Reader, so note adjacency is no longer the largest remaining UX break.
- The next primary friction point is that one source still gets fragmented across global section surfaces instead of feeling like one source-centered Recall workspace with nearby tabs and contextual handoffs.

## Audit Inputs
- Reviewed the live post-Stage-24 artifacts, especially:
  - `output/playwright/stage24-reader-notebook-workbench.png`
  - `output/playwright/stage24-reader-notebook-notes.png`
  - `output/playwright/stage24-reader-notebook-reader-return.png`
  - `output/playwright/stage24-reader-notebook-validation.json`
- Rechecked the local workspace endpoints to confirm the current app state was reachable during the audit:
  - `http://127.0.0.1:5173/recall`
  - `http://127.0.0.1:8000/api/health`
- Re-benchmarked against current official Recall material, especially:
  - the 2025-03-18 Recall changelog entry describing side-by-side Reader plus editable Notebook and a read-only Reader
  - the 2025-01-09 Recall changelog entry describing a consolidated `+New` flow
  - later 2025 changelog notes describing source-card tabs, expanded reading space, and split-view flexibility

## Outcome
- Stage 24 succeeded:
  - saved-note editing and promotion are now close enough to active reading that routine note work no longer forces an immediate jump into `Notes`
  - shared search and `Notes` handoffs back into Reader now feel materially tighter
- The next workflow break is source fragmentation:
  - `Library` owns selected source detail
  - `Reader` owns reading and nearby note work
  - `Notes` owns workspace note management
  - `Graph` and `Study` own evidence and review detail
  - working on one source still means hopping across section-first surfaces rather than staying inside one source-centered workspace
- Inference from the Recall benchmark:
  - Recall increasingly organizes work around a source/card with adjacent tabs and split views, not around separate global destinations for every kind of follow-up
  - our next slice should move toward that source-centered workflow while preserving the current local-first contracts and stable routes

## Next Milestone Choice
- The next bounded slice should be Stage 26: source-centered workspace detail and tabbed handoffs.
- It should keep the global section row for broad browsing, but make one selected source feel like the primary working frame with nearby Overview/Reader/Notes/Graph/Study transitions.

## Notes
- This remained an audit/continuity pass; no code correction was required to complete the stage.
- The directional benchmark remains Recall's current workflow and information hierarchy, not a pixel-perfect copy target.
