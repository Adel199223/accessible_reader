# Stage 949 - Post-Stage-948 Study Attempt Memory Audit

## Status

Completed.

## Intent

Audit that Study attempt memory and session recap work locally while preserving Stage 946/947 generation controls, Stage 944/945 typed manual questions, and broader Recall regression surfaces.

## Scope

- Confirm attempts persist before rating and never mutate FSRS scheduling on their own.
- Confirm typed correctness is deterministic for multiple choice, true/false, fill-in-the-blank, short answer, matching, and ordering, and flashcards record neutral attempts.
- Confirm rating can link an attempt while no-attempt rating remains compatible.
- Confirm Study progress exposes attempt accuracy and recent attempt context globally and source-scoped.
- Confirm active Review and `Review filtered` keep queue behavior stable and show a compact recap at completion.
- Retain Home review discovery, Source overview memory/review/search, Reader, Notebook, Graph, Add Content, backend graph/notes/study contracts, cleanup dry-run, and `notesSidebarVisible: false`.

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
- retained `studyMemoryProgressPanelVisible`
- retained cleanup dry-run `matchedCount: 0`
- retained `notesSidebarVisible: false`

## Validation Plan

- Run Stage 949 audit after Stage 948 implementation passes.
- Run targeted and broad backend/frontend checks, cleanup dry-run, and `git diff --check`.
- Update roadmap and assistant anchors after validation records Stage 949 as the completed audit gate.

## Validation Results

- Stage 948 implementation is complete and validated.
- Backend attempt storage/API/progress checks passed, including all seven supported Study card types, no-scheduling-before-rating, review-event attempt linking, and source-scoped attempt progress.
- Frontend Study Review checks passed for typed attempt persistence, correctness feedback, attempt-linked rating, filtered review session recap, and retained typed-card interaction controls.
- Regression checks passed for the full backend API suite, full `src/App.test.tsx`, Stage 34/37 component coverage, frontend production build, cleanup dry-run `matchedCount: 0`, and `git diff --check`.
