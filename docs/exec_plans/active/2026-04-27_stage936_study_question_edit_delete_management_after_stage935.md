# Stage 936 - Study Question Edit/Delete Management After Stage 935

## Status

Complete.

## Intent

Add local Study question management so the Questions tab can edit prompt/answer text and delete individual or selected visible questions without leaving the existing source-scoped and filtered Study workflow.

## Scope

- Add card edit, single-delete, and bulk-delete endpoints over existing `review_cards` storage; no schema migration.
- Preserve manually edited generated cards during Study regeneration.
- Soft-hide deleted cards from Study lists, dashboards, source memory, Home review signals, and review queues.
- Add compact Edit, Delete, and selection controls to Study Questions and active Review while keeping Stage 934 Schedule / Unschedule controls intact.
- Keep card creation from scratch, new question types, hints, explanations, timed questions, notifications, streak settings, shared challenges, AI generation, import changes, Reader generated output changes, and hard-delete of documents/notes out of scope.

## Evidence Metrics

- `studyQuestionEditRowActionWorks`
- `studyQuestionEditActiveActionWorks`
- `studyQuestionDeleteRowActionWorks`
- `studyQuestionBulkDeleteVisibleSelectionWorks`
- `studyQuestionDeleteAdvancesReviewQueue`
- `studyQuestionManagementPreservesScheduleControls`
- retained Stage 935 scheduling metrics
- retained Stage 933 memory-progress metrics
- retained subset/review-history/habit/progress/Home review/source overview metrics
- cleanup dry-run `matchedCount: 0`
- `notesSidebarVisible: false`

## Validation Plan

- Backend pytest for edit validation, single delete, bulk delete, regeneration preserving edits/deletes, progress/source filtering, source memory filtering, and no schema migration.
- Frontend App tests for row edit, active-card edit, single delete, bulk delete across selected visible filtered questions, source/search/filter composition, review queue advancement after delete, and Stage 934 schedule controls.
- Add `scripts/playwright/stage936_study_question_edit_delete_management_after_stage935.mjs`.
- Add `scripts/playwright/stage937_post_stage936_study_question_edit_delete_management_audit.mjs`.
- Run targeted Vitest, full `App.test.tsx`, frontend build, backend graph/notes/study pytest, `node --check`, Stage 936/937 Playwright, cleanup dry-run, and `git diff --check`.

## Validation Results

- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/App.test.tsx'`
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx src/lib/appRoute.test.ts'`
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm run build'`
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k "study_card_edit_and_soft_delete_management or study_card_schedule_state_controls or recall_study or study_progress or study_knowledge or graph or notes" -q'`
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/study_review_progress_shared.mjs && node --check scripts/playwright/stage936_study_question_edit_delete_management_after_stage935.mjs && node --check scripts/playwright/stage937_post_stage936_study_question_edit_delete_management_audit.mjs'`
- `node scripts/playwright/stage936_study_question_edit_delete_management_after_stage935.mjs --base-url=http://127.0.0.1:8000`
- `node scripts/playwright/stage937_post_stage936_study_question_edit_delete_management_audit.mjs --base-url=http://127.0.0.1:8000`
- `node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=http://127.0.0.1:8000` dry-run matched `0`.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader && git diff --check'`

## Evidence

- `output/playwright/stage936-study-question-edit-delete-management-validation.json`
- Key metrics: `studyQuestionEditRowActionWorks: true`, `studyQuestionEditActiveActionWorks: true`, `studyQuestionDeleteRowActionWorks: true`, `studyQuestionBulkDeleteVisibleSelectionWorks: true`, `studyQuestionDeleteAdvancesReviewQueue: true`, `studyQuestionManagementPreservesScheduleControls: true`, `cleanupUtilityDryRunMatchedAfterApply: 0`, `notesSidebarVisible: false`.
