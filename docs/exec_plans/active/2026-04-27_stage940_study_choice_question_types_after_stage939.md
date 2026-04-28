# Stage 940 - Study Choice Question Types After Stage 939

## Status

Completed.

## Intent

Extend source-owned manual Study question creation from `short_answer` and `flashcard` into typed `multiple_choice` and `true_false` cards, while keeping review attempts local to the UI and preserving the existing FSRS rating flow.

## Scope

- Extend manual Study card create/update types with `multiple_choice` and `true_false`.
- Store type-specific payload in existing `scheduling_state_json.manual_question_payload`; no schema migration.
- Keep `answer` as the canonical correct answer text for search, previews, edit/delete, review, and portability.
- Validate multiple choice as 2-6 trimmed, unique choices with one correct choice.
- Validate true/false as one correct boolean choice with stable `true` / `false` option ids.
- Add typed controls to `New question`, row edit, and active Review surfaces.
- Include choice text in local Study Questions search.
- Keep schedule/unschedule, edit/delete, bulk delete, filtered Review queues, source scope, collection subsets, review-history, memory stats, progress, Home review discovery, Source overview, Reader, Notebook, Graph, Add Content, and generated sync behavior intact.
- Keep Home discovery-only and source-card-owned; do not add AI generation, CSV import, hints, explanations, timed questions, notifications, shared challenges, Reader generated-output changes, or durable answer-attempt analytics.

## Evidence Metrics

- `studyChoiceQuestionCreateDialogVisible`
- `studyChoiceQuestionMultipleChoiceCreates`
- `studyChoiceQuestionTrueFalseCreates`
- `studyChoiceQuestionTypedReviewOptionSelection`
- `studyChoiceQuestionTypedReviewCorrectState`
- `studyChoiceQuestionEditPreservesPayload`
- `studyChoiceQuestionSearchFindsChoiceText`
- `studyChoiceQuestionSurvivesGenerate`
- retained Stage 939 manual creation metrics
- retained Stage 937 edit/delete metrics
- retained Stage 935 scheduling metrics
- retained memory progress/subset/review-history/habit/progress/Home review/source overview metrics
- cleanup dry-run `matchedCount: 0`
- `notesSidebarVisible: false`

## Validation Plan

- Backend pytest for create/update validation, serialization, missing-source rejection, multiple-choice choice rules, true/false normalization, schedule/review/delete compatibility, generated sync preservation, source-scoped lists, progress/stage counts, and no schema migration.
- Frontend App tests for global multiple-choice creation, source-scoped true/false creation, edit choice payloads, search by distractor/correct choice text, typed Review answer selection, rating after typed selection, filtered Review queue compatibility, and retained schedule/edit/delete/bulk-delete behavior.
- Add `scripts/playwright/stage940_study_choice_question_types_after_stage939.mjs`.
- Add `scripts/playwright/stage941_post_stage940_study_choice_question_types_audit.mjs`.
- Run targeted Vitest, full `App.test.tsx`, frontend build, backend graph/notes/study pytest, `node --check`, Stage 940/941 Playwright, cleanup dry-run, and `git diff --check`.

## Validation Results

- Passed targeted backend pytest: `cd backend && uv run pytest tests/test_api.py -k "choice_question_types or manual_question_creation" -q`.
- Passed broader backend graph/notes/study regression pytest: `cd backend && uv run pytest tests/test_api.py -k "choice_question_types or manual_question_creation or study_card_edit_and_soft_delete_management or study_card_schedule_state_controls or recall_study or study_progress or study_knowledge or graph or notes" -q`.
- Passed targeted frontend Vitest for choice creation/review plus retained manual/edit flows.
- Passed full frontend App suite: `cd frontend && npm test -- src/App.test.tsx`.
- Passed route/default continuity fixtures: `cd frontend && npm test -- src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx src/lib/appRoute.test.ts`.
- Passed frontend build: `cd frontend && npm run build`.
- Passed `node --check` for `scripts/playwright/study_review_progress_shared.mjs`, `stage940_study_choice_question_types_after_stage939.mjs`, and `stage941_post_stage940_study_choice_question_types_audit.mjs`.
- Passed Stage 940 Playwright against a fresh local validation server on `http://127.0.0.1:8010`; evidence recorded `studyChoiceQuestionCreateDialogVisible`, multiple-choice creation, true/false creation, typed Review option selection/correct state, edit preservation, generated-sync survival, cleanup metrics, and `notesSidebarVisible: false`.
- Passed cleanup dry-run after Stage 941 with `matchedCount: 0`.
- Passed `git diff --check`.
