# Stage 941 - Post-Stage-940 Study Choice Question Types Audit

## Status

Completed.

## Intent

Audit that manual multiple-choice and true/false Study cards are source-owned, typed, searchable, editable, reviewable, and compatible with the existing Study management stack.

## Scope

- Confirm global Study can create a source-grounded multiple-choice card.
- Confirm source-scoped Study can create a true/false card while preserving source scope.
- Confirm row edit preserves and updates type-specific payload for the existing card type.
- Confirm typed Review lets a user select an option, reveals correct/incorrect state locally, then uses the existing rating row.
- Confirm choice text participates in Study Questions search.
- Confirm generated-card sync preserves manual choice cards.
- Confirm choice cards compose with source scope, collection subsets, status, schedule, knowledge-stage, review-history, search, schedule/unschedule, edit/delete, bulk delete, progress, memory stats, Home review signals, and filtered Review.
- Retain Stage 939 manual creation, Stage 937 edit/delete, Stage 935 schedule/unschedule, memory progress, collection subsets, review-history filters, habit heatmap, progress, Home review discovery, Study schedule drilldowns, Source overview, Reader, Notebook, Graph, Add Content, backend graph/notes/study contracts, cleanup dry-run, and `notesSidebarVisible: false`.

## Evidence Metrics

- `studyChoiceQuestionCreateDialogVisible`
- `studyChoiceQuestionMultipleChoiceCreates`
- `studyChoiceQuestionTrueFalseCreates`
- `studyChoiceQuestionTypedReviewOptionSelection`
- `studyChoiceQuestionTypedReviewCorrectState`
- `studyChoiceQuestionEditPreservesPayload`
- `studyChoiceQuestionSearchFindsChoiceText`
- `studyChoiceQuestionSurvivesGenerate`
- retained `studyQuestionCreateGlobalCreatesVisibleQuestion`
- retained `studyQuestionCreateSourceScopedPreservesSource`
- retained `studyQuestionCreateReviewEligible`
- retained `studyQuestionEditRowActionWorks`
- retained `studyQuestionBulkDeleteVisibleSelectionWorks`
- retained `studyQuestionSchedulingRowActionWorks`
- retained `studyMemoryProgressPanelVisible`
- retained `studyCollectionSubsetPanelVisible`
- retained `studyQuestionReviewHistoryReviewFilteredHandoff`
- retained `homeReviewScheduleLensVisible`
- retained cleanup dry-run `matchedCount: 0`
- retained `notesSidebarVisible: false`

## Validation Plan

- Run Stage 941 Playwright against the local app after Stage 940 passes.
- Run targeted and full frontend Vitest, frontend build, backend graph/notes/study pytest, `node --check`, cleanup dry-run, and `git diff --check`.
- Update roadmap and assistant anchors only after validation records Stage 941 as the completed audit gate.

## Validation Results

- Passed Stage 941 Playwright audit against a fresh local validation server on `http://127.0.0.1:8010`.
- Audit evidence retained choice-question metrics: dialog visibility, multiple-choice creation, true/false creation, typed Review option selection, correct/incorrect reveal state, search by choice text, edit payload preservation, and generated-sync survival.
- Audit evidence retained Stage 939 manual creation, Stage 937 edit/delete, Stage 935 scheduling, memory progress, collection subsets, review-history filters, habit/progress, Home review, Source overview, Reader, Notebook, Graph, Add Content, backend graph/notes/study contracts, `notesSidebarVisible: false`, and cleanup dry-run `matchedCount: 0`.
- Passed targeted and full frontend Vitest, frontend build, backend graph/notes/study pytest, and `node --check` for the new Stage 940/941 scripts before the browser audit.
- Passed `git diff --check`.
