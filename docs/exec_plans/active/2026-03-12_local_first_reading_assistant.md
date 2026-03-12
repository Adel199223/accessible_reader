# ExecPlan: Local-First Reading Assistant

## Purpose
- Build a standalone localhost web app for accessible reading.
- Keep local processing primary and AI optional.

## Scope
- In scope:
  - frontend and backend scaffold
  - local import, parsing, storage, search, reading progress, and settings
  - browser-native read aloud with sentence highlighting
  - OpenAI-backed `Simplify` and `Summary`
- Out of scope:
  - auth
  - cloud sync
  - OCR
  - local TTS
  - document Q&A

## Assumptions
- Edge on Windows 11 is the primary target browser.
- Local TTS is explicitly deferred.
- AI is opt-in and requires a user-provided API key outside the browser.

## Milestones
1. Scaffold docs, backend, storage, and import pipeline.
2. Ship local reading views with speech and sentence highlighting.
3. Add cached AI transforms and polish.

## Detailed Steps
1. Create roadmap docs and continuity anchor.
2. Add FastAPI app with SQLite storage, parsers, reflow service, and transform provider seam.
3. Replace Vite starter UI with library, import, reader, settings, and speech controls.
4. Add tests for parsing, reflow, API flows, and sentence segmentation/rendering.
5. Validate the app locally and update the handoff docs.

## Decision Log
- 2026-03-12: Keep the new app in `accessible_reader/` so it stays isolated from the Flutter project while remaining in the same workspace.
- 2026-03-12: Browser-native `speechSynthesis` is the only shipped TTS path in v1.
- 2026-03-12: OpenAI transforms are backend-only and explicitly opt-in.

## Validation
- Backend: `pytest`
- Frontend: `npm test`
- Frontend build: `npm run build`

## Progress
- [x] Milestone one
- [x] Milestone two
- [x] Milestone three

## Surprises and Adjustments
- None yet. Keep future detours logged here.

## Handoff
- The project now has the main localhost app skeleton and primary features.
- Next work should focus on stabilization, manual Edge validation, and deciding whether to split this into its own repository.
