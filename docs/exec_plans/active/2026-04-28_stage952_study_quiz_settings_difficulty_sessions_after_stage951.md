# Stage 952 - Study Quiz Settings, Difficulty, And Session History After Stage 951

## Status

Completed on 2026-04-28.

## Intent

Make active Study review feel like a deliberate local quiz session by adding saved quiz defaults, question difficulty, visible session progress, and persisted session summaries while preserving FSRS rating semantics and the local-first/no-general-chat policy.

## Scope

- Add local Study settings in `app_settings` under namespace `study`, exposed through `GET /api/recall/study/settings` and `PUT /api/recall/study/settings`.
- Add `question_difficulty` for manual, generated, and legacy Study cards with deterministic fallback by question type.
- Extend Study generation with an optional difficulty filter while preserving no-body compatibility, typed payload generation, hint/explanation flags, and scoped pruning protections.
- Add a local `study_review_sessions` store plus start/complete endpoints so active Review uses a server-backed session id.
- Extend Study progress with recent session summaries and difficulty accuracy rows without changing review-event-based scheduling, streaks, memory stages, or memory progress.
- Add compact frontend controls for quiz defaults, difficulty filtering, difficulty badges, generated-card difficulty, manual-card difficulty, active session progress, and persisted recap summaries.
- Preserve Stage 946/947 generation controls, Stage 948/949 attempts/recap, Stage 950/951 hints/explanations/timers, seven-type manual cards, Study filters/progress dashboards, Source overview memory/review, Home review signals, Reader, Notebook, Graph, Add Content, cleanup hygiene, and `notesSidebarVisible: false`.

## Evidence Metrics

- `studyQuizSettingsDefaultsPersist`
- `studyQuestionDifficultySerializes`
- `studyManualDifficultyCreateEdit`
- `studyGeneratedDifficultyFilterPreservesScope`
- `studyDifficultyFilterComposes`
- `studyReviewFilteredHonorsSessionLimit`
- `studyReviewSessionStartsServerBacked`
- `studyReviewProgressHeaderVisible`
- `studyReviewSessionCompletesWithSummary`
- `studyProgressIncludesRecentSessionsAndDifficultyAccuracy`
- retained `studyReviewHintVisibleBeforeReveal`
- retained `studyTimedReviewLinksAttemptOnRating`
- retained cleanup dry-run `matchedCount: 0`
- retained `notesSidebarVisible: false`

## Validation Plan

- Backend pytest for Study settings validation/persistence, difficulty serialization/fallback, manual and generated difficulty flows, session start/complete, progress session summaries, and difficulty accuracy.
- Frontend App tests for quiz settings controls, difficulty filter composition, manual difficulty round trip, generation difficulty request body, Review filtered session limit, progress header, and session recap persistence.
- Regression checks for existing Study generation, attempts, hints/timers, manual card management, source-scoped Study, Home/source-memory surfaces, frontend build, backend API suite, cleanup dry-run, and `git diff --check`.

## Implementation Summary

- Added local Study settings under the `study` namespace in `app_settings`, exposed through `GET /api/recall/study/settings` and `PUT /api/recall/study/settings`, with validated defaults for timer, session limit, and difficulty filter.
- Added serialized Study `question_difficulty` for manual cards, generated cards, and legacy cards with deterministic type-based fallback.
- Extended manual create/edit flows, generated-card sync, generation request handling, generation pruning, search/serialization, and portability identity to preserve question difficulty without a schema migration.
- Added additive `study_review_sessions` storage plus start/complete endpoints so `Review filtered` uses a server-backed `session_id` and persists recap summaries.
- Extended Study progress with recent session summaries and difficulty accuracy rows while keeping review-event-based scheduling, streaks, stages, and memory progress unchanged.
- Added compact frontend quiz settings, difficulty badges/filters, manual and generated difficulty controls, session-limited `Review filtered`, `Question X / Y` progress, and recap duration/difficulty mix.

## Validation Evidence

- `wsl.exe -d Ubuntu -- bash -lc 'cd /home/fa507/dev/accessible_reader/backend && .venv/bin/python -m pytest tests/test_api.py -k "study_quiz_settings_difficulty_and_sessions or study_support_payloads_generation_and_timed_attempts or study_generation_controls_scope_types_and_payloads" -q'` - 3 passed, 74 deselected.
- `wsl.exe -d Ubuntu -- bash -lc 'cd /home/fa507/dev/accessible_reader/backend && .venv/bin/python -m pytest tests/test_api.py -q'` - 77 passed.
- `wsl.exe -d Ubuntu -- bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm exec tsc -- -b --pretty false'` - passed.
- `wsl.exe -d Ubuntu -- bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm test -- -t "Study quiz settings|Study quiz generation controls|Study manual support fields|Study timed review"'` - 4 passed, 143 skipped.
- `wsl.exe -d Ubuntu -- bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/App.test.tsx'` - 147 passed.
- `wsl.exe -d Ubuntu -- bash -lc 'cd /home/fa507/dev/accessible_reader && node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=http://127.0.0.1:8000'` - dry-run `matchedCount: 0`.
- `wsl.exe -d Ubuntu -- bash -lc 'cd /home/fa507/dev/accessible_reader && git diff --check'` - passed.
