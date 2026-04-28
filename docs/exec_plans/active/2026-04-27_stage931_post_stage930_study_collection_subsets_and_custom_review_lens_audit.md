# Stage 931 - Post-Stage-930 Study Collection Subsets And Custom Review Lens Audit

## Status

Complete.

## Intent

Audit that Study collection subsets are discoverable, composable, and actionable while preserving the Stage 929 Study review-history queue, progress, memory, Home review discovery, Source overview, Reader, Notebook, Graph, Add Content, and cleanup baselines.

## Scope

- Confirm Review subsets panel renders static and custom subset counts.
- Confirm subset rows open Questions with a clearable subset filter.
- Confirm subset filters compose with source scope, schedule, knowledge-stage, review-history, status, and search.
- Confirm `Clear filters` preserves source scope and resets subset filters.
- Confirm `Review filtered` starts and advances inside the active subset queue.
- Confirm missing custom collections reset the Study collection filter to `all`.
- Confirm Home remains source-card-owned and Personal notes stay note-owned.

## Evidence Metrics

- `studyCollectionSubsetPanelVisible`
- `studyCollectionSubsetOpensQuestions`
- `studyCollectionSubsetFilterStackVisible`
- `studyCollectionSubsetClearFiltersWorks`
- `studyCollectionSubsetReviewFilteredHandoff`
- retained `studyQuestionReviewHistoryRatingChipOpensQuestions`
- retained `studyQuestionReviewHistoryClearFiltersWorks`
- retained `studyReviewProgressHeatmapVisible`
- retained `studyKnowledgeStagePanelVisible`
- retained `homeReviewScheduleLensVisible`
- retained `sourceOverviewReviewPanelVisible`
- retained cleanup dry-run `matchedCount: 0`
- retained `notesSidebarVisible: false`

## Validation Plan

- Run `scripts/playwright/stage931_post_stage930_study_collection_subsets_and_custom_review_lens_audit.mjs` against the local app.
- Run targeted and full frontend Vitest, frontend build, backend graph/notes/study pytest, `node --check`, cleanup dry-run, and `git diff --check`.
- Update roadmap and assistant anchors only after validation records Stage 931 as the completed audit gate.

## Evidence

- Added `scripts/playwright/stage931_post_stage930_study_collection_subsets_and_custom_review_lens_audit.mjs`.
- Stage 931 audit retained Stage 929 review-history filters/filtered Review queue, Stage 927 habit heatmap, Stage 925 knowledge-stage stats, Stage 923 progress, Stage 921 Home review discovery, source review, Home memory filters, Source overview, and cleanup hygiene.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/App.test.tsx'` passed, 123 tests.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k "recall_study or study_progress or study_knowledge or graph or notes" -q'` passed, 9 tests.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm run build'` passed.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/study_review_progress_shared.mjs && node --check scripts/playwright/stage930_study_collection_subsets_and_custom_review_lens_after_stage929.mjs && node --check scripts/playwright/stage931_post_stage930_study_collection_subsets_and_custom_review_lens_audit.mjs'` passed.
- `node scripts/playwright/stage931_post_stage930_study_collection_subsets_and_custom_review_lens_audit.mjs --base-url=http://127.0.0.1:8000` passed in `msedge` with `studyCollectionSubsetPanelVisible: true`, `studyCollectionSubsetRowsVisible: true`, `studyCollectionSubsetStaticRowOpensQuestions: true`, `studyCollectionSubsetActiveFilterStackVisible: true`, `studyCollectionSubsetClearFiltersWorks: true`, `studyCollectionSubsetReviewFilteredHandoff: true`, `sourceOverviewReviewPanelVisible: true`, `cleanupUtilityDryRunMatchedAfterApply: 0`, and `notesSidebarVisible: false`.
- `node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=http://127.0.0.1:8000` dry-run matched 0 historical Stage-marker source notes.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader && git diff --check'` passed.
