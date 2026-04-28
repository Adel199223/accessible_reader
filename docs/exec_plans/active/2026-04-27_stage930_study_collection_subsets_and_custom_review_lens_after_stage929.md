# Stage 930 - Study Collection Subsets And Custom Review Lens After Stage 929

## Status

Complete.

## Intent

Add a Study-first custom review subset lens by reusing existing Home static/custom collections as local tag-like filters for Study Questions and filtered Review sessions.

## Scope

- Add frontend continuity state `study.collectionFilter`, defaulting to `all`.
- Support static subset filters for Web, Documents, Captures, and Untagged, plus custom Home collections by id.
- Derive subset membership locally from `RecallDocumentRecord`, Home custom collections, and `StudyCardRecord.source_document_id`; no backend schema/API changes.
- Add a compact Study dashboard `Review subsets` panel with Study-card counts and Questions handoffs.
- Compose subset filtering with source scope, status, schedule drilldowns, knowledge-stage filters, review-history filters, and question search.
- Add clearable active subset filter chips and keep `Clear filters` source-scope preserving.
- Keep `Review filtered` advancing inside the visible filtered queue.
- Do not add backend tags, Home analytics objects, Personal notes mixing, schedule/unschedule controls, question edit/delete/bulk management, notifications, timed questions, or shared challenges.

## Evidence Metrics

- `studyCollectionSubsetPanelVisible`
- `studyCollectionSubsetStaticRowsVisible`
- `studyCollectionSubsetCustomRowsVisible`
- `studyCollectionSubsetOpensQuestions`
- `studyCollectionSubsetFilterStackVisible`
- `studyCollectionSubsetClearFiltersWorks`
- `studyCollectionSubsetReviewFilteredHandoff`
- retained Stage 929 review-history metrics
- retained Stage 927 habit calendar metrics
- retained Stage 925 memory stats metrics
- retained Stage 923 progress metrics
- retained Stage 921 Home review schedule metrics
- retained cleanup dry-run `matchedCount: 0`

## Validation Plan

- Add App tests for static subset filters, custom collection subset filters, untagged filtering, source-scope composition, composition with review-history/search/schedule/knowledge filters, clear behavior, missing custom collection fallback, and filtered Review queue advancement.
- Add route/default continuity coverage for `study.collectionFilter`.
- Add `scripts/playwright/stage930_study_collection_subsets_and_custom_review_lens_after_stage929.mjs`.
- Run targeted Vitest, full `App.test.tsx`, frontend build, backend graph/notes/study pytest, `node --check`, Stage 930/931 Playwright evidence, cleanup dry-run, and `git diff --check`.

## Evidence

- Added `study.collectionFilter` continuity with static source subsets and Home custom collection subset values.
- Added the Study dashboard `Review subsets` panel, clearable `Subset` filter chips, missing-custom fallback to `all`, and filtered Review queue composition.
- Added Vitest coverage for static/custom/untagged subsets, filter composition, clear behavior, missing custom collection fallback, and filtered Review advancement.
- Added Playwright evidence harness `scripts/playwright/stage930_study_collection_subsets_and_custom_review_lens_after_stage929.mjs`.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/App.test.tsx'` passed, 123 tests.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k "recall_study or study_progress or study_knowledge or graph or notes" -q'` passed, 9 tests.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm run build'` passed.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/study_review_progress_shared.mjs && node --check scripts/playwright/stage930_study_collection_subsets_and_custom_review_lens_after_stage929.mjs && node --check scripts/playwright/stage931_post_stage930_study_collection_subsets_and_custom_review_lens_audit.mjs'` passed.
- `node scripts/playwright/stage930_study_collection_subsets_and_custom_review_lens_after_stage929.mjs --base-url=http://127.0.0.1:8000` passed with `studyCollectionSubsetPanelVisible: true`, `studyCollectionSubsetStaticRowOpensQuestions: true`, `studyCollectionSubsetActiveFilterStackVisible: true`, `studyCollectionSubsetClearFiltersWorks: true`, `studyCollectionSubsetReviewFilteredHandoff: true`, `cleanupUtilityDryRunMatchedAfterApply: 0`, and `notesSidebarVisible: false`.
- `node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=http://127.0.0.1:8000` dry-run matched 0 historical Stage-marker source notes.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader && git diff --check'` passed.
