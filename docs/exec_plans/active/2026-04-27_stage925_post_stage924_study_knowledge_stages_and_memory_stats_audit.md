# Stage 925 - Post-Stage-924 Study Knowledge Stages And Memory Stats Audit

## Status

Complete.

## Intent

Audit that the Study knowledge-stage memory-stats lens is visible, actionable, source-scoped, and composed with existing Study filters while preserving the Stage 923 progress dashboard and stable Recall workspace regressions.

## Scope

- Confirm Study cards expose derived knowledge stages without a backend schema migration.
- Confirm the Study dashboard memory-stats panel shows stage distribution and source rows.
- Confirm stage chips open filtered Study Questions.
- Confirm knowledge-stage filters compose with source scope, question search, status tabs, and schedule drilldowns.
- Confirm filter chips and empty states are clearable.
- Confirm rating a card refreshes memory stats.
- Retain Study progress, Home review filters/signals, Study schedule drilldowns, Source overview review/search/memory, Reader, Notebook, Graph, Add Content, cleanup dry-run, generated Reader outputs, and backend graph/notes regression surfaces.

## Evidence Metrics

- `studyKnowledgeStageCountsVisible`
- `studyKnowledgeStageChipOpensQuestions`
- `studyKnowledgeStageFilterComposesWithSearch`
- `studyKnowledgeStageFilterComposesWithSchedule`
- `studyKnowledgeStageFilterClearable`
- `studyKnowledgeStageSourceScoped`
- `studyKnowledgeStageSourceRowsVisible`
- retained Stage 922/923 Study progress metrics
- retained Stage 920/921 Home review schedule lens metrics
- retained Stage 918/919 Study schedule drilldown metrics
- retained cleanup dry-run `matchedCount: 0`
- retained `notesSidebarVisible: false`

## Validation Plan

- Done: `node scripts/playwright/stage925_post_stage924_study_knowledge_stages_and_memory_stats_audit.mjs --base-url=http://127.0.0.1:8010`
- Done: targeted App Vitest, frontend build, backend graph/notes/progress pytest.
- Done: `node --check` for the shared Study progress harness and Stage 924/925 scripts.
- Done: cleanup utility dry-run remained `matchedCount: 0`.
- Done: `git diff --check`.

## Evidence

- `stage925-post-stage924-study-knowledge-stages-and-memory-stats-audit-validation.json`: `studyKnowledgeStagePanelVisible: true`, `studyKnowledgeStageTotalCount: 103`, `studyKnowledgeStageChipOpensQuestions: true`, `studyKnowledgeStageSourceRowOpensQuestions: true`, `studyKnowledgeStageSourceScoped: true`, `studyReviewProgressPanelVisible: true`, `homeReviewScheduleLensVisible: true`, `studyScheduleDueBucketOpensQuestions: true`, `cleanupUtilityDryRunMatchedAfterApply: 0`, `notesSidebarVisible: false`.
- Retained regression metrics included Home review schedule, Home memory filters, Home review-ready signals, Source overview review/search/memory, Study schedule drilldowns, Study progress, Reader, Notebook, Graph, focused split, cleanup hygiene, and no visible legacy Notes sidebar.
