# Stage 918 - Study Schedule Drilldowns And Question Triage After Stage 917

## Status

Complete.

## Intent

Make the Stage 916 Study schedule dashboard actionable without changing backend contracts. Dashboard schedule buckets should open Questions with the matching source-aware schedule drilldown, so review-ready cards can be browsed and searched before starting or continuing review.

## Scope

- Add frontend-only Study schedule drilldown state: `all`, `due-now`, `due-this-week`, `upcoming`, `new`, and `reviewed`.
- Make Study dashboard buckets open Questions with the matching drilldown and a clearable active filter chip.
- Keep source-scoped Study source-scoped when bucket drilldowns originate from Source overview, Reader, Home review-ready signals, or source breakdown rows.
- Compose schedule drilldowns with existing source scope and question search.
- Let existing Study status tabs clear the schedule drilldown and continue to work as before.
- Keep Home review-ready signals, Source overview review, Reader Study-count handoff, source-scoped rating continuity, Home memory filters, Personal notes, Graph, Notebook, Add Content, generated Reader outputs, cleanup hygiene, and backend APIs as regression surfaces only.

## Evidence Metrics

- `studyScheduleBucketDrilldownsVisible`
- `studyScheduleDueBucketOpensQuestions`
- `studyScheduleThisWeekBucketFiltersQuestions`
- `studyScheduleUpcomingBucketFiltersQuestions`
- `studyScheduleReviewedBucketFiltersQuestions`
- `studyScheduleFilterChipClearable`
- `studyScheduleDrilldownSourceScopeStable`
- `studyScheduleStatusTabsClearDrilldown`
- `studyScheduleQuestionSearchComposesWithBucket`
- `studyScheduleEmptyStateClearable`
- retained Stage 916/917 review-ready source and Study dashboard metrics
- retained Stage 914/915 source-scoped review metrics
- retained cleanup dry-run `matchedCount: 0`
- retained `notesSidebarVisible: false`

## Validation Plan

- `npm run test -- --run src/App.test.tsx -t "Study|Home|Source overview|Reader|Notebook|Graph|memory|search|review|schedule"`
- `npm run build`
- `uv run pytest tests/test_api.py -k "graph or notes" -q`
- `node --check scripts/playwright/notebook_workbench_shared.mjs`
- `node --check scripts/playwright/stage918_study_schedule_drilldowns_and_question_triage_after_stage917.mjs`
- `node --check scripts/playwright/stage919_post_stage918_study_schedule_drilldowns_and_question_triage_audit.mjs`
- cleanup utility dry-run against `http://127.0.0.1:8000` with `matchedCount: 0`
- live Stage 918 and Stage 919 browser evidence against `http://127.0.0.1:8000`
- `git diff --check`

## Evidence

- Implemented frontend-only `scheduleDrilldown` continuity for Study with dashboard bucket handoffs into Questions, a clearable schedule chip, schedule/status/search composition, and source-scoped focused Study schedule controls.
- Added focused App coverage in `frontend/src/App.test.tsx` for due, this-week, upcoming, reviewed, search composition, empty-state clearing, and status-tab reset behavior.
- Added shared Playwright evidence helper plus Stage 918/919 scripts.
- Live Stage 918 evidence: `output/playwright/stage918-study-schedule-drilldowns-and-question-triage-validation.json`
- Live Stage 919 evidence: `output/playwright/stage919-post-stage918-study-schedule-drilldowns-and-question-triage-audit-validation.json`
- Evidence metrics confirmed `studyScheduleBucketDrilldownsVisible`, `studyScheduleDueBucketOpensQuestions`, `studyScheduleThisWeekBucketFiltersQuestions`, `studyScheduleUpcomingBucketFiltersQuestions`, `studyScheduleReviewedBucketFiltersQuestions`, `studyScheduleFilterChipClearable`, `studyScheduleDrilldownSourceScopeStable`, `studyScheduleStatusTabsClearDrilldown`, `studyScheduleQuestionSearchComposesWithBucket`, and `studyScheduleEmptyStateClearable` as `true`, with `stageHarnessCreatedNotesCleanedUp: true`, `notesSidebarVisible: false`, and cleanup dry-run `matchedCount: 0`.
