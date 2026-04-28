# Stage 923 - Post-Stage-922 Study Review Progress Dashboard Audit

## Status

Complete.

## Intent

Audit that the Study review progress dashboard exposes review habit feedback from existing local review events while preserving Stage 920 Home review schedule discovery, Stage 918 Study drilldowns, source-scoped Study behavior, and stable Recall workspace regressions.

## Scope

- Confirm Study progress is visible on the global dashboard when review events exist.
- Confirm the empty state stays actionable when no review events exist.
- Confirm daily activity, streak, rating mix, recent reviews, and source rows are derived from local review events.
- Confirm source-scoped Study narrows progress to the active source.
- Confirm recent review rows select existing Study cards.
- Confirm source progress rows reuse source-scoped Study Review/Questions handoffs.
- Confirm Home remains source-card-owned and Personal notes remain note-owned.
- Retain Home review filters/signals, Source overview review/search/memory, Study schedule drilldowns, Reader, Notebook, Graph, Add Content, cleanup dry-run, generated Reader outputs, and backend graph/notes regression surfaces.

## Evidence Metrics

- `studyReviewProgressPanelVisible`
- `studyReviewProgressEmptyStateActionable`
- `studyReviewProgressTodayCount`
- `studyReviewProgressDailyStreak`
- `studyReviewProgressActivityVisible`
- `studyReviewProgressRatingMixVisible`
- `studyReviewProgressRecentReviewsVisible`
- `studyReviewProgressSourceRowsVisible`
- `studyReviewProgressSourceScoped`
- `studyReviewProgressRecentReviewSelectsCard`
- `studyReviewProgressSourceRowOpensQuestions`
- retained Stage 920/921 Home review schedule lens metrics
- retained Stage 918/919 Study schedule drilldown metrics
- retained cleanup dry-run `matchedCount: 0`
- retained `notesSidebarVisible: false`

## Validation Plan

- `node scripts/playwright/stage923_post_stage922_study_review_progress_dashboard_audit.mjs --base-url=http://127.0.0.1:8010`
- targeted App Vitest, frontend build, backend graph/notes/progress pytest
- `node --check` for shared Notebook/Home harnesses and Stage 922/923 scripts
- cleanup utility dry-run remains `matchedCount: 0`
- `git diff --check`

## Evidence

- Stage 923 live audit passed against `http://127.0.0.1:8010`.
- Evidence file: `output/playwright/stage923-post-stage922-study-review-progress-dashboard-audit-validation.json`
- Confirmed Study review progress remains visible and source-scoped from local review events, with daily activity, streak, rating mix, recent reviews, and source rows derived from existing data.
- Confirmed recent review rows select local Study cards and source progress rows reuse source-scoped Questions handoffs.
- Retained Stage 920/921 Home review schedule lens, Stage 918/919 Study schedule drilldowns, Stage 916/917 Home review-ready signals and dashboard source rows, Stage 914/915 Source review/Questions, Stage 912/913 source-memory search, Stage 910/911 Home memory filters, Source overview memory/review, Reader, Notebook, Graph, cleanup hygiene, and `notesSidebarVisible: false`.
- Cleanup dry-run remained `matchedCount: 0`; the Stage 922/923 progress harness deleted its temporary document and verified scoped progress returned to zero.
