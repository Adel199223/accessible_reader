# Stage 915 - Post-Stage-914 Source Review Queue And Study Question Find Audit

## Status

Complete.

## Intent

Stage 915 audits that Stage 914 source-scoped review and question find works without disturbing the Stage 912 source-memory search baseline, Home memory discovery, Notebook source-note semantics, Graph/Study promotion evidence, cleanup hygiene, or generated Reader output freeze.

## Scope

- Re-run Source overview review panel evidence for source-owned counts and handoffs.
- Confirm Study opens source-scoped Review and Questions from Source overview and Reader.
- Confirm `Search questions` finds prompt and evidence text inside the source scope and has a clearable empty state.
- Confirm rating a source-scoped review card stays in source scope and advances to source-local cards when available.
- Retain Stage 912 source-memory search, Stage 910 Home memory filters, Stage 908 source-memory signals, Stage 906 memory stack, cleanup dry-run, and broad Home/Reader/Notebook/Graph/Study/Add Content regression surfaces.

## Evidence Metrics

- `sourceOverviewReviewPanelVisible`
- `sourceOverviewReviewUsesSourceOwnedCounts`
- `sourceOverviewReviewDueHandoffOpensSourceScopedStudy`
- `sourceOverviewReviewQuestionsHandoffOpensSourceScopedQuestions`
- `studySourceScopedQueueVisible`
- `studySourceScopedQuestionSearchVisible`
- `studySourceScopedQuestionSearchFindsPrompt`
- `studySourceScopedQuestionSearchFindsEvidence`
- `studySourceScopedReviewStaysInSourceAfterRating`
- `readerSourceStudyCountOpensSourceScopedStudy`
- retained Stage 912/913 source-memory search metrics
- retained Stage 910/911 Home memory-filter metrics
- retained Stage 908/909 Home source-memory metrics
- retained Stage 906/907 source-memory metrics
- retained Stage 904/905 cleanup metrics
- retained broad Home/Reader/Notebook/Graph/Study/Add Content regression metrics
- retained `notesSidebarVisible: false`

## Validation Plan

- `node scripts/playwright/stage915_post_stage914_source_review_queue_and_study_question_find_audit.mjs`
- targeted App Vitest, frontend build, backend graph/notes pytest
- `node --check` for shared Notebook/Home harnesses and Stage 914/915 scripts
- cleanup utility dry-run remains `matchedCount: 0`
- `git diff --check`

## Evidence

- Live Stage 915 browser audit passed and wrote `output/playwright/stage915-post-stage914-source-review-queue-and-study-question-find-audit-validation.json`.
- Required Stage 914/915 metrics passed: `sourceOverviewReviewPanelVisible`, `sourceOverviewReviewUsesSourceOwnedCounts`, `sourceOverviewReviewDueHandoffOpensSourceScopedStudy`, `sourceOverviewReviewQuestionsHandoffOpensSourceScopedQuestions`, `studySourceScopedQueueVisible`, `studySourceScopedQuestionSearchVisible`, `studySourceScopedQuestionSearchFindsPrompt`, `studySourceScopedQuestionSearchFindsEvidence`, `studySourceScopedReviewStaysInSourceAfterRating`, and `readerSourceStudyCountOpensSourceScopedStudy`.
- Retained regression metrics passed, including `sourceMemorySearchControlsVisible`, `homeMemoryFilterControlsVisible`, `homeSourceMemorySignalsVisible`, `sourceOverviewMemoryStackVisible`, `readerSourceMemoryCountsActionable`, `stageHarnessCreatedNotesCleanedUp`, cleanup dry-run `matchedCount: 0`, and `notesSidebarVisible: false`.
- Targeted App Vitest, frontend build, backend graph/notes pytest, Node syntax checks, live Stage 914 evidence, live Stage 915 evidence, cleanup dry-run, and `git diff --check` were run as the Stage 914/915 closeout gate.
