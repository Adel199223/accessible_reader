# Stage 980 - Learning-Gap Queue Filters

## Status

Completed on May 6, 2026, after completed Stage 978/979 source learning gaps and next actions. Stage 981 audit is complete.

## Intent

Turn the Reading queue into the collection learning triage surface. Stage 978 made per-source learning gaps visible in rows; Stage 980 should let users filter Home and collection queues directly to sources that need highlight review, still have uncovered highlights, already have Study coverage, or have due/new Study prompts.

## Scope

- Add a derived `learning_filter` query to `GET /api/recall/library/reading-queue`.
- Filter backend-side after reading, highlight review, and Study counts are derived, and before the response limit is applied.
- Supported filters:
  - `all`
  - `needs_review`
  - `uncovered`
  - `covered`
  - `study_prompts`
- Add summary counts for the learning filters to the Reading queue response.
- Add compact learning filter controls to Home/custom collection Reading queues that compose with existing scope, collection, and reading-state filters.
- Preserve row-level actions from Stage 978: Continue reading, Review highlights, Study prompts, and Mark complete.

## Out Of Scope

- No bulk highlight-to-Study creation.
- No generated Reader output changes.
- No FSRS scheduling changes; Study ratings remain owned by Review flows.
- No cloud sync, general chat/API/MCP workflows, notifications, local TTS, shared challenges, AI note generation, or extension capture.
- No new mixed global memory-object dashboard.
- No deletion of user notes; dismissed notes remain recoverable through existing review filters.

## Public APIs / Types

- New type: `LibraryReadingQueueLearningFilter`.
- New type: `LibraryReadingQueueLearningSummary`.
- `LibraryReadingQueueResponse` gains `learning_filter` and `learning_summary`.
- `GET /api/recall/library/reading-queue` gains optional `learning_filter`.

## Validation Plan

- Backend: reading queue filters by `needs_review`, `uncovered`, `covered`, and `study_prompts` across built-in scopes and custom collections, with filtering before limit and Study coverage derived from non-deleted note-grounded cards. Completed with focused backend coverage and full `backend/tests/test_api.py`.
- Frontend: Home Reading queue shows learning filters, composes them with collection and reading-state filters, and preserves Review highlights / Study prompts handoffs. Completed with focused Home Reading queue tests and full Vitest.
- Browser evidence: Stage 980 Playwright validates collection Reading queue learning filters, backend filter-before-limit, Review highlights handoff, Study prompts handoff, and cleanup dry-run `matchedCount: 0`.
- Regression gate: Stage 981 reran Stage 980 evidence plus Stage 978, Stage 976, and Stage 975 regressions, backend tests, frontend typecheck/full Vitest/build, cleanup dry-run, contract checks, in-app browser smoke, and `git diff --check`.

## Results

- `GET /api/recall/library/reading-queue` now accepts `learning_filter=all|needs_review|uncovered|covered|study_prompts`, derives `learning_summary`, and applies the learning filter before response limiting.
- Home/custom collection Reading queues now expose compact learning filters that compose with collection scope and reading state while preserving Continue reading, Review highlights, Study prompts, and Mark complete actions.
- Stage 980 browser evidence passed with `homeLearningFilterControlsVisible`, `homeLearningFilterCoveredRowsOnly`, `homeLearningFilterStateComposition`, `homeLearningFilterStudyHandoffWorks`, `readingQueueCoveredFilterBeforeLimit`, `readingQueueLearningSummaryCounts`, `sourceReviewHandoffStillWorks`, and cleanup dry-run `matchedCount: 0`.

## Assumptions

- `needs_review` means unreviewed highlight/source-note rows not already Study-covered.
- `uncovered` means sources with at least one non-dismissed highlight/source note that is not Study-covered.
- `covered` means sources with at least one highlight/source note grounded in a non-deleted Study card.
- `study_prompts` means sources with one or more due/new Study cards.
- Reading-state and learning filters compose with AND semantics.
