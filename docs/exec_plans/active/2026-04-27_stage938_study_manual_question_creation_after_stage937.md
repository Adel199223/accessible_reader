# Stage 938 - Study Manual Question Creation After Stage 937

## Status

Complete.

## Intent

Add source-owned manual Study question creation so the existing Questions workflow can create local short-answer or flashcard questions without AI generation or schema changes.

## Scope

- Add `POST /api/recall/study/cards` over existing `review_cards`.
- Support `short_answer` and `flashcard` manual card types only.
- Ground every created card to an existing saved source.
- Preserve manual cards through generated-card sync.
- Add compact `New question` controls to Study dashboard, Study Questions, and source-scoped Study.
- Keep creation local-first and composed with source scope, filters, scheduling, edit/delete, progress, source memory, and review queues.
- Keep multiple choice, matching, ordering, true/false schemas, hints, explanations, AI generation, CSV import, timed questions, streak settings, notifications, shared challenges, Reader generated output changes, and Home analytics out of scope.

## Evidence Metrics

- `studyQuestionCreateDialogVisible`
- `studyQuestionCreateGlobalCreatesVisibleQuestion`
- `studyQuestionCreateSourceScopedPreservesSource`
- `studyQuestionCreateTypeSelectorWorks`
- `studyQuestionCreateReviewEligible`
- `studyQuestionCreateSurvivesGenerate`
- retained Stage 937 edit/delete metrics
- retained Stage 935 scheduling metrics
- retained memory progress/subset/review-history/habit/progress/Home review/source overview metrics
- cleanup dry-run `matchedCount: 0`
- `notesSidebarVisible: false`

## Validation Plan

- Backend pytest for create validation, missing source rejection, card serialization, immediate `new` status, schedule/review/delete compatibility, generated sync preservation, source-scoped lists, progress/stage counts, source memory visibility, and no schema migration.
- Frontend App tests for global creation with source selector, source-scoped creation, blank validation, card type selector, post-create filter clearing while preserving source scope, created-card selection, review eligibility, and continued edit/delete/schedule behavior.
- Add `scripts/playwright/stage938_study_manual_question_creation_after_stage937.mjs`.
- Add `scripts/playwright/stage939_post_stage938_study_manual_question_creation_audit.mjs`.
- Run targeted Vitest, full `App.test.tsx`, frontend build, backend graph/notes/study pytest, `node --check`, Stage 938/939 Playwright, cleanup dry-run, and `git diff --check`.

## Validation Results

- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/App.test.tsx'`
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx src/lib/appRoute.test.ts'`
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm run build'`
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k "manual_question_creation or study_card_edit_and_soft_delete_management" -q'`
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k "recall_study or study_progress or study_knowledge or graph or notes" -q'`
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/study_review_progress_shared.mjs && node --check scripts/playwright/stage938_study_manual_question_creation_after_stage937.mjs && node --check scripts/playwright/stage939_post_stage938_study_manual_question_creation_audit.mjs'`
- `node scripts/playwright/stage938_study_manual_question_creation_after_stage937.mjs --base-url=http://127.0.0.1:8000`
- Stage 938 evidence: `output/playwright/stage938-study-manual-question-creation-validation.json`
