# ExecPlan: Stage 28 Shared Source Panes and Contextual Collection Drawers

## Summary
- Stage 27 confirmed that the active source still is not the true working canvas.
- The source-workspace tabs now preserve source identity and reduce navigation friction, but they still hand off into section-first layouts with duplicated detail panels and competing collection rails.
- The next slice should make one source feel like the main working surface while keeping collection browsing available when needed.

## Goals
- Turn the source workspace into a real shared tabbed content area instead of a handoff header sitting above section-local detail panes.
- Strengthen `Overview` into a useful source home with nearby source summary, notes, graph context, study state, and next actions.
- Demote collection browsing to a contextual or collapsible supporting role during source-focused work without removing the global section row.

## Implementation
- Extract a shared source-detail body below the source-workspace tab row so `Overview`, `Reader`, `Notes`, `Graph`, and `Study` feel like one pane system for the active source.
- Make `Overview` a real source summary surface, likely including:
  - source metadata and reopen actions
  - nearby saved-note summary
  - nearby graph summary
  - nearby study summary
  - clear next actions into reading, note editing, graph validation, and study review
- Replace always-expanded collection rails in source-focused states with lighter contextual browsing affordances:
  - compact browse drawers
  - collapsible collection panels
  - or equivalent low-noise selection surfaces
- Preserve full collection browsing in workspace-level modes; do not remove the global `Library`, `Graph`, `Study`, `Notes`, and `Reader` row.
- Keep `/reader?document=...&sentenceStart=...&sentenceEnd=...` stable by rendering Reader as the source workspace's reading pane.
- Keep the current Reader note workbench and anchored reopen behavior intact.
- Keep search continuity, current-context dock behavior, and recent-work switching intact while reducing duplicated local detail.

## Constraints
- Preserve local-first parsing, storage, search, settings, progress, note anchors, browser-companion handoff, and current Reader behavior.
- Keep `/recall` and `/reader?document=...&sentenceStart=...&sentenceEnd=...` stable.
- Do not reopen deferred scope by default:
  - local TTS
  - OCR for scanned PDFs
  - cloud sync/collaboration
  - chat/Q&A
  - new AI surfaces beyond existing `Simplify` and `Summary`

## Test Plan
- Frontend:
  - source tabs switch one shared source-detail pane instead of bouncing through visibly duplicated section-local detail scaffolding
  - `Overview` surfaces source-specific notes, graph, and study summary without losing the current source
  - source-focused browsing affordances stay available without dominating the source-detail area
  - anchored Reader reopen, Reader note editing, and note promotion still work from the shared source workspace
  - search, current-context dock, and recent-work handoffs still restore the correct source and pane
- Validation:
  - `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm test -- --run'`
  - `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm run lint'`
  - `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm run build'`
  - rerun a repo-owned real Edge smoke focused on source drill-in, pane switching, browse drawer behavior, and anchored Reader continuity

## Notes
- This slice should move the app closer to Recall’s source/card-centered working model without attempting a pixel clone.
- The main success condition is that one source feels like the place you work, while collection browsing feels available but secondary.
- Outcome:
  - `Overview` now acts as a real source summary surface with nearby saved-note, graph, and study context plus direct next actions.
  - source-focused landings from the source workspace now collapse Library, Notes, Graph, and Study browse rails into lighter contextual drawers, while manual section clicks reopen full browse mode.
  - targeted frontend validation is green, and a repo-owned real Edge smoke covering source overview, focused drawer behavior, and source-pane transitions is green.
