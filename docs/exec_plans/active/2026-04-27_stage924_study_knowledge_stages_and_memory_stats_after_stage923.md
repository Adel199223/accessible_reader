# Stage 924 - Study Knowledge Stages And Memory Stats After Stage 923

## Status

Complete.

## Intent

Add a Study-first memory-stats lens over existing local Study card state so Stage 922 review progress also communicates where questions sit in the user's current knowledge lifecycle.

## Scope

- Derive public Study knowledge stages from existing local card scheduling state: `new`, `learning`, `practiced`, `confident`, and `mastered`.
- Expose `knowledge_stage` on Study cards and add stage-count/source-stage progress fields to `/api/recall/study/progress`.
- Add a compact Study dashboard memory-stats panel with stage distribution and source rows.
- Let stage chips open Study Questions filtered to the matching stage, composing with source scope, search, status tabs, and schedule drilldowns.
- Preserve Stage 922 progress, Stage 920 Home review discovery, Study schedule drilldowns, Source overview review/search/memory, Reader, Notebook, Graph, Add Content, cleanup hygiene, and generated Reader output invariants.
- Do not add schema migrations, historical stage-transition charts, schedule/unschedule controls, notifications, streak settings, shared challenges, timed questions, new question types, AI generation, import changes, or Home analytics objects.

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

- Done: targeted backend pytest for knowledge-stage derivation, Study card serialization, progress stage counts, source filtering, and no-review behavior.
- Done: targeted App Vitest for memory-stats rendering, source-scoped counts, stage-chip Questions handoff, filter composition, clear behavior, and refresh after rating.
- Done: frontend build.
- Done: `node --check scripts/playwright/study_review_progress_shared.mjs`, `stage924_study_knowledge_stages_and_memory_stats_after_stage923.mjs`, and `stage925_post_stage924_study_knowledge_stages_and_memory_stats_audit.mjs`.
- Done: live Stage 924 and Stage 925 browser evidence against a current-code local server on `http://127.0.0.1:8010`.
- Done: cleanup utility dry-run remained `matchedCount: 0`.
- Done: `git diff --check`.

## Evidence

- `stage924-study-knowledge-stages-and-memory-stats-validation.json`: `studyKnowledgeStagePanelVisible: true`, `studyKnowledgeStageTotalCount: 103`, `studyKnowledgeStageChipOpensQuestions: true`, `studyKnowledgeStageSourceRowOpensQuestions: true`, `studyKnowledgeStageSourceScoped: true`, `studyReviewProgressPanelVisible: true`, `homeReviewScheduleLensVisible: true`, `studyScheduleDueBucketOpensQuestions: true`, `cleanupUtilityDryRunMatchedAfterApply: 0`, `notesSidebarVisible: false`.
- Targeted validations passed:
  - `uv run pytest tests/test_api.py -k "study_progress or study_knowledge"`
  - `uv run pytest tests/test_api.py -k "recall_study or graph or notes"`
  - `npm test -- src/App.test.tsx`
  - `npm test -- src/lib/appRoute.test.ts src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
  - `npm run build`
