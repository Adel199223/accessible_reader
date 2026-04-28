# Stage 926 - Study Habit Calendar And Activity Range After Stage 925

## Status

Complete.

## Intent

Add a Study-first habit calendar and selectable activity range over existing local review events so Stage 922 progress and Stage 924 memory stats also show review consistency over 14, 30, 90, and 365 days.

## Scope

- Extend `GET /api/recall/study/progress` with a read-only `period_days` query for dashboard ranges of 14, 30, 90, and 365 days.
- Keep the endpoint backed only by existing `review_events` and source scope; no schema migration or scheduling changes.
- Add frontend progress-period state defaulting to 14 days and refetch progress when the period or source scope changes.
- Upgrade the Study progress panel with compact range controls, current streak / reviewed today / active-days summary, and a calendar-style activity heatmap.
- Preserve Stage 924 memory stats, Study schedule drilldowns, source-scoped Study handoffs, Home review discovery, Personal notes ownership, Reader, Notebook, Graph, Add Content, cleanup hygiene, and generated Reader output invariants.
- Do not add notifications, streak settings, challenges, timed questions, bulk question management, Home analytics objects, imports, chat/API features, or durable historical knowledge-stage transition charts.

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

- Done: backend pytest for progress period ranges, validation, empty state, daily activity ordering, source-scoped activity, streak preservation, and no schema/API mutation beyond the read endpoint.
- Done: targeted App Vitest for range controls, heatmap rendering, source-scoped activity, empty state, refresh after rating, and Stage 924 knowledge-stage regression.
- Done: frontend build.
- Done: `node --check` for the shared Study progress harness and Stage 926/927 scripts.
- Done: live Stage 926 and Stage 927 browser evidence against a current-code local server on `http://127.0.0.1:8010`.
- Done: cleanup utility dry-run remained `matchedCount: 0`.
- Done: `git diff --check`.

## Evidence

- `stage926-study-habit-calendar-and-activity-range-validation.json`: `studyReviewProgressPeriodControlsVisible: true`, `studyReviewProgressPeriodDays: 14`, `studyReviewProgressHeatmapVisible: true`, `studyReviewProgressHeatmapDays: 14`, `studyReviewProgressPeriodSwitchesTo30: true`, `studyReviewProgressPeriodSwitchPreservesSourceScope: true`, `studyKnowledgeStagePanelVisible: true`, `homeReviewScheduleLensVisible: true`, `studyScheduleDueBucketOpensQuestions: true`, `cleanupUtilityDryRunMatchedAfterApply: 0`, `notesSidebarVisible: false`.
- Targeted validations passed:
  - `uv run pytest tests/test_api.py -k "study_progress or study_knowledge"`
  - `uv run pytest tests/test_api.py -k "recall_study or graph or notes"`
  - `npm test -- src/App.test.tsx`
  - `npm test -- src/lib/appRoute.test.ts src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
  - `npm run build`
  - `node --check scripts/playwright/study_review_progress_shared.mjs`
  - `node --check scripts/playwright/stage926_study_habit_calendar_and_activity_range_after_stage925.mjs`
  - `node --check scripts/playwright/stage927_post_stage926_study_habit_calendar_and_activity_range_audit.mjs`
