# Stage 919 - Post-Stage-918 Study Schedule Drilldowns And Question Triage Audit

## Status

Complete.

## Intent

Audit that Study dashboard schedule drilldowns make Questions actionable while preserving Stage 916/917 review-ready Home discovery, Stage 914 source-scoped Review and Questions, Stage 912 source-memory search, Stage 910 Home memory filters, Stage 908 Home source-memory signals, Stage 906 Source memory stack, cleanup hygiene, and generated Reader output behavior.

## Scope

- Confirm dashboard buckets open Questions with the matching schedule drilldown.
- Confirm drilldowns filter source-scoped and all-source Questions from existing Study card fields.
- Confirm the schedule chip and empty state are clearable.
- Confirm Study status tabs clear the schedule drilldown and keep existing status filtering.
- Confirm question search composes with active schedule drilldowns.
- Retain Home review-ready signal evidence, Study dashboard/source breakdown evidence, Source overview review, Reader Study-count source-scoped handoff, cleanup dry-run, and broad Home/Reader/Notebook/Graph/Study/Add Content regression surfaces.

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
- retained Stage 916/917 metrics
- retained Stage 914/915 metrics
- retained cleanup dry-run `matchedCount: 0`
- retained `notesSidebarVisible: false`

## Validation Plan

- `node scripts/playwright/stage919_post_stage918_study_schedule_drilldowns_and_question_triage_audit.mjs`
- targeted App Vitest, frontend build, backend graph/notes pytest
- `node --check` for shared Notebook/Home harnesses and Stage 918/919 scripts
- cleanup utility dry-run remains `matchedCount: 0`
- `git diff --check`

## Evidence

- Stage 919 live audit passed against `http://127.0.0.1:8000`.
- Evidence file: `output/playwright/stage919-post-stage918-study-schedule-drilldowns-and-question-triage-audit-validation.json`
- Confirmed Stage 918 schedule drilldowns plus retained Home review-ready signals, Study dashboard/source rows, Source overview review, Reader source-scoped Study handoff, source-memory search, Home memory filters, source-memory signals, Personal notes, Notebook source context, Graph/Study source-note promotion, cleanup hygiene, and cross-surface regression captures.
- Required metrics passed: `studyScheduleBucketDrilldownsVisible`, `studyScheduleDueBucketOpensQuestions`, `studyScheduleThisWeekBucketFiltersQuestions`, `studyScheduleUpcomingBucketFiltersQuestions`, `studyScheduleReviewedBucketFiltersQuestions`, `studyScheduleFilterChipClearable`, `studyScheduleDrilldownSourceScopeStable`, `studyScheduleStatusTabsClearDrilldown`, `studyScheduleQuestionSearchComposesWithBucket`, `studyScheduleEmptyStateClearable`, `stageHarnessCreatedNotesCleanedUp`, `notesSidebarVisible: false`, and cleanup dry-run `matchedCount: 0`.
