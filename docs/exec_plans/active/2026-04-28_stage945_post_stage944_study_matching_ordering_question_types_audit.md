# Stage 945 - Post-Stage-944 Study Matching Ordering Question Types Audit

## Status

Complete.

## Intent

Audit that matching and ordering cards complete the local seven-type Study foundation while preserving the existing Study management, review, dashboard, Home discovery, and source overview regression surfaces.

## Scope

- Confirm global Study can create a source-grounded matching card.
- Confirm source-scoped Study can create ordering cards while preserving source scope.
- Confirm row edit preserves and updates matching pair and ordering item payloads.
- Confirm Matching Review lets a user select right-side matches, reveals local selected/correct state, then uses the existing rating row.
- Confirm Ordering Review lets a user reorder items locally, reveals correct/incorrect position state, then uses the existing rating row.
- Confirm matching pair text and ordering item text participate in Study Questions search.
- Confirm generated-card sync preserves manual matching and ordering cards.
- Retain Stage 943 fill-in-the-blank/short-answer attempts, Stage 941 choice question types, Stage 939 manual creation, Stage 937 edit/delete, Stage 935 schedule/unschedule, memory progress, collection subsets, review-history filters, habit heatmap, progress, Home review discovery, Study schedule drilldowns, Source overview, Reader, Notebook, Graph, Add Content, backend graph/notes/study contracts, cleanup dry-run, and `notesSidebarVisible: false`.

## Evidence Metrics

- `studyMatchingQuestionCreates`
- `studyOrderingQuestionCreates`
- `studyMatchingOrderingSearchFindsPayloadText`
- `studyMatchingQuestionReviewSelectionState`
- `studyOrderingQuestionReviewReorderState`
- `studyMatchingOrderingEditPreservesPayload`
- `studyMatchingOrderingSurvivesGenerate`
- retained `studyFillBlankCreatesVisibleQuestion`
- retained `studyShortAnswerAttemptFeedbackVisible`
- retained `studyChoiceQuestionMultipleChoiceCreates`
- retained `studyChoiceQuestionTrueFalseCreates`
- retained `studyQuestionCreateGlobalCreatesVisibleQuestion`
- retained `studyQuestionEditRowActionWorks`
- retained `studyQuestionSchedulingRowActionWorks`
- retained `studyMemoryProgressPanelVisible`
- retained `studyCollectionSubsetPanelVisible`
- retained `studyQuestionReviewHistoryReviewFilteredHandoff`
- retained cleanup dry-run `matchedCount: 0`
- retained `notesSidebarVisible: false`

## Validation Plan

- Run Stage 945 Playwright against the local app after Stage 944 passes.
- Run targeted and full frontend Vitest, frontend build, backend graph/notes/study pytest, `node --check`, cleanup dry-run, and `git diff --check`.
- Update roadmap and assistant anchors only after validation records Stage 945 as the completed audit gate.

## Validation Results

- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k "matching_and_ordering or fill_in_blank or choice_question_types" -q'` passed.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm exec tsc -- -b --pretty false'` passed.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/App.test.tsx -t "Study manual choice questions|Study fill-in-the-blank questions|Study matching questions|Study source-scoped ordering questions|Study short-answer review"'` passed.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/App.test.tsx'` passed on rerun.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm run build'` passed.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k "graph or note or study" -q'` passed.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/study_review_progress_shared.mjs && node --check scripts/playwright/stage944_study_matching_ordering_question_types_after_stage943.mjs && node --check scripts/playwright/stage945_post_stage944_study_matching_ordering_question_types_audit.mjs'` passed.
- `RECALL_STAGE944_BASE_URL=http://127.0.0.1:8011 node scripts/playwright/stage944_study_matching_ordering_question_types_after_stage943.mjs` passed with live browser evidence.
- `RECALL_STAGE945_BASE_URL=http://127.0.0.1:8011 node scripts/playwright/stage945_post_stage944_study_matching_ordering_question_types_audit.mjs` passed with live browser evidence.
- `node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=http://127.0.0.1:8011` passed as dry-run with `matchedCount: 0`.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader && git diff --check'` passed.
