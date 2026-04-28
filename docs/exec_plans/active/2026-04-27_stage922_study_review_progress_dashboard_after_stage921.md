# Stage 922 - Study Review Progress Dashboard After Stage 921

## Status

Complete.

## Intent

Expose a Study-first review progress loop using existing local `review_events`, so Stage 920 Home review schedule discovery leads into visible habit and progress feedback inside Study without changing Home ownership or Study scheduling semantics.

## Scope

- Add a read-only local Study progress endpoint backed by existing `review_events`.
- Add frontend progress types/API and load progress alongside Study overview/cards.
- Add a compact Study dashboard progress panel for today count, recent activity, daily streak, rating mix, recent reviews, and source progress rows.
- Compose progress with existing Study source scope.
- Let recent review rows select the matching Study card when present.
- Reuse existing source-scoped Study Review/Questions handoffs from source rows.
- Preserve Stage 920 Home review filters/signals, source-card boards, and Personal notes note ownership.
- Do not add schema migrations, notifications, challenges, bulk question management, AI generation, import changes, generated Reader output changes, or Home analytics objects.

## Evidence Metrics

- `studyReviewProgressPanelVisible`
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

- targeted backend pytest for `/api/recall/study/progress`
- targeted App Vitest for Study review progress, source scope, recent-review selection, source-row handoffs, empty state, and refresh after rating
- frontend build
- `node --check scripts/playwright/stage922_study_review_progress_dashboard_after_stage921.mjs`
- `node --check scripts/playwright/stage923_post_stage922_study_review_progress_dashboard_audit.mjs`
- live Stage 922 and Stage 923 browser evidence against a current-code local server
- cleanup utility dry-run remains `matchedCount: 0`
- `git diff --check`

## Evidence

- Stage 922 live validation passed against `http://127.0.0.1:8010` because the existing `:8000` process was a pre-Stage-922 backend during this run.
- Evidence file: `output/playwright/stage922-study-review-progress-dashboard-validation.json`
- Added read-only `GET /api/recall/study/progress` over existing `review_events`, with optional `source_document_id` filtering and no schema migration.
- Added Study progress API/types and a compact Study dashboard panel for reviewed today, 14-day activity, daily streak, rating mix, recent reviews, and source progress rows.
- Confirmed recent review rows select the matching local Study card, source progress rows open source-scoped Questions, source-scoped Study narrows progress, and the temporary progress harness source is deleted after evidence.
- Retained Stage 920/921 Home review schedule lens, Stage 918/919 Study schedule drilldowns, cleanup dry-run `matchedCount: 0`, and `notesSidebarVisible: false`.
