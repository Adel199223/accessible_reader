# Stage 937 - Post-Stage-936 Study Question Edit/Delete Management Audit

## Status

Complete.

## Intent

Audit that Study question edit/delete controls are visible, local-first, filter-aware, source-aware, and safe while retaining Stage 935 scheduling and Stage 933 dashboard baselines.

## Scope

- Confirm Questions row Edit/Delete and active Review Edit/Delete update cards and review queues safely.
- Confirm selected visible bulk delete affects only selected visible rows.
- Confirm generated Study sync preserves manual edits and soft-deleted cards.
- Confirm Home review-ready signals, Study dashboards, Source overview memory, and review queues hide deleted cards without adding Home analytics objects.
- Retain schedule/unschedule, memory progress, collection subsets, review-history filters, habit heatmap, memory stats, progress, Home review discovery, Study schedule drilldowns, Source overview, Reader, Notebook, Graph, Add Content, backend graph/notes/study contracts, cleanup dry-run, and `notesSidebarVisible: false`.

## Evidence Metrics

- `studyQuestionEditRowActionWorks`
- `studyQuestionEditActiveActionWorks`
- `studyQuestionDeleteRowActionWorks`
- `studyQuestionBulkDeleteVisibleSelectionWorks`
- `studyQuestionDeleteAdvancesReviewQueue`
- `studyQuestionManagementPreservesScheduleControls`
- retained `studyQuestionSchedulingRowActionWorks`
- retained `studyQuestionSchedulingReviewFilteredSkipsUnscheduled`
- retained `studyQuestionSchedulingActiveActionAdvances`
- retained `studyMemoryProgressPanelVisible`
- retained `studyCollectionSubsetPanelVisible`
- retained `studyQuestionReviewHistoryReviewFilteredHandoff`
- retained `studyReviewProgressHeatmapVisible`
- retained `homeReviewScheduleLensVisible`
- retained `sourceOverviewReviewPanelVisible`
- retained cleanup dry-run `matchedCount: 0`
- retained `notesSidebarVisible: false`

## Validation Plan

- Run Stage 937 Playwright against the local app after Stage 936 implementation passes.
- Run targeted and full frontend Vitest, frontend build, backend graph/notes/study pytest, `node --check`, cleanup dry-run, and `git diff --check`.
- Update roadmap and assistant anchors only after validation records Stage 937 as the completed audit gate.

## Validation Results

- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/App.test.tsx'`
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx src/lib/appRoute.test.ts'`
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm run build'`
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k "study_card_edit_and_soft_delete_management or study_card_schedule_state_controls or recall_study or study_progress or study_knowledge or graph or notes" -q'`
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/study_review_progress_shared.mjs && node --check scripts/playwright/stage936_study_question_edit_delete_management_after_stage935.mjs && node --check scripts/playwright/stage937_post_stage936_study_question_edit_delete_management_audit.mjs'`
- `node scripts/playwright/stage936_study_question_edit_delete_management_after_stage935.mjs --base-url=http://127.0.0.1:8000`
- `node scripts/playwright/stage937_post_stage936_study_question_edit_delete_management_audit.mjs --base-url=http://127.0.0.1:8000`
- `node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=http://127.0.0.1:8000` dry-run matched `0`.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader && git diff --check'`

## Evidence

- `output/playwright/stage937-study-question-edit-delete-management-audit.json`
- Required metrics passed: `studyQuestionEditRowActionWorks`, `studyQuestionEditActiveActionWorks`, `studyQuestionDeleteRowActionWorks`, `studyQuestionBulkDeleteVisibleSelectionWorks`, `studyQuestionDeleteAdvancesReviewQueue`, `studyQuestionManagementPreservesScheduleControls`, `studyQuestionSchedulingRowActionWorks`, `studyQuestionSchedulingReviewFilteredSkipsUnscheduled`, `studyQuestionSchedulingActiveActionAdvances`, `studyMemoryProgressPanelVisible`, `studyCollectionSubsetPanelVisible`, `studyQuestionReviewHistoryReviewFilteredHandoff`, `studyReviewProgressHeatmapVisible`, `homeReviewScheduleLensVisible`, `homeMemoryFilterControlsVisible`, `homeReviewReadySourceSignalsVisible`, `sourceOverviewReviewPanelVisible`, `sourceOverviewMemoryStackVisible`, cleanup dry-run `matchedCount: 0`, and `notesSidebarVisible: false`.
