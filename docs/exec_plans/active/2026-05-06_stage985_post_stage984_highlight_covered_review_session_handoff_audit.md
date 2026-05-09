# Stage 985 - Post-Stage-984 Highlight-Covered Review Session Audit

## Status

Completed on May 6, 2026, after Stage 984 implementation.

## Intent

Audit that Study-covered highlights in Home, custom collection, and Source overview review inboxes can become a real local Study review session while existing highlight review, Reader, Notebook, and Study contracts stay intact.

## Scope

- Confirm `GET /api/recall/library/highlight-review-inbox` returns reviewable covered Study card ids for the active scope and filters.
- Confirm scheduled, unscheduled, and soft-deleted Study cards do not enter the immediate covered-highlight review session.
- Confirm Home built-in scope and custom collection highlight review can start a multi-source Study session with queue-scope metadata in the session filter snapshot.
- Confirm Source overview starts a source-scoped Study session.
- Confirm covered row `Open Study card` still opens the individual Study card.
- Confirm uncovered row `Create Study card` still opens the Notebook promotion seam.
- Confirm reviewed, dismissed, restored, Reader, and Notebook row handoffs remain intact.
- Preserve Stage 982 queue-scoped highlight review, Stage 980 learning-gap queue filters, Stage 978 source learning gaps, Stage 976 review state/Study coverage, Stage 975 reading queue/highlight actions, generated Reader-output freeze, and cleanup dry-run `matchedCount: 0`.

## Evidence Metrics

- `highlightCoveredReviewSessionActionVisible: true`
- `highlightCoveredReviewSessionStartsQueueScoped: true`
- `highlightCoveredReviewSessionSnapshotPreservesQueueFilters: true`
- `sourceHighlightCoveredReviewSessionStartsSourceScoped: true`
- `highlightCoveredScheduledCardsExcluded: true`
- `highlightCoveredRowOpenStudyStillWorks: true`
- `highlightUncoveredCreateStudyStillUsesNotebookPromotion: true`
- `readerGeneratedOutputsFrozen: true`
- `cleanupUtilityDryRunMatchedAfterStage984: 0`

## Validation Plan

- Backend `tests/test_api.py`.
- Frontend typecheck.
- Focused frontend highlight review/Study session tests.
- Full `App.test.tsx`.
- Full Vitest.
- Frontend build.
- Contract inventory, OpenAPI snapshot, generated OpenAPI reference, generated type mapping, and generated type adoption checks.
- Stage 984 Playwright evidence.
- Stage 982, Stage 980, Stage 978, Stage 976, and Stage 975 Playwright regressions.
- Cleanup utility dry-run.
- In-app browser smoke on the Recall Library surface.
- `git diff --check`.

## Result

- Stage 984 evidence confirmed Home/custom collection covered-highlight review starts the existing Study session flow from reviewable covered card ids while preserving the active queue scope in the session filter snapshot.
- Source overview evidence confirmed `Review covered highlights` stays source-scoped and starts a session with `source_document_id`.
- Covered rows still open individual Study cards, and uncovered rows still open the Notebook Study promotion seam.
- Backend and frontend tests confirmed reviewable covered cards are derived from non-deleted `new`/`due` Study cards and exclude deferred cards.
- The large-library browser run exposed and fixed a capped global Study-card read edge by fetching covered rows and source-scoped cards before starting the session.

## Validation

- `backend/.venv/bin/python -m pytest tests/test_api.py -q` - 94 passed.
- `npm exec tsc -- -b --pretty false` - passed.
- `npm test -- --run src/App.test.tsx --reporter=dot` - 170 passed.
- `npm test -- --run src/api.test.ts src/components/RecallWorkspace.stage37.test.tsx --reporter=dot` - 26 passed, 20 skipped.
- `npm test -- --run --reporter=dot` - 267 passed, 20 skipped.
- `npm run build` - passed with the existing Vite chunk-size warning.
- Contract checks for API inventory, OpenAPI snapshot, generated OpenAPI reference, generated type mapping, and generated type adoptions - passed.
- Stage 984 Playwright evidence - passed with `cleanupUtilityDryRunMatchedAfterStage984: 0`.
- Stage 982, Stage 980, Stage 978, Stage 976, and Stage 975 Playwright regressions - passed.
- Cleanup utility dry-run returned `matchedCount: 0`.
- `git diff --check` - passed.
- In-app browser smoke through the MCP browser tool was attempted, but the target browser context was already closed; the Stage 984 and regression Playwright browser evidence covered the product surface.
