# Stage 950 - Study Hints, Explanations, And Timed Sessions After Stage 949

## Status

Completed.

## Intent

Add deterministic local hints/explanations and optional per-question timers to Study review sessions without changing FSRS scheduling, Reader generated outputs, Home's source-card model, or the repo's no-general-chat policy.

## Scope

- Add optional manual/generated Study support payloads in `scheduling_state_json` and expose the resolved payload on serialized Study cards.
- Extend manual Study create/edit APIs and UI with compact optional Hint and Explanation fields for all seven local card types.
- Extend deterministic generated Study cards with source-grounded support payloads and generation flags for including hints/explanations.
- Add active Review hint reveal, explanation display after attempt/reveal, and per-session timer controls for `Review filtered`.
- Persist timed-out attempts with timer metadata in `response_json` without rating or mutating FSRS until the existing rating row is used.
- Extend the session recap with timed-out and hint-used counts.
- Preserve Stage 946/947 generation controls, Stage 948/949 attempts/recap, seven-type manual cards, Study filters/progress dashboards, Source overview memory/review, Home review signals, Reader, Notebook, Graph, Add Content, cleanup hygiene, and `notesSidebarVisible: false`.

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

- Backend pytest for support payload serialization/search, manual create/edit preservation, generated include flags, and timed-out attempt invariants.
- Frontend App tests for generation support toggles, manual support fields, Review hint/explanation display, timed-out attempt persistence, linked rating, and recap counts.
- Regression checks for Study generation/attempt/card-management flows, frontend build, backend API suite, cleanup dry-run, and `git diff --check`.

## Validation Results

- Backend support/timer coverage passed: `wsl.exe -d Ubuntu -- bash -lc 'cd /home/fa507/dev/accessible_reader/backend && .venv/bin/pytest tests/test_api.py -k "study_support_payloads_generation_and_timed_attempts or study_answer_attempts_grade_locally_and_link_reviews or study_generation_controls_scope_types_and_payloads" -q'` -> 3 passed.
- Full backend API regression passed: `wsl.exe -d Ubuntu -- bash -lc 'cd /home/fa507/dev/accessible_reader/backend && .venv/bin/pytest tests/test_api.py -q'` -> 76 passed.
- Focused frontend Study support/timer coverage passed: `wsl.exe -d Ubuntu -- bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm test -- --run src/App.test.tsx -t "Study quiz generation controls|Study manual support fields|Study timed review expiry|Study Review persists typed attempts"'` -> 4 passed.
- Full frontend app regression passed: `wsl.exe -d Ubuntu -- bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm test -- --run src/App.test.tsx'` -> 146 passed.
- Stage 34/37 component regressions passed: `wsl.exe -d Ubuntu -- bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm test -- --run src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx'` -> 22 passed, 20 skipped.
- Frontend production build passed: `wsl.exe -d Ubuntu -- bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm run build'` -> passed with the existing Vite chunk-size warning.
- Cleanup dry-run stayed clean: `wsl.exe -d Ubuntu -- bash -lc 'cd /home/fa507/dev/accessible_reader && node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=http://127.0.0.1:8000'` -> `matchedCount: 0`.
- Diff hygiene passed: `wsl.exe -d Ubuntu -- bash -lc 'cd /home/fa507/dev/accessible_reader && git diff --check'`.
