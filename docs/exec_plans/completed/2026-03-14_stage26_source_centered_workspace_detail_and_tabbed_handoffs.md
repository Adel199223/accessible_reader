# ExecPlan: Stage 26 Source-Centered Workspace Detail and Tabbed Handoffs

## Summary
- Stage 25 confirmed that one source still felt fragmented across `Library`, `Reader`, `Notes`, `Graph`, and `Study`.
- Stage 26 is now complete.
- The workspace now keeps one selected source closer to the center of the flow through a shared source-workspace frame with nearby `Overview`, `Reader`, `Notes`, `Graph`, and `Study` handoffs.

## Implemented
- Added a shared source-workspace continuity model above section-local detail state so one active source can survive handoffs between Recall sections and `/reader` compatibility routes.
- Added a shared source-workspace frame with:
  - source summary metadata
  - nearby source tabs for `Overview`, `Reader`, `Notes`, `Graph`, and `Study`
  - accessible tab labels that stay distinct from the global shell section row
- Integrated that frame into:
  - Recall `Library` detail
  - Recall `Notes` detail
  - Recall `Graph` detail
  - Recall `Study` detail
  - Reader document mode/reading surface entry
- Kept `/reader?document=...&sentenceStart=...&sentenceEnd=...` stable while treating it as a compatibility entry into the shared source-focused workflow.
- Preserved existing Reader note capture, anchored reopen, note editing, note promotion, and speech behavior.
- Fixed a real continuity bug exposed by the live Stage 26 smoke:
  - stale Graph and Study detail could overwrite the active source during source-tab handoffs
  - explicit node/card selection now intentionally retargets the source workspace
  - stale section detail no longer wins over an in-flight source-centered handoff

## Validation
- Frontend validation is green:
  - `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm test -- --run'`
  - `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm run lint'`
  - `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm run build'`
- A repo-owned real Edge smoke is green:
  - `node scripts/playwright/stage26_source_workspace_tabs_edge.mjs`
- The live smoke covers:
  - source import
  - Reader note capture
  - note promotion into Graph and Study
  - source-tab handoff from Reader to Notes
  - note edit in `Notes`
  - anchored `Open in Reader` return
  - source-tab handoff into `Graph`, `Study`, and `Overview`
  - return to `Reader`
- The live smoke artifacts now exist under `output/playwright/`:
  - `stage26-source-workspace-reader.png`
  - `stage26-source-workspace-notes.png`
  - `stage26-source-workspace-reader-return.png`
  - `stage26-source-workspace-graph.png`
  - `stage26-source-workspace-study.png`
  - `stage26-source-workspace-overview.png`
  - `stage26-source-workspace-reader-final.png`
  - `stage26-source-workspace-validation.json`

## Follow-Up
- The next step is a post-Stage-26 UX refresh audit.
- That audit should decide whether the next high-leverage correction is:
  - deeper source-detail consolidation
  - better collection-to-source transitions
  - cleaner separation between global section browsing and source-focused tabs
  - or another workflow break revealed by the live Stage 26 workspace
