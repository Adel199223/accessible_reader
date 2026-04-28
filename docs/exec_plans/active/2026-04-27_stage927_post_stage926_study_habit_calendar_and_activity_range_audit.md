# Stage 927 - Post-Stage-926 Study Habit Calendar And Activity Range Audit

## Status

Complete.

## Intent

Audit that the Study habit calendar is range-aware, source-scoped, and composed with the existing Study progress and memory-stats loops while preserving the Stage 925 regression surfaces.

## Scope

- Confirm Study progress range controls support 14, 30, 90, and 365-day views.
- Confirm the compact calendar heatmap reflects the selected `daily_activity` period.
- Confirm range changes refetch progress and preserve source scope.
- Confirm empty progress remains calm and routes to the existing Review flow.
- Confirm Stage 924 knowledge-stage chips/source rows, Study schedule drilldowns, Home review filters/signals, Source overview review/search/memory, Reader, Notebook, Graph, Add Content, backend graph/notes contracts, and cleanup dry-run remain stable.

## Evidence Metrics

- `studyReviewProgressPeriodControlsVisible`
- `studyReviewProgressPeriodDays`
- `studyReviewProgressHeatmapVisible`
- `studyReviewProgressHeatmapDays`
- `studyReviewProgressPeriodSwitchesTo30`
- `studyReviewProgressPeriodSwitchPreservesSourceScope`
- retained Stage 924/925 Study memory stats metrics
- retained Stage 922/923 Study progress metrics
- retained Stage 920/921 Home review schedule lens metrics
- retained Stage 918/919 Study schedule drilldown metrics
- retained cleanup dry-run `matchedCount: 0`
- retained `notesSidebarVisible: false`

## Validation Plan

- Done: `node scripts/playwright/stage927_post_stage926_study_habit_calendar_and_activity_range_audit.mjs --base-url=http://127.0.0.1:8010`.
- Done: targeted App Vitest, frontend build, backend graph/notes/progress pytest.
- Done: `node --check` for the shared Study progress harness and Stage 926/927 scripts.
- Done: cleanup utility dry-run remained `matchedCount: 0`.
- Done: `git diff --check`.

## Evidence

- `stage927-post-stage926-study-habit-calendar-and-activity-range-audit-validation.json`: `studyReviewProgressPeriodControlsVisible: true`, `studyReviewProgressPeriodDays: 14`, `studyReviewProgressHeatmapVisible: true`, `studyReviewProgressHeatmapDays: 14`, `studyReviewProgressPeriodSwitchesTo30: true`, `studyReviewProgressPeriodSwitchPreservesSourceScope: true`, `studyKnowledgeStagePanelVisible: true`, `studyKnowledgeStageChipOpensQuestions: true`, `studyReviewProgressPanelVisible: true`, `homeReviewScheduleLensVisible: true`, `homeMemoryFilterControlsVisible: true`, `sourceOverviewReviewPanelVisible: true`, `graphVisible: true`, `notebookOpenWorkbenchVisible: true`, `cleanupUtilityDryRunMatchedAfterApply: 0`, `notesSidebarVisible: false`.
- Retained regression metrics included Study memory stats/progress/schedule, Home review filters/signals, Home memory filters, Source overview review/search/memory, Reader, Notebook, Graph, Add Content, generated Reader outputs, backend graph/notes contracts, and no visible legacy Notes sidebar.
