# Stage 939 - Post-Stage-938 Study Manual Question Creation Audit

## Status

Complete.

## Intent

Audit that manual Study question creation is source-owned, filter-aware, review-eligible, and compatible with the existing Study management stack.

## Scope

- Confirm global Study can create a source-grounded manual question.
- Confirm source-scoped Study preselects/preserves source scope after creation.
- Confirm `short_answer` and `flashcard` creation works.
- Confirm generated-card sync preserves manual cards.
- Confirm new cards compose with filters, scheduling, edit/delete, progress, source memory, Home review signals, and filtered Review.
- Retain Stage 937 edit/delete, Stage 935 schedule/unschedule, memory progress, collection subsets, review-history filters, habit heatmap, progress, Home review discovery, Study schedule drilldowns, Source overview, Reader, Notebook, Graph, Add Content, backend graph/notes/study contracts, cleanup dry-run, and `notesSidebarVisible: false`.

## Evidence Metrics

- `studyQuestionCreateDialogVisible`
- `studyQuestionCreateGlobalCreatesVisibleQuestion`
- `studyQuestionCreateSourceScopedPreservesSource`
- `studyQuestionCreateTypeSelectorWorks`
- `studyQuestionCreateReviewEligible`
- `studyQuestionCreateSurvivesGenerate`
- retained `studyQuestionEditRowActionWorks`
- retained `studyQuestionBulkDeleteVisibleSelectionWorks`
- retained `studyQuestionDeleteAdvancesReviewQueue`
- retained `studyQuestionSchedulingRowActionWorks`
- retained `studyQuestionSchedulingReviewFilteredSkipsUnscheduled`
- retained `studyMemoryProgressPanelVisible`
- retained `studyCollectionSubsetPanelVisible`
- retained `studyQuestionReviewHistoryReviewFilteredHandoff`
- retained `homeReviewScheduleLensVisible`
- retained cleanup dry-run `matchedCount: 0`
- retained `notesSidebarVisible: false`

## Validation Plan

- Run Stage 939 Playwright against the local app after Stage 938 passes.
- Run targeted and full frontend Vitest, frontend build, backend graph/notes/study pytest, `node --check`, cleanup dry-run, and `git diff --check`.
- Update roadmap and assistant anchors only after validation records Stage 939 as the completed audit gate.

## Validation Results

- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/App.test.tsx'`
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx src/lib/appRoute.test.ts'`
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm run build'`
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k "recall_study or study_progress or study_knowledge or graph or notes" -q'`
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/study_review_progress_shared.mjs && node --check scripts/playwright/stage938_study_manual_question_creation_after_stage937.mjs && node --check scripts/playwright/stage939_post_stage938_study_manual_question_creation_audit.mjs'`
- `node scripts/playwright/stage939_post_stage938_study_manual_question_creation_audit.mjs --base-url=http://127.0.0.1:8000`
- `node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=http://127.0.0.1:8000` dry-run, `matchedCount: 0`
- Stage 939 evidence: `output/playwright/stage939-post-stage938-study-manual-question-creation-audit.json`
