# Stage 933 - Post-Stage-932 Study Memory Progress Timeline Audit

## Status

Complete.

## Intent

Audit that the Study memory-progress timeline is visible, source-aware, range-aware, and actionable while preserving the Stage 931 Study subset filters, Stage 929 review-history queue, progress, memory, Home review discovery, Source overview, Reader, Notebook, Graph, Add Content, and cleanup baselines.

## Scope

- Confirm memory-progress snapshots render all five stages for the selected period.
- Confirm range controls refresh memory progress together with the activity heatmap.
- Confirm global and source-scoped Study progress show the correct memory-progress scope.
- Confirm stage legend/bands open Questions with the matching knowledge-stage filter and preserve existing filter composition.
- Confirm empty states stay calm and do not fake analytics.

## Evidence Metrics

- `studyMemoryProgressPanelVisible`
- `studyMemoryProgressTimelineVisible`
- `studyMemoryProgressPeriodSwitches`
- `studyMemoryProgressSourceScoped`
- `studyMemoryProgressStageOpensQuestions`
- retained `studyCollectionSubsetPanelVisible`
- retained `studyQuestionReviewHistoryReviewFilteredHandoff`
- retained `studyReviewProgressHeatmapVisible`
- retained `studyKnowledgeStagePanelVisible`
- retained `homeReviewScheduleLensVisible`
- retained `sourceOverviewReviewPanelVisible`
- retained cleanup dry-run `matchedCount: 0`
- retained `notesSidebarVisible: false`

## Validation Plan

- Run `scripts/playwright/stage933_post_stage932_study_memory_progress_timeline_audit.mjs` against the local app.
- Run targeted and full frontend Vitest, frontend build, backend graph/notes/study pytest, `node --check`, cleanup dry-run, and `git diff --check`.
- Update roadmap and assistant anchors only after validation records Stage 933 as the completed audit gate.

## Evidence

- `node scripts/playwright/stage933_post_stage932_study_memory_progress_timeline_audit.mjs --base-url=http://127.0.0.1:8010` passed against the freshly restarted local backend.
- Stage 933 evidence recorded `studyMemoryProgressPanelVisible: true`, `studyMemoryProgressTimelineVisible: true`, `studyMemoryProgressPeriodSwitches: true`, `studyMemoryProgressSourceScoped: true`, `studyMemoryProgressStageOpensQuestions: true`, retained `studyCollectionSubsetPanelVisible: true`, retained `studyQuestionReviewHistoryReviewFilteredHandoff: true`, retained `studyReviewProgressHeatmapVisible: true`, retained `studyKnowledgeStagePanelVisible: true`, retained `homeReviewScheduleLensVisible: true`, retained `sourceOverviewReviewPanelVisible: true`, cleanup dry-run `matchedCount: 0`, and `notesSidebarVisible: false`.
- Targeted backend, focused frontend, full App, frontend build, full backend API regression, `node --check`, Stage 932 Playwright, explicit cleanup dry-run, and `git diff --check` also passed as recorded in the Stage 932 plan.
- The audit confirmed the older `127.0.0.1:8000` process was stale during first browser validation; the green browser evidence was captured from `127.0.0.1:8010` after restarting the backend on current code.
