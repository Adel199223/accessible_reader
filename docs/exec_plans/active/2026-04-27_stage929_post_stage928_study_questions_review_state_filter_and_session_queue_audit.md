# Stage 929 - Post-Stage-928 Study Questions Review-State Filter And Session Queue Audit

## Status

Complete.

## Intent

Audit that Stage 928 review-history filters are discoverable, clearable, and actionable while preserving Stage 927 Study habit/progress/memory, Home review discovery, Source overview, Reader, Notebook, Graph, Add Content, and cleanup baselines.

## Scope

- Confirm Study progress rating chips open Questions with matching review-history filters.
- Confirm active filter chips and `Clear filters` reset question filters while preserving source scope.
- Confirm `Review filtered` starts Review from the first visible filtered card and keeps the queue inside the filter stack after ratings.
- Confirm `unreviewed` remains card-state based and ratings use `last_rating`.
- Confirm Stage 927 habit calendar ranges, Stage 924 knowledge stages, Stage 922 progress, Stage 920 Home review filters, Stage 918 schedule drilldowns, and source-scoped review flows remain stable.
- Confirm Home remains source-card-owned and Personal notes remain note-owned.

## Evidence Metrics

- `studyQuestionReviewHistoryRatingChipOpensQuestions`
- `studyQuestionReviewHistoryActiveFilterStackVisible`
- `studyQuestionReviewHistoryClearFiltersWorks`
- `studyQuestionReviewHistoryReviewFilteredHandoff`
- `studyQuestionReviewHistoryRowsFiltered`
- retained `studyReviewProgressHeatmapVisible`
- retained `studyKnowledgeStagePanelVisible`
- retained `studyReviewProgressPanelVisible`
- retained `homeReviewScheduleLensVisible`
- retained `homeMemoryFilterControlsVisible`
- retained `sourceOverviewReviewPanelVisible`
- retained `graphVisible`
- retained `notebookOpenWorkbenchVisible`
- retained cleanup dry-run `matchedCount: 0`
- retained `notesSidebarVisible: false`

## Validation Plan

- Done: ran `scripts/playwright/stage929_post_stage928_study_questions_review_state_filter_and_session_queue_audit.mjs` against the local app.
- Done: ran targeted and full frontend Vitest, frontend build, backend graph/notes/study pytest, `node --check`, and cleanup dry-run.
- Done: updated roadmap and assistant anchors to name Stage 929 as the completed audit gate.
- Done: `git diff --check`.

## Evidence

- `stage929-post-stage928-study-questions-review-state-filter-and-session-queue-audit-validation.json`: `studyQuestionReviewHistoryRatingChipOpensQuestions: true`, `studyQuestionReviewHistoryActiveFilterStackVisible: true`, `studyQuestionReviewHistoryClearFiltersWorks: true`, `studyQuestionReviewHistoryReviewFilteredHandoff: true`, `studyQuestionReviewHistoryRowsFiltered: true`, `studyReviewProgressHeatmapVisible: true`, `studyKnowledgeStagePanelVisible: true`, `studyReviewProgressPanelVisible: true`, `homeReviewScheduleLensVisible: true`, `homeMemoryFilterControlsVisible: true`, `sourceOverviewReviewPanelVisible: true`, `cleanupUtilityDryRunMatchedAfterApply: 0`, `notesSidebarVisible: false`.
- Retained regression metrics included Study habit calendar ranges/heatmap, memory stats, progress, Home review filters/signals, Study schedule drilldowns, Source overview review/search/memory, Reader, Notebook, Graph, Add Content, generated Reader outputs, backend graph/notes contracts, and no visible legacy Notes sidebar.
