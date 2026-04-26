# Stage 914 - Source Review Queue And Study Question Find After Stage 913

## Status

Complete.

## Intent

Stage 914 turns source-local study memory into an active recall path. Source overview should show a compact `Source review` area backed by existing source-local Study cards, hand off into a source-scoped Review queue or Questions view, and keep Reader-led Study continuity source-scoped.

## Scope

- Add a compact `Source review` area in Source overview using existing source-local Study cards.
- Show source-owned due, new, scheduled, total, and next-due information.
- Make the primary Source overview review action open focused Study in a source-scoped queue ordered due, new, then scheduled.
- Make the secondary Source overview action open focused Study `Questions` scoped to the active source.
- Add frontend-only Study source scope and a clearable `Search questions` control in Questions view.
- Match question search against prompt, answer, source title, status, and source-span evidence preview.
- Keep manual/global Study entry all-source by default, while Reader and Source overview Study handoffs set a source-scope chip/action.
- Keep rating/review flow inside source scope and advance to the next source-local card when available.
- Keep Home source boards, Home memory filters, Personal notes, Source memory search, Graph, Notebook source semantics, Add Content, generated Reader outputs, cleanup hygiene, backend routes, and storage contracts unchanged.

## Evidence Metrics

- `sourceOverviewReviewPanelVisible`
- `sourceOverviewReviewUsesSourceOwnedCounts`
- `sourceOverviewReviewDueHandoffOpensSourceScopedStudy`
- `sourceOverviewReviewQuestionsHandoffOpensSourceScopedQuestions`
- `studySourceScopedQueueVisible`
- `studySourceScopedQuestionSearchVisible`
- `studySourceScopedQuestionSearchFindsPrompt`
- `studySourceScopedQuestionSearchFindsEvidence`
- `studySourceScopedReviewStaysInSourceAfterRating`
- `readerSourceStudyCountOpensSourceScopedStudy`
- retained `sourceMemorySearchControlsVisible`
- retained `homeMemoryFilterControlsVisible`
- retained `homeSourceMemorySignalsVisible`
- retained `sourceOverviewMemoryStackVisible`
- retained `readerSourceMemoryCountsActionable`
- retained `stageHarnessCreatedNotesCleanedUp`
- retained cleanup dry-run `matchedCount: 0`
- retained `notesSidebarVisible: false`

## Validation Plan

- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- --run src/App.test.tsx -t \"Source overview|Reader|Study|Home|Notebook|Graph|memory|search\""`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k \"graph or notes\" -q"`
- `node --check scripts/playwright/notebook_workbench_shared.mjs`
- `node --check scripts/playwright/stage914_source_review_queue_and_study_question_find_after_stage913.mjs`
- `node --check scripts/playwright/stage915_post_stage914_source_review_queue_and_study_question_find_audit.mjs`
- cleanup utility dry-run remains `matchedCount: 0`
- live Stage 914 browser evidence against `http://127.0.0.1:8000`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`

## Evidence

- Implemented Source overview `Source review` with source-owned due/new/scheduled/total counts, next-due context, and source-scoped Review/Questions handoffs.
- Added frontend-only Study source scope plus `Search questions` across prompt, answer, status, source title, and source-span evidence preview.
- Reader source Study count now opens source-scoped Study; source-scoped review remains scoped after rating.
- Focused App Vitest passed: `npm run test -- --run src/App.test.tsx -t "Source overview|Reader|Study|Home|Notebook|Graph|memory|search"`.
- Frontend build passed: `npm run build`.
- Backend graph/notes pytest passed: `uv run pytest tests/test_api.py -k "graph or notes" -q`.
- Node syntax checks passed for `scripts/playwright/notebook_workbench_shared.mjs`, Stage 914, and Stage 915 scripts.
- Cleanup utility dry-run passed with `matchedCount: 0`.
- Live Stage 914 browser evidence passed and wrote `output/playwright/stage914-source-review-queue-and-study-question-find-validation.json`.
