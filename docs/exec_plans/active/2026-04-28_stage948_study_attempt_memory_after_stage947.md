# Stage 948 - Study Attempt Memory After Stage 947

## Status

Completed.

## Intent

Persist deterministic local Study answer attempts and add a compact session recap without changing FSRS scheduling, Reader generated outputs, or Home's source-card-owned discovery model.

## Scope

- Add an additive local `study_answer_attempts` store for typed answer attempts.
- Add `POST /api/recall/study/cards/{card_id}/attempts` to validate and record attempts from existing manual or generated card payloads.
- Link a supplied or latest local attempt to the existing review event when the user rates a card.
- Extend read-only Study progress with global/source-scoped attempt summaries while keeping review counts, rating mix, streaks, memory stages, and memory progress based on existing review events.
- Persist typed attempts from Study Review before rating, show deterministic correctness feedback, and show a compact recap when the visible review queue completes.
- Preserve Stage 946/947 generated quiz controls, Stage 944/945 seven-type manual cards, Study management/filtering/progress flows, Source overview memory/review, Home review signals, Reader, Notebook, Graph, Add Content, cleanup hygiene, and `notesSidebarVisible: false`.

## Evidence Metrics

- `studyAnswerAttemptPersistsBeforeRating`
- `studyTypedAttemptOutcomeCaptured`
- `studyAttemptDoesNotScheduleWithoutRating`
- `studyReviewRatingLinksAttempt`
- `studyProgressShowsAttemptAccuracy`
- `studyRecentReviewsIncludeAttemptOutcome`
- `studyReviewFilteredSessionRecapVisible`
- retained `studyQuizGenerationControlsVisible`
- retained `sourceOverviewGenerateQuestionsAction`
- retained cleanup dry-run `matchedCount: 0`
- retained `notesSidebarVisible: false`

## Validation Plan

- Backend pytest for attempt creation across typed card kinds, flashcard null correctness, no-scheduling-before-rating, rating attempt links, and progress attempt summaries.
- Frontend App tests for typed attempt API calls, correctness feedback, source-scoped attempts, filtered queue advancement, and session recap.
- Targeted broad checks for Study, graph/note/study backend regressions, frontend typecheck/build, cleanup dry-run, and `git diff --check`.

## Validation Results

- `wsl.exe -d Ubuntu -- bash -lc "cd /home/fa507/dev/accessible_reader/backend && .venv/bin/pytest tests/test_api.py -k 'answer_attempts or study_progress_empty_activity_range_and_validation or study_progress_summarizes_review_events' -q"` - 3 passed.
- `wsl.exe -d Ubuntu -- bash -lc "cd /home/fa507/dev/accessible_reader/backend && .venv/bin/pytest tests/test_api.py -q"` - 75 passed.
- `wsl.exe -d Ubuntu -- bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm test -- --run src/App.test.tsx -t 'Study manual choice questions create|Study Review persists typed attempts|Study fill-in-the-blank questions create|Study matching questions create|Study source-scoped ordering questions create|Study short-answer review shows local answer attempt feedback'"` - 6 passed.
- `wsl.exe -d Ubuntu -- bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm test -- --run src/App.test.tsx"` - 144 passed on final full rerun.
- `wsl.exe -d Ubuntu -- bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm test -- --run src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx"` - 22 passed, 20 skipped.
- `wsl.exe -d Ubuntu -- bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"` - passed with the existing Vite chunk-size warning.
- `wsl.exe -d Ubuntu -- bash -lc "cd /home/fa507/dev/accessible_reader && node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=http://127.0.0.1:8000"` - dry-run `matchedCount: 0`.
- `git diff --check` - passed with line-ending warnings only.
