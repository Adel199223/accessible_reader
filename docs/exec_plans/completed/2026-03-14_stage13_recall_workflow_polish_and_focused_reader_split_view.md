# ExecPlan: Stage 13 Recall Workflow Polish and Focused Reader Split View

## Summary
- The highest-leverage gap after Stage 12 was workflow polish across the core loop: add something, find it again, read it with low friction, keep context nearby, and return to Recall without losing place.
- The product already had the required local-first behaviors, note anchors, study state, graph state, and browser handoff. The gap was how directly those capabilities were surfaced.
- This slice moved the app closer to a Recall-style workflow without reopening deferred systems or destabilizing reading behavior.

## Implemented
- Shared shell:
  - added global `New` and `Search` actions in the Recall shell header
  - added a reusable add-source dialog for paste, file upload, and public webpage snapshot import
  - kept `/recall` and `/reader?...` stable as the public entry points
- Search flow:
  - added a unified workspace search dialog that blends sources, note hits, and Recall retrieval hits
  - added direct handoff actions from search results into `Reader`, `Notes`, `Graph`, and `Study`
  - made the search dialog reopen fresh on each use instead of carrying stale queries across sessions
- Reader flow:
  - compressed Reader shell chrome so the reading surface starts earlier
  - replaced the stacked support-column layout with an adjacent contextual panel that switches between `Source` and `Notes`
  - preserved import, reopen, settings, speech controls, note capture, anchored reopen, and outage handling
- Handoff continuity:
  - preserved Notes -> Reader, browser companion -> Recall/Reader, and Reader -> prior Recall section handoffs
  - fixed a defensive shortcut bug in Reader by guarding keyboard handling when the event target is not an `Element`

## Validation
- Frontend:
  - `npm test -- --run`
  - `npm run lint`
  - `npm run build`
- Live browser:
  - real Edge import smoke through the new shell-level `New` action
  - real Edge global-search reopen smoke back into focused Reader
  - visual spot-check of generated artifacts at:
    - `output/playwright/stage13-import-debug.png`
    - `output/playwright/stage13-search-reopen-smoke.png`
- Compatibility:
  - reran the repo-owned real Edge extension debug harness after the shell change to confirm browser-companion handoff still works

## Outcome
- Stage 13 is complete.
- The remaining UX gap is no longer access to add/search or the basic Reader split-view model; it is now the density and usefulness of persistent shell/context scaffolding, especially on narrower layouts.
