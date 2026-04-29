# Stage 953 - Post-Stage-952 Study Quiz Settings, Difficulty, And Session History Audit

## Status

Completed on 2026-04-28.

## Intent

Audit that Study quiz settings, difficulty, and persisted review sessions work while preserving the completed Stage 946-951 Study generation, attempt, support, and timed-session baselines plus broader Recall regression surfaces.

## Scope

- Confirm Study settings defaults persist and feed new Review sessions without turning timer or session limits into global mandatory behavior.
- Confirm manual, generated, and legacy cards expose deterministic `question_difficulty`, and difficulty filters compose with source, schedule, status, knowledge, review-history, collection, and search filters.
- Confirm Review filtered applies the visible eligible queue, selected difficulty, and session limit, starts a server-backed session, shows session progress, and completes with a persisted recap.
- Confirm attempts and ratings keep their Stage 948/950 semantics, including attempt/session linkage and FSRS updates only from the rating row.
- Confirm Study progress includes recent sessions and difficulty accuracy while review-event fields stay stable.
- Retain Home review discovery, Source overview memory/review/search, Reader, Notebook, Graph, Add Content, backend graph/notes/study contracts, cleanup dry-run, and `notesSidebarVisible: false`.

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

- Run Stage 953 audit after Stage 952 implementation passes.
- Run targeted and broad backend/frontend checks, cleanup dry-run, and `git diff --check`.
- Update roadmap and assistant anchors after validation records Stage 953 as the completed audit gate.

## Audit Evidence

- Backend settings, difficulty, session, attempt-linkage, generated-difficulty, support-payload, and generation-control regression coverage passed with `3 passed, 74 deselected` in the focused API run.
- The full backend API suite passed with `77 passed`.
- Frontend typechecking passed with `npm exec tsc -- -b --pretty false`.
- Focused frontend quiz settings/generation/support/timer tests passed with `4 passed, 143 skipped`, and the full App suite passed with `147 passed`.
- The cleanup audit utility ran dry-run against `http://127.0.0.1:8000` and returned `matchedCount: 0`.
- `git diff --check` passed after the implementation and audit docs were recorded.

## Audit Conclusion

Stage 953 confirms Stage 952 is a local-first, Recall-aligned Study quiz-session layer: saved settings, difficulty, session starts/completions, attempts, timers, hints/explanations, and generation controls compose without changing FSRS semantics or broad Recall regression surfaces. No new product slice is open after this audit gate.
