# ExecPlan: Stage 19 Recall Current Context Dock and Quick Switching

## Summary
- Stage 18 fixed the underlying continuity problem: Recall now remembers the right section, selection, and detail context across Reader handoff and search landings.
- The next remaining UX gap is visibility and speed, not memory alone.
- Even when the workspace remembers the right state, the shell still does too little to surface the user's current working set and make nearby jumps obvious.
- The next bounded slice is to expose active context and recent work directly in the Recall shell so the product feels faster and more legible without widening backend scope.

## Goals
- Surface the current working context across Recall sections so users can immediately see what document, note, node, or study item they are working with.
- Add low-friction quick switching among recent sources and focused items without forcing a full search or tab-reset loop.
- Keep the product aligned with the original Recall benchmark on workflow clarity and low admin burden while preserving the current local-first contracts.

## Implementation
- Shared current-context dock:
  - add a compact workspace dock below the section tabs inside the shared Recall shell
  - show the current active source and section-specific focus, such as:
    - Library selected document
    - Notes selected note
    - Graph selected node
    - Study active card
    - Reader current document and anchor context when relevant
  - keep direct actions close by, such as reopen in Reader, jump to Notes, jump to Graph, or return to Study
- Recent-work switching:
  - track a bounded recent-work list in shared frontend workspace state
  - include recent documents plus recent note/node/card landings that matter for quick return loops
  - make recent items open the correct section and focused detail state without discarding existing continuity
- Shell and layout:
  - keep `/recall` and `/reader?...` routes stable
  - preserve the existing section row and current Recall-first shell direction
  - prefer a compact, utilitarian dock rather than reopening large hero or banner surfaces
- Architecture:
  - keep this slice frontend-first and session-oriented unless a small local persistence layer materially improves UX
  - reuse the Stage 18 continuity model instead of creating parallel state paths

## Constraints
- Preserve local-first parsing, storage, search, settings, progress, deterministic reflow, speech behavior, note anchors, and browser-companion handoff.
- Keep `/recall` and `/reader?document=...&sentenceStart=...&sentenceEnd=...` stable.
- Do not reopen deferred scope by default:
  - local TTS
  - OCR for scanned PDFs
  - cloud sync/collaboration
  - chat/Q&A
  - new AI surfaces beyond existing `Simplify` and `Summary`

## Test Plan
- Frontend targeted coverage:
  - current-context dock reflects the correct selected document, note, node, or active card
  - recent-work items reopen the correct section/detail state
  - Reader handoff and back-navigation keep the dock and recent-work state coherent
  - global search landings update recent-work without clobbering unrelated section continuity
- Validation:
  - `frontend npm test -- --run`
  - `frontend npm run lint`
  - `frontend npm run build`
  - rerun the repo-owned real Edge workspace continuity smoke after the dock lands
  - add a repo-owned real Edge smoke for current-context and quick-switch behavior if the UI change is substantial enough

## Notes
- This slice should improve speed of orientation and return, not widen the app into a new feature tier.
- The user-provided product brief and the original Recall benchmark both point toward lower navigation overhead and better contextual resurfacing as the right next UX correction.

## Closeout
- Completed on 2026-03-14.
- Delivered:
  - a shared shell-level current-context dock that now surfaces the active source, note, graph node, study card, or Reader focus directly below the workspace section row
  - bounded recent-work switching in shared frontend state, with quick return into the correct section/detail target
  - section-specific context actions for Library, Notes, Graph, Study, and Reader without widening backend scope
  - targeted frontend regression coverage for dock context, recent-work switching, and continuity-aware search/Reader loops
  - a repo-owned real Edge current-context smoke harness covering note capture, dock visibility, Reader handoff, and recent-work return
- Validation:
  - `frontend npm test -- --run`
  - `frontend npm run lint`
  - `frontend npm run build`
  - real Edge smoke: `scripts/playwright/stage19_current_context_edge.mjs`
