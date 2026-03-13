# ExecPlan: Reopen Flow Stabilization

## Purpose
- Close the roadmap gap between saved reading progress and true reopen support.
- Make the app reopen the last document and reading mode after a reload without introducing server-side scope expansion.

## Scope
- In scope:
  - local-first persistence of the last open document and active mode
  - restore logic on app startup and graceful fallback when the saved document is missing
  - targeted frontend tests for reopen behavior
  - roadmap continuity updates if the user-facing behavior changes
- Out of scope:
  - backend schema or API changes unless frontend-only persistence proves insufficient
  - new speech or AI features
  - push, release, or deployment work

## Assumptions
- Local browser storage is acceptable for reopen state because the product is localhost-first and single-user.
- Reopen support should restore the user's last reading context, not just default to the most recently updated document.
- If a saved document is unavailable, the app should fall back cleanly to the first available document.

## Milestones
1. Confirm the reopen gap and define the minimum local-first persistence model.
2. Implement reopen restore behavior and targeted tests.
3. Validate reload behavior and update continuity docs if needed.

## Detailed Steps
1. Inspect the current startup and document-selection flow in `frontend/src/App.tsx`.
2. Add a small frontend session helper for the active document and mode.
3. Restore that session on startup and persist it as the reader context changes.
4. Add focused tests for restore and fallback behavior.
5. Run targeted frontend validation and confirm the behavior in the live app.

## Decision Log
- 2026-03-12: Keep reopen persistence in the frontend first to avoid unnecessary backend API expansion.

## Validation
- Frontend: `npm test`, `npm run lint`, `npm run build`
- Live app: reload the app and confirm the last open document and mode return as expected

## Progress
- [x] Milestone one
- [x] Milestone two
- [x] Milestone three

## Surprises and Adjustments
- 2026-03-12: Live Edge validation was done by loading a seeded storage state into a clean temporary backend data set so reopen behavior could be confirmed without relying on the shared browser profile.

## Handoff
- This pass closed the reopen gap by restoring the last open document and mode from local storage and falling back cleanly when the saved document is unavailable.
- Next work should continue interactive Edge control validation, search interaction checks, and long-document polish from the roadmap.
