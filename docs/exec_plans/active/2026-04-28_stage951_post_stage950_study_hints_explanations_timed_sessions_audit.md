# Stage 951 - Post-Stage-950 Study Hints, Explanations, And Timed Sessions Audit

## Status

Completed.

## Intent

Audit that local Study hints, explanations, and timed review sessions work while preserving the completed Stage 946-949 Study generation and attempt-memory baselines plus broader Recall regression surfaces.

## Scope

- Confirm manual and generated support payloads serialize, search, and survive edit/generate flows.
- Confirm Review shows hints before reveal and explanations after attempt/reveal without changing rating semantics.
- Confirm timed sessions auto-persist timed-out attempts, do not update FSRS alone, and link attempts when the user later rates.
- Confirm recap totals include attempted, correct, skipped/unrated, sources touched, timed out, and hints used.
- Retain Home review discovery, Source overview memory/review/search, Reader, Notebook, Graph, Add Content, backend graph/notes/study contracts, cleanup dry-run, and `notesSidebarVisible: false`.

## Evidence Metrics

- `studyQuestionSupportPayloadSerializes`
- `studyManualHintExplanationCreateEdit`
- `studyGeneratedHintExplanationFlags`
- `studyHintExplanationSearchFindsText`
- `studyReviewHintVisibleBeforeReveal`
- `studyReviewExplanationVisibleAfterAttempt`
- `studyTimedReviewControlsVisible`
- `studyTimedOutAttemptDoesNotSchedule`
- `studyTimedReviewLinksAttemptOnRating`
- `studySessionRecapIncludesTimedAndHintCounts`
- retained `studyQuizGenerationControlsVisible`
- retained `studyReviewFilteredSessionRecapVisible`
- retained cleanup dry-run `matchedCount: 0`
- retained `notesSidebarVisible: false`

## Validation Plan

- Run Stage 951 audit after Stage 950 implementation passes.
- Run targeted and broad backend/frontend checks, cleanup dry-run, and `git diff --check`.
- Update roadmap and assistant anchors after validation records Stage 951 as the completed audit gate.

## Validation Results

- Stage 951 audit passed by broad automated regression: full backend API suite (76 passed), full frontend `App.test.tsx` suite (146 passed), Stage 34/37 component suites (22 passed, 20 skipped), and production build all stayed green.
- Focused Stage 950/951 evidence is covered by backend support/timer tests and frontend support/timer tests: manual support payloads serialize/search/edit, generated include-hints/include-explanations flags work, Review shows hints/explanations, timed-out attempts persist without rating first, later ratings link the attempt, and recap counts include timed-out and hint-used totals.
- Cleanup dry-run remained `matchedCount: 0`.
- `git diff --check` passed.
