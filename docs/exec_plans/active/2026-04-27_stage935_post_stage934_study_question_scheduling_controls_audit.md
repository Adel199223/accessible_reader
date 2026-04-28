# Stage 935 - Post-Stage-934 Study Question Scheduling Controls Audit

## Status

Complete.

## Intent

Audit that Study question schedule/unschedule controls are visible, local-first, filter-aware, source-aware, and safe while retaining Stage 933 Study dashboard and cross-surface baselines.

## Scope

- Confirm Questions row Schedule / Unschedule controls update card status and visible filters.
- Confirm active Review schedule-state actions update the active card and advance safely when a card is unscheduled.
- Confirm `Review filtered` excludes unscheduled cards from its session queue.
- Confirm Home review-ready signals and Study dashboard buckets refresh from status changes without adding Home analytics objects.
- Retain memory progress, collection subsets, review-history filters, habit heatmap, memory stats, progress, Home review discovery, Study schedule drilldowns, Source overview, Reader, Notebook, Graph, Add Content, backend graph/notes/study contracts, cleanup dry-run, and `notesSidebarVisible: false`.

## Evidence Metrics

- `studyQuestionSchedulingRowActionWorks`
- `studyQuestionSchedulingReviewFilteredSkipsUnscheduled`
- `studyQuestionSchedulingActiveActionAdvances`
- `studyQuestionSchedulingHarnessDocumentsDeleted`
- `studyQuestionSchedulingHarnessProgressCleaned`
- retained `studyMemoryProgressPanelVisible`
- retained `studyCollectionSubsetPanelVisible`
- retained `studyQuestionReviewHistoryReviewFilteredHandoff`
- retained `studyReviewProgressHeatmapVisible`
- retained `homeReviewScheduleLensVisible`
- retained `sourceOverviewReviewPanelVisible`
- retained cleanup dry-run `matchedCount: 0`
- retained `notesSidebarVisible: false`

## Validation Plan

- Run Stage 935 Playwright against the local app after Stage 934 implementation passes.
- Run targeted and full frontend Vitest, frontend build, backend graph/notes/study pytest, `node --check`, cleanup dry-run, and `git diff --check`.
- Update roadmap and assistant anchors only after validation records Stage 935 as the completed audit gate.

## Evidence

- Stage 935 audit passed against the restarted local FastAPI app at `http://127.0.0.1:8000`.
- Validation:
  - `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/App.test.tsx'`
  - `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx src/lib/appRoute.test.ts'`
  - `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm run build'`
  - `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k "recall_study or study_progress or study_knowledge or graph or notes" -q'`
  - `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/study_review_progress_shared.mjs && node --check scripts/playwright/stage934_study_question_scheduling_controls_after_stage933.mjs && node --check scripts/playwright/stage935_post_stage934_study_question_scheduling_controls_audit.mjs'`
  - `node scripts/playwright/stage934_study_question_scheduling_controls_after_stage933.mjs --base-url=http://127.0.0.1:8000`
  - `node scripts/playwright/stage935_post_stage934_study_question_scheduling_controls_audit.mjs --base-url=http://127.0.0.1:8000`
  - `node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=http://127.0.0.1:8000` dry-run, `matchedCount: 0`
  - `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader && git diff --check'`
