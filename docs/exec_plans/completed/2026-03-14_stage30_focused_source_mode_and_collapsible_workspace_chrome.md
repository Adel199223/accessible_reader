# ExecPlan: Stage 30 Focused Source Mode and Collapsible Workspace Chrome

## Summary
- Stage 29 confirmed that source identity, handoff continuity, and contextual browse drawers were no longer the main UX break.
- The remaining friction was that active source work still began below dashboard-level shell chrome and supporting browse scaffolding.
- This slice lets one active source take over the working canvas while keeping workspace context and browse affordances reachable on demand.

## Goals
- Promote the active source workspace to the top of the working surface whenever the user is in a source-focused session.
- Compress hero, current-context, and recent-work chrome during source-focused work without losing orientation.
- Keep Library, Notes, Graph, and Study browsing available, but secondary and explicitly invoked while a source is active.
- Preserve local-first behavior, routes, anchors, search continuity, browser-companion handoff, and current Reader behavior.

## Implementation
- Introduced a shell-owned source-focused mode in `frontend/src/App.tsx` and `frontend/src/components/RecallShellFrame.tsx`.
- Promoted `SourceWorkspaceFrame` above generic shell support chrome whenever a source-focused session is active.
- Collapsed hero, current-context, and recent-work support into an explicit `Show workspace support` strip instead of keeping those panels above the active source by default.
- Moved Recall and Reader source-workspace publishing into shell-owned state so source-focused work stays visually consistent across `/recall` and `/reader`.
- Preserved browse-first behavior by keeping manual section clicks explicit and reopening full browse drawers when the user asks for broad section browsing.
- Added a repo-owned Stage 30 real Edge smoke harness in `scripts/playwright/stage30_focused_source_mode_edge.mjs`.

## Constraints
- No backend API, storage, or export changes.
- Kept `/recall` and `/reader?document=...&sentenceStart=...&sentenceEnd=...` stable.
- Did not widen into new AI, sync, OCR, chat, or other deferred systems.

## Validation Outcome
- `frontend/src/App.test.tsx`
  - targeted Stage 30 coverage is green for:
    - `Recall source workspace tabs reopen Reader for the selected source`
    - `Recall source overview surfaces nearby notes, graph, and study context for the active source`
- `frontend npm run lint` and `frontend npm run build` were green during the Stage 30 implementation pass before the later WSL shell instability.
- Real Edge validation is green through `scripts/playwright/stage30_focused_source_mode_edge.mjs`, covering:
  - source-focused Reader landing
  - support chrome hidden by default
  - explicit support reopen
  - source-focused Overview return
  - manual Notes browse reopen
  - Reader return with support collapsed again
- Artifacts:
  - `output/playwright/stage30-focused-source-reader.png`
  - `output/playwright/stage30-focused-source-support-open.png`
  - `output/playwright/stage30-focused-source-overview.png`
  - `output/playwright/stage30-focused-source-notes-browse.png`
  - `output/playwright/stage30-focused-source-reader-return.png`
  - `output/playwright/stage30-focused-source-validation.json`

## Residual Note
- The broad `frontend npm test -- --run` pass is still not trustworthy because the large `frontend/src/App.test.tsx` integration file stalls after the second test when run as a whole. The Stage 30 product change is validated through targeted coverage plus the real Edge smoke, but the frontend test runner itself still needs a later stabilization pass.

## Notes
- This slice was intentionally UX-structural, not feature-expanding.
- The benchmark remained Recall's source/card-first workflow direction, especially the later 2025 card redesign and split-view emphasis.
