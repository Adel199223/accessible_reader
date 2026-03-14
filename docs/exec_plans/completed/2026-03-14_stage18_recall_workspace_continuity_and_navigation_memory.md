# ExecPlan: Stage 18 Recall Workspace Continuity and Navigation Memory

## Summary
- After the Stage 13 through 16 UX passes, the largest remaining friction is continuity rather than density.
- Recall now looks and reads much closer to the right product, but it still forgets too much local context when the user:
  - jumps from Recall into Reader
  - opens a destination from global search
  - returns to a section after a handoff
- The next highest-leverage slice is to make Recall behave more like one persistent workspace with a remembered working set.

## Goals
- Preserve section-specific browse and detail context across Reader handoff, search landings, and section switches.
- Make search and reopen flows land in the right section with the right item focused, without discarding the user’s surrounding working context.
- Improve the feeling of "return to where I was" across Library, Notes, Graph, Study, and Reader while keeping existing routes and local-first contracts stable.

## Implementation
- Shared workspace continuity state:
  - lift or persist the per-section state that currently lives only inside `RecallWorkspace`
  - define explicit continuity state for:
    - Library filter and selected document
    - Notes selected document, note search query, and selected note
    - Graph selected node
    - Study filter and targeted active card
- Handoff continuity:
  - preserve originating Recall context when opening Reader from Library, Notes, Graph, Study, and global search
  - when returning from Reader or switching back to Recall, restore the prior section and its focused item instead of reconstructing a generic default view
- Search landings:
  - keep the current `/reader` deep-link contract unchanged
  - make workspace search result actions land into the correct section/detail state while preserving surrounding section memory where possible
  - keep `Open in Reader` actions anchored and stable for note- and evidence-backed results
- Architecture:
  - prefer a bounded frontend state-model change before adding route or backend complexity
  - if needed, introduce a shared workspace session model in the shell rather than letting each section rebuild its own transient state from scratch

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
  - preserve Library filter and selected document across Reader handoff and return
  - preserve Notes document selection, note search, and selected note across Reader handoff and return
  - preserve Graph selected node and Study targeted card across Reader handoff and return
  - verify global search opens the intended section/detail state without clobbering unrelated section memory
  - verify `/reader` deep links and anchored note/card reopen still behave the same
- Validation:
  - `frontend npm test -- --run`
  - `frontend npm run lint`
  - `frontend npm run build`
  - rerun the repo-owned real Edge search and handoff smoke coverage after the continuity change lands

## Notes
- This is a UX/workflow correction slice, not a feature-expansion slice.
- Success means the workspace feels more like one connected Recall session, not just a collection of dense screens.

## Closeout
- Completed on 2026-03-14.
- Delivered:
  - app-level Recall continuity state for Library, Notes, Graph, and Study so section context survives Reader route unmounts
  - continuity-preserving handoffs from Notes, Graph, Study, and search-backed landings into Reader and back
  - targeted frontend regression coverage for Library, Notes, Graph, Study, and global-search continuity
  - a repo-owned real Edge workspace-continuity smoke harness that now validates note/detail restoration plus Library filter restoration after anchored Reader reopen
- Validation:
  - `frontend npm test -- --run`
  - `frontend npm run lint`
  - `frontend npm run build`
  - real Edge smoke: `scripts/playwright/stage18_workspace_continuity_edge.mjs`
