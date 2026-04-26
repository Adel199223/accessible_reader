# Stage 917 - Post-Stage-916 Review-Ready Sources And Study Schedule Dashboard Audit

## Status

Complete.

## Intent

Stage 917 audits that Stage 916 review-ready Home discovery and the Study schedule dashboard work without disturbing Stage 914 source-scoped review, Stage 912 source-memory search, Stage 910 Home memory filters, Stage 908 Home source-memory signals, Stage 906 source-memory stack, cleanup hygiene, or generated Reader output behavior.

## Scope

- Re-run Home review-ready signal evidence for source cards, list rows, and Matches.
- Confirm review signals open source-scoped Study Review without changing primary source-card behavior or mixing memory/study cards into source boards.
- Confirm the Study Review dashboard shows schedule buckets and source breakdown rows.
- Confirm source breakdown rows open source-scoped Review and Questions.
- Retain Source overview review panel evidence, Reader Study-count source-scoped handoff, Study source-scoped question search, Home memory filters, Home source-memory signals, Source overview memory stack, cleanup dry-run, and broad Home/Reader/Notebook/Graph/Study/Add Content regression surfaces.

## Evidence Metrics

- `homeReviewReadySourceSignalsVisible`
- `homeReviewReadySourceSignalsUseDueCounts`
- `homeReviewReadySignalOpensSourceScopedStudy`
- `homeReviewReadySignalsDoNotMixBoardItems`
- `homeReviewReadyMatchesSignalVisible`
- `studyReviewDashboardVisible`
- `studyReviewDashboardUsesScheduleBuckets`
- `studyReviewDashboardSourceBreakdownVisible`
- `studyReviewDashboardSourceRowOpensSourceScopedStudy`
- `studyReviewDashboardSourceRowOpensSourceScopedQuestions`
- retained Stage 914/915 source review metrics
- retained Stage 912/913 source-memory search metrics
- retained Stage 910/911 Home memory-filter metrics
- retained Stage 908/909 Home source-memory metrics
- retained Stage 906/907 source-memory metrics
- retained cleanup hygiene metrics
- retained broad Home/Reader/Notebook/Graph/Study/Add Content regression metrics
- retained `notesSidebarVisible: false`

## Validation Plan

- `node scripts/playwright/stage917_post_stage916_review_ready_sources_and_study_schedule_dashboard_audit.mjs`
- targeted App Vitest, frontend build, backend graph/notes pytest
- `node --check` for shared Notebook/Home harnesses and Stage 916/917 scripts
- cleanup utility dry-run remains `matchedCount: 0`
- `git diff --check`

## Evidence

- Live Stage 917 browser audit passed and wrote `output/playwright/stage917-post-stage916-review-ready-sources-and-study-schedule-dashboard-audit-validation.json`.
- Required Stage 916/917 metrics passed: `homeReviewReadySourceSignalsVisible`, `homeReviewReadySourceSignalsUseDueCounts`, `homeReviewReadySignalOpensSourceScopedStudy`, `homeReviewReadySignalsDoNotMixBoardItems`, `homeReviewReadyMatchesSignalVisible`, `studyReviewDashboardVisible`, `studyReviewDashboardUsesScheduleBuckets`, `studyReviewDashboardSourceBreakdownVisible`, `studyReviewDashboardSourceRowOpensSourceScopedStudy`, and `studyReviewDashboardSourceRowOpensSourceScopedQuestions`.
- Retained regression metrics passed, including `sourceOverviewReviewPanelVisible`, `readerSourceStudyCountOpensSourceScopedStudy`, `studySourceScopedQuestionSearchVisible`, `homeMemoryFilterControlsVisible`, `homeSourceMemorySignalsVisible`, `sourceOverviewMemoryStackVisible`, `stageHarnessCreatedNotesCleanedUp`, cleanup dry-run `matchedCount: 0`, and `notesSidebarVisible: false`.
- Targeted App Vitest, frontend build, backend graph/notes pytest, Node syntax checks, live Stage 916 evidence, live Stage 917 audit, cleanup dry-run, and `git diff --check` were run as the Stage 916/917 closeout gate.
