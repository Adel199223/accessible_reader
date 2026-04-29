# Stage 956 - Reader-Led Source Quiz Launch After Stage 955

## Status

Planned on 2026-04-28.

## Intent

Connect the completed local Study quiz engine back into the saved-source reading loop. Reader and Source overview should offer a direct source-scoped Study launch that starts review when eligible cards exist, opens Questions when only browse/manage cards exist, and opens the source-scoped generator when no cards exist.

## Scope

- Add a frontend-only source Study launch intent for `review`, `questions`, `generate`, and `start-session`.
- Make Reader source-strip Study memory and the short-document completion strip use a schedule-aware Study CTA.
- Make Source overview review actions share the same source-scoped launch behavior.
- Let source-launched sessions apply saved Study settings and fall back to Questions if no eligible queue exists.
- Keep existing Study generation, attempts, hints, timers, settings, sessions, habit goals, FSRS rating semantics, Reader generated outputs, Home discovery, Notebook, Graph, Add Content, and cleanup hygiene intact.

## Implementation Notes

- No backend schema or endpoint changes are planned.
- Reader can derive the active source quiz CTA from existing `fetchRecallStudyCards("all")` data and source-scoped `fetchRecallStudyProgress`.
- Study should consume a focus-request token once for `start-session` so route or state refreshes do not create duplicate sessions.
- A Reader `Generate questions` handoff opens source-scoped generation controls; it does not run generation blindly.

## Validation Plan

- Add focused frontend coverage for Reader source Study CTA states, short-document completion CTA, start-session handoff, generate handoff, and Source overview launch behavior.
- Run targeted frontend tests, frontend typecheck, full `frontend/src/App.test.tsx`, full backend API suite, cleanup dry-run, and `git diff --check`.
- Capture Stage 956 Playwright evidence if the implementation reaches browser-validation readiness in this pass.
