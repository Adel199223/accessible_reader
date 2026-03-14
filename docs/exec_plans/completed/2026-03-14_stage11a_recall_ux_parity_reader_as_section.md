# ExecPlan: Recall UX Parity and Reader-as-Section

## Summary
- Pause Stage 11 feature expansion and first align the frontend with the approved product direction: Reader must behave like a Recall section, not a sibling app shell.
- Keep `/recall` and `/reader?document=&sentenceStart=&sentenceEnd=` stable while presenting one unified Recall workspace UX.
- Use the current in-repo Recall interface as the visual and structural source of truth.

## Public Interfaces
- Keep existing route contracts unchanged.
- Replace the visible top-level `Recall | Reader` split with one unified workspace section row:
  - `Library`
  - `Graph`
  - `Study`
  - `Notes`
  - `Reader`
- Keep backend APIs unchanged in this slice.

## Implementation Changes
- Extract a shared shell frame that owns:
  - the product header
  - the main Recall hero
  - the unified workspace section row
- Lift active Recall section state up from `RecallWorkspace` so:
  - `Notes -> Open in Reader` preserves the prior Recall section
  - returning from Reader does not drop back to `Library` accidentally
- Remove the extra Reader hero and keep only Reader-specific content:
  - import/library rail
  - reading view controls
  - transport
  - settings access
  - note capture
  - anchored reopen and outage handling
- Keep Reader reading behavior unchanged while recomposing it inside the shared Recall shell.

## Test Plan
- Frontend:
  - route parsing/building still preserves `/reader` deep links and anchor params
  - unified top section tabs switch between Recall sections and Reader correctly
  - `Open in Reader` from Notes/browser handoff preserves the anchored passage
  - returning from Reader restores the prior Recall section
  - Reader empty, unavailable, note-capture, and active-reading states still render correctly
- Validation:
  - frontend `npm test -- --run`
  - frontend `npm run lint`
  - frontend `npm run build`
  - backend `pytest`
  - backend app import/title check
  - extension `npm test -- --run`
  - extension `npm run build`
  - rerun the real Edge debug-extension harness

## Assumptions
- Reader remains a route for compatibility, but visually behaves as a Recall section.
- Edge remains the primary browser target; no extra WSL Chromium install is required for this pass.
- Stage 11 remains paused until this UX parity slice is complete.

## Progress
- Implemented:
  - shared `RecallShellFrame` now owns the Recall header, hero, and the unified `Library | Graph | Study | Notes | Reader` section row
  - `RecallWorkspace` now receives lifted section state from `App`, so returning from Reader preserves the prior Recall section
  - `ReaderWorkspace` now reports Recall-native hero state upward instead of rendering a competing hero block
  - no-document Reader onboarding keeps `Settings` reachable through a compact toolbar rather than falling back to old standalone shell chrome
  - frontend route coverage now explicitly checks that browser-back from Reader returns to the previously active Recall section
- Validation status:
  - frontend `npm test -- --run`, `npm run lint`, and `npm run build` are green
  - backend `pytest` and app import check are green
  - extension `npm test -- --run`, `npm run build`, and `npm run build:debug` are green
  - `python-docx` is available in `backend/.venv`
  - Windows Edge and Chrome are installed
  - the repo-owned real Edge debug-extension harness is green after the shell unification

## Closeout
- Reader-as-section parity is complete and Stage 11 can resume as the only active roadmap milestone.
- The current product truth is now stable in code and docs: Recall is the shell, Reader is a section, and `/reader` remains a compatibility route for note and browser handoff.
