# Stage 942 - Study Fill-In-The-Blank Answer Attempts After Stage 941

## Status

Completed.

## Intent

Extend the Stage 940 typed-question foundation with source-owned manual `fill_in_blank` cards and local answer-attempt feedback for `short_answer` and fill-in-the-blank Review, while keeping FSRS scheduling tied only to the existing rating row.

## Scope

- Add manual `fill_in_blank` Study card type alongside `short_answer`, `flashcard`, `multiple_choice`, and `true_false`.
- Store fill-in-the-blank payloads in existing `scheduling_state_json.manual_question_payload`; no schema migration.
- Keep `answer` as canonical correct-answer text for search, previews, edit/delete, Review reveal, portability, and generated-card sync preservation.
- Validate fill-in-the-blank templates as trimmed text with exactly one `{{blank}}` marker, 2-6 unique trimmed choices, and one correct choice.
- Add fill-in-the-blank controls to `New question`, row edit, Study Questions rows/search, and active Review.
- Add local-only short-answer attempt feedback before reveal.
- Keep Home discovery-only and source-card-owned; do not add CSV import, AI generation, hints, explanations, timed questions, shared challenges, notifications, Reader output changes, or persisted answer-attempt analytics.

## Evidence Metrics

- `studyFillBlankCreateDialogControlsVisible`
- `studyFillBlankCreatesVisibleQuestion`
- `studyFillBlankSearchFindsTemplateAndChoice`
- `studyShortAnswerAttemptFeedbackVisible`
- `studyFillBlankReviewSelectionState`
- `studyFillBlankEditPreservesPayload`
- `studyFillBlankSurvivesGenerate`
- retained Stage 941 choice metrics
- retained edit/delete/scheduling/progress/subset/review-history/Home review/source overview metrics
- cleanup dry-run `matchedCount: 0`
- `notesSidebarVisible: false`

## Validation Plan

- Backend pytest for fill-in-the-blank create/update validation, missing-source rejection, template marker rules, choice uniqueness, canonical answer normalization, serialization, schedule/review/delete compatibility, generated-sync preservation, source-scoped lists, progress/stage counts, and no schema migration.
- Frontend App tests for global and source-scoped fill-in-the-blank creation, edit payload preservation, search by blank template and distractor text, short-answer local attempt feedback, fill-in-the-blank typed Review selection, rating after attempt, filtered Review queue compatibility, and retained Stage 940 choice behavior.
- Add `scripts/playwright/stage942_study_fill_in_blank_answer_attempts_after_stage941.mjs`.
- Add `scripts/playwright/stage943_post_stage942_study_fill_in_blank_answer_attempts_audit.mjs`.
- Run targeted Vitest, full `App.test.tsx`, frontend build, backend graph/notes/study pytest, `node --check`, Stage 942/943 Playwright, cleanup dry-run, and `git diff --check`.

## Validation Results

- Backend targeted pytest passed: `cd backend && uv run pytest tests/test_api.py -k "fill_in_blank or choice_question_types" -q`.
- Full frontend App Vitest passed: `cd frontend && npm test -- --run src/App.test.tsx` (`139 passed`).
- Route/continuity fixtures passed: `cd frontend && npm test -- --run src/lib/appRoute.test.ts src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`.
- Backend graph/notes/study regressions passed: `cd backend && uv run pytest tests/test_api.py -k "graph or notes or study" -q` (`15 passed, 57 deselected`).
- Frontend build passed: `cd frontend && npm run build`.
- Node syntax checks passed for `scripts/playwright/study_review_progress_shared.mjs`, `scripts/playwright/stage942_study_fill_in_blank_answer_attempts_after_stage941.mjs`, and `scripts/playwright/stage943_post_stage942_study_fill_in_blank_answer_attempts_audit.mjs`.
- Stage 942 Playwright passed against `http://127.0.0.1:8010`, recording `studyFillBlankCreateDialogControlsVisible: true`, `studyFillBlankCreatesVisibleQuestion: true`, `studyFillBlankSearchFindsTemplateAndChoice: true`, `studyShortAnswerAttemptFeedbackVisible: true`, `studyFillBlankReviewSelectionState: true`, `studyFillBlankEditPreservesPayload: true`, `studyFillBlankSurvivesGenerate: true`, retained Stage 941 choice/manual-management/progress/Home review metrics, `notesSidebarVisible: false`, and cleanup dry-run `matchedCount: 0`.
- Standalone cleanup dry-run passed with `matchedCount: 0`.
- `git diff --check` passed.
