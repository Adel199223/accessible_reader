# ExecPlan: Stage 14 Recall Density and Contextual Reader Polish

## Summary
- Stage 13 fixed the biggest workflow-access gaps by surfacing `New`, surfacing `Search`, and moving Reader into a focused split-view layout.
- The next highest-leverage UX gap is density and contextual usefulness: too much persistent chrome still sits above or around the working surface, and the Reader context column is present but not yet maximally informative.
- This slice should move the product closer to the original Recall benchmark for information density and glanceability without reopening storage, routing, or AI scope.

## Goals
- Reduce persistent shell and hero chrome so Recall and Reader start doing useful work sooner.
- Make the Reader context panel more glanceable and useful without sacrificing the focused reading surface.
- Tighten mobile and narrower-width fallbacks so context remains reachable without crowding the document.

## Implementation
- Shell density:
  - audit where the header, hero, metrics, and stage tabs can compact or collapse once users are past the first-run/onboarding state
  - keep Recall shell identity intact while removing repeated explanatory copy that no longer helps active workflows
- Reader context:
  - improve the contextual panel so `Source` and `Notes` expose more useful at-a-glance information before extra clicks
  - preserve Stage 13's split-view structure and adjacent context model rather than reverting to stacked support cards
- Narrower layouts:
  - refine how context and controls stack, collapse, or drawerize below desktop widths
  - keep source reopen, note access, and settings reachable without breaking reading continuity

## Constraints
- Preserve local-first parsing, storage, search, settings, progress, deterministic reflow, speech behavior, routes, note anchors, and browser-companion handoff.
- Do not reopen deferred scope by default:
  - local TTS
  - OCR for scanned PDFs
  - cloud sync/collaboration
  - chat/Q&A
  - new AI surfaces beyond existing `Simplify` and `Summary`
- Favor frontend-first implementation and targeted validation before broad reruns.

## Test Plan
- Frontend tests:
  - compact/denser shell states still preserve stage navigation and deep-link handoff behavior
  - Reader context remains usable in desktop and narrower-width layouts
  - source/note actions remain reachable after density reductions
- Validation:
  - `frontend npm test -- --run`
  - `frontend npm run lint`
  - `frontend npm run build`
  - backend or extension reruns only if those codepaths actually change
- Visual/manual checks:
  - confirm the document and primary work panels begin higher on the page than they do after Stage 13
  - confirm the context panel communicates more useful state without requiring expansion-hunting
