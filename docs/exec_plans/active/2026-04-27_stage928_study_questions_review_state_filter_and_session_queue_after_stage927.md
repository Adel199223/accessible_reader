# Stage 928 - Study Questions Review-State Filter And Session Queue After Stage 927

## Status

Complete.

## Intent

Turn Study dashboard review signals into an actionable Questions filter stack and a filtered Review session queue, using existing local Study card state only.

## Scope

- Add frontend continuity state `study.reviewHistoryFilter` with `all`, `unreviewed`, `forgot`, `hard`, `good`, and `easy`.
- Compose review-history filters with source scope, status tabs, schedule drilldowns, knowledge-stage filters, and question search.
- Make Study progress rating chips open Questions with the matching review-history filter.
- Add an active filter row with individual clear controls and a `Clear filters` action that preserves source scope.
- Add `Review filtered` from Questions so Review starts from the first visible filtered card and advances only inside the active filtered queue after ratings.
- Keep the work frontend/local-first: no backend schema/API changes, no Home analytics objects, no Reader/import/AI/notification/challenge changes, and no bulk question management.

## Evidence Metrics

- `studyQuestionReviewHistoryRatingChipOpensQuestions`
- `studyQuestionReviewHistoryActiveFilterStackVisible`
- `studyQuestionReviewHistoryClearFiltersWorks`
- `studyQuestionReviewHistoryReviewFilteredHandoff`
- `studyQuestionReviewHistoryRowsFiltered`
- `studyQuestionReviewHistoryHarnessDocumentDeleted`
- `studyQuestionReviewHistoryHarnessProgressCleaned`
- retained Stage 927 Study habit calendar metrics
- retained Stage 925 Study memory stats metrics
- retained Stage 923 Study progress metrics
- retained Stage 921 Home review schedule lens metrics
- retained Stage 919 Study schedule drilldown metrics
- retained cleanup dry-run `matchedCount: 0`

## Validation Plan

- Done: fixed TypeScript continuity fixtures for the new `reviewHistoryFilter` default.
- Done: added focused App tests for review-history filters, unreviewed filtering, rating-chip handoff, filter composition, clear behavior, and filtered queue advancement after rating.
- Done: added route/default continuity coverage for `reviewHistoryFilter`.
- Done: added `scripts/playwright/stage928_study_questions_review_state_filter_and_session_queue_after_stage927.mjs`.
- Done: ran targeted Vitest, full `App.test.tsx`, frontend build, backend graph/notes/study pytest, `node --check` for Stage 928/929 scripts, Stage 928/929 Playwright evidence, and cleanup dry-run.
- Done: `git diff --check`.

## Evidence

- `stage928-study-questions-review-state-filter-validation.json`: `studyQuestionReviewHistoryRatingChipOpensQuestions: true`, `studyQuestionReviewHistoryActiveFilterStackVisible: true`, `studyQuestionReviewHistoryClearFiltersWorks: true`, `studyQuestionReviewHistoryReviewFilteredHandoff: true`, `studyQuestionReviewHistoryRowsFiltered: true`, `studyQuestionReviewHistoryHarnessDocumentDeleted: true`, `studyQuestionReviewHistoryHarnessProgressCleaned: true`, `studyReviewProgressHeatmapVisible: true`, `studyKnowledgeStagePanelVisible: true`, `homeReviewScheduleLensVisible: true`, `studyScheduleDueBucketOpensQuestions: true`, `cleanupUtilityDryRunMatchedAfterApply: 0`, `notesSidebarVisible: false`.
- Targeted validations passed:
  - `npm run test -- --run src/App.test.tsx -t "review-history|rating chips"`
  - `npm run test -- --run src/lib/appRoute.test.ts src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
  - `npm run test -- --run src/App.test.tsx`
  - `npm run build`
  - `uv run pytest tests/test_api.py -k "recall_study or study_progress or study_knowledge or graph or notes" -q`
  - `node --check scripts/playwright/study_review_progress_shared.mjs`
  - `node --check scripts/playwright/stage928_study_questions_review_state_filter_and_session_queue_after_stage927.mjs`
  - `node --check scripts/playwright/stage929_post_stage928_study_questions_review_state_filter_and_session_queue_audit.mjs`
  - `node scripts/playwright/stage928_study_questions_review_state_filter_and_session_queue_after_stage927.mjs --base-url=http://127.0.0.1:8010`
