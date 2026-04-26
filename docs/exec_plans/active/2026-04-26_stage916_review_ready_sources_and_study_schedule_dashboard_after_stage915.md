# Stage 916 - Review-Ready Sources And Study Schedule Dashboard After Stage 915

## Status

Complete.

## Intent

Stage 916 makes existing Study-card review needs discoverable earlier. Home source cards, list rows, and Matches should surface compact review-ready signals for sources with source-owned Study cards, while Study gains a compact schedule dashboard and source breakdown that hands off into the existing source-scoped Review and Questions flows.

## Scope

- Add frontend-only Home review-ready signals for sources with Study cards.
- Show due, new, scheduled, total, and next-due context from existing Study card fields.
- Keep primary Home source-card/list behavior unchanged; the review signal opens source-scoped Study Review for that source.
- Preserve Stage 908 memory signals, Home memory filters, Personal notes board/lane/search, source-card board shape, Source overview memory/search, Notebook source-note semantics, Graph, Add Content, generated Reader outputs, backend APIs, and cleanup hygiene as regression surfaces.
- Add a Study Review dashboard section using existing card fields.
- Show schedule buckets for due now, due this week, upcoming/scheduled, new, reviewed, and total.
- Show a source breakdown sorted by due count, then new count, then next due.
- Let source rows open source-scoped Study Review or source-scoped Questions.
- Keep manual/global Study all-source by default; source scope remains a clearable frontend state when entered from Source overview, Reader, Home signals, or dashboard rows.

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
- retained `sourceOverviewReviewPanelVisible`
- retained `readerSourceStudyCountOpensSourceScopedStudy`
- retained `studySourceScopedQuestionSearchVisible`
- retained `homeMemoryFilterControlsVisible`
- retained `homeSourceMemorySignalsVisible`
- retained `sourceOverviewMemoryStackVisible`
- retained `stageHarnessCreatedNotesCleanedUp`
- retained cleanup dry-run `matchedCount: 0`
- retained `notesSidebarVisible: false`

## Validation Plan

- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- --run src/App.test.tsx -t \"Home|Study|Source overview|Reader|Notebook|Graph|memory|search|review\""`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k \"graph or notes\" -q"`
- `node --check scripts/playwright/notebook_workbench_shared.mjs`
- `node --check scripts/playwright/stage916_review_ready_sources_and_study_schedule_dashboard_after_stage915.mjs`
- `node --check scripts/playwright/stage917_post_stage916_review_ready_sources_and_study_schedule_dashboard_audit.mjs`
- cleanup utility dry-run remains `matchedCount: 0`
- live Stage 916 browser evidence against `http://127.0.0.1:8000`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`

## Evidence

- Implemented Home review-ready signals on source cards, list rows, and Matches using existing source-owned Study card data for due, new, scheduled, total, and next-due context.
- Review-ready Home signals open source-scoped Study Review while preserving primary source-card behavior, source-card board shape, Home memory signals, Personal notes, and memory filters.
- Added a compact Study Review schedule dashboard with due-now, this-week, upcoming, new, reviewed, and total buckets plus source breakdown rows that open source-scoped Review or Questions.
- Focused App Vitest passed: `npm run test -- --run src/App.test.tsx -t "Home|Study|Source overview|Reader|Notebook|Graph|memory|search|review"`.
- Frontend build passed: `npm run build`.
- Backend graph/notes pytest passed: `uv run pytest tests/test_api.py -k "graph or notes" -q`.
- Node syntax checks passed for the shared Notebook harness, cleanup utility, and Stage 916/917 scripts.
- Cleanup utility dry-run passed with `matchedCount: 0`.
- Live Stage 916 browser evidence passed and wrote `output/playwright/stage916-review-ready-sources-and-study-schedule-dashboard-validation.json`.
- `git diff --check` passed.
