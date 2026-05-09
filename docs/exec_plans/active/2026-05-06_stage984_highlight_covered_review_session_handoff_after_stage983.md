# Stage 984 - Highlight-Covered Review Session Handoff

## Status

Completed on May 6, 2026, after completed Stage 982/983 queue-scoped highlight review.

## Intent

Turn Study-covered highlights from passive review rows into a direct local recall session. Stage 982 made the highlight review inbox follow Home Reading queue scope, reading state, and learning filters. Stage 984 should let users start reviewing the Study cards that already cover the visible highlight-review scope, without changing uncovered-note promotion, Reader outputs, FSRS scheduling, or cloud/chat surfaces.

Recall's current public direction emphasizes saved knowledge, notes, review, and personal recall workflows. This slice keeps that direction local-first by linking saved highlights/source notes to existing Study review sessions.

## Scope

- Extend `GET /api/recall/library/highlight-review-inbox` with derived reviewable covered Study card metadata:
  - `HighlightReviewInboxSummary.reviewable_covered_items`
  - `HighlightReviewInboxResponse.reviewable_study_card_ids`
- Count only non-deleted Study cards whose current derived status is `new` or `due` as reviewable.
- Preserve all existing inbox filters:
  - built-in Home scope
  - custom collection scope
  - source overview scope
  - `reading_state`
  - `learning_filter`
  - selected highlight review state
  - filter-before-limit behavior
- Add a compact `Review covered highlights` action to Home and Source highlight review panels when the active inbox scope has reviewable covered cards.
- Start the existing Study review session from those card ids:
  - Home/custom collection handoffs preserve queue scope, collection id, reading state, learning filter, and highlight review state in the session filter snapshot.
  - Source overview handoffs pass `source_document_id` and remain source-scoped.
  - The Study tab opens on the first eligible card in the session.
- Preserve existing row actions:
  - covered rows still open the individual Study card
  - uncovered rows still use the Notebook Study promotion seam
  - sentence highlights still open anchored Reader
  - source notes still open Notebook/source context
  - reviewed/dismissed/restore controls remain recoverable

## Out Of Scope

- No bulk highlight-to-Study generation or auto-promotion.
- No new card generation, AI note generation, chat/API/MCP, cloud sync, notifications, local TTS, shared challenges, or extension capture.
- No generated Reader-output changes.
- No FSRS scheduling changes; existing Study review/rating flows remain the only scheduling writer.
- No deletion of user notes; dismissed notes remain recoverable.

## Public APIs / Types

- `HighlightReviewInboxSummary` gains `reviewable_covered_items`.
- `HighlightReviewInboxResponse` gains `reviewable_study_card_ids`.
- Frontend API/types/OpenAPI contracts gain the same fields.
- No new endpoint is introduced; the frontend reuses `POST /api/recall/study/sessions`.

## Validation Plan

- Backend: derived reviewable covered Study card ids include non-deleted `new`/`due` cards, exclude `scheduled`, `unscheduled`, and soft-deleted cards, compose with built-in scope/custom collection/source scope, reading state, learning filter, and filter-before-limit behavior.
- Frontend: Home highlight review shows the session handoff only when reviewable covered cards exist, starts a queue-scoped Study session with the expected filter snapshot, preserves row-level Open/Create Study behavior, and keeps Source overview source-scoped.
- Browser evidence: Stage 984 Playwright validates Home queue-scoped `Review covered highlights`, source-scoped `Review covered highlights`, covered-row handoff preservation, generated Reader-output freeze, and cleanup dry-run `matchedCount: 0`.
- Regression gate: Stage 985 reruns Stage 984 evidence plus Stage 982/980/978/976/975 regressions, backend `tests/test_api.py`, frontend typecheck, focused `App.test.tsx`, full Vitest, build, cleanup dry-run, contracts, and `git diff --check`.

## Assumptions

- Reviewable means the covered Study card status is currently `new` or `due`; scheduled and unscheduled cards remain browseable through existing Study surfaces.
- The session can use the same default Study settings snapshot as other review launches.
- If the active inbox has more reviewable covered cards than the current session limit, the frontend starts the first session-sized queue from the ordered covered-card list.

## Result

- Added `reviewable_covered_items` and `reviewable_study_card_ids` to the highlight review inbox response, derived from non-deleted note-grounded Study cards whose current local status is `new` or `due`.
- Added `Review covered highlights` to Home/custom collection and Source overview highlight review panels, reusing the existing Study session endpoint with queue/source filter snapshots.
- Made the session launcher source-fetch covered card records when needed, so large local libraries are not limited by the first 100 global Study cards.
- Preserved covered-row `Open Study card`, uncovered-row Notebook Study promotion, Reader/Notebook handoffs, review-state controls, generated Reader outputs, and FSRS ownership.

## Validation

- `backend/.venv/bin/python -m pytest tests/test_api.py -q` - 94 passed.
- `npm exec tsc -- -b --pretty false` - passed.
- `npm test -- --run src/App.test.tsx --reporter=dot` - 170 passed.
- `npm test -- --run --reporter=dot` - 267 passed, 20 skipped.
- `npm run build` - passed with the existing Vite chunk-size warning.
- Contract inventory, OpenAPI snapshot, generated OpenAPI reference, generated type mapping, and generated type adoption checks - passed.
- `node scripts/playwright/stage984_highlight_covered_review_session_handoff_after_stage983.mjs --base-url=http://127.0.0.1:8014` - passed with every Stage 984 evidence metric true and cleanup dry-run `matchedCount: 0`.
- Stage 982, Stage 980, Stage 978, Stage 976, and Stage 975 Playwright regressions - passed.
- `node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=http://127.0.0.1:8014` - dry-run `matchedCount: 0`.
- `git diff --check` - passed.
