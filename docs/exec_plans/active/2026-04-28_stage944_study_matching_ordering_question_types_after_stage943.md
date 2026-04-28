# Stage 944 - Study Matching Ordering Question Types After Stage 943

## Status

Complete.

## Intent

Complete the current local Recall-style seven-question-type Study foundation by adding source-owned manual `matching` and `ordering` cards after Stage 942/943 fill-in-the-blank and short-answer attempt feedback.

## Scope

- Add manual `matching` and `ordering` Study card types alongside existing `short_answer`, `flashcard`, `multiple_choice`, `true_false`, and `fill_in_blank`.
- Store type-specific payloads in existing `scheduling_state_json.manual_question_payload`; no schema migration.
- Keep `answer` as a canonical text summary for search, previews, edit/delete compatibility, review reveal, portability, and generated-card sync preservation.
- Validate `matching` as 2-8 unique trimmed pairs with nonblank left/right values.
- Validate `ordering` as 2-8 unique trimmed ordered items.
- Add Matching and Ordering controls to `New question`, row edit, Study Questions rows/search, and active Review.
- Keep matching/ordering attempts local UI state only; FSRS scheduling changes only through the existing rating row.
- Keep Home discovery-only and source-card-owned; do not add AI generation, CSV import, hints, explanations, timed questions, shared challenges, persisted attempt analytics, or Reader output changes.

## Evidence Metrics

- `studyMatchingQuestionCreates`
- `studyOrderingQuestionCreates`
- `studyMatchingOrderingSearchFindsPayloadText`
- `studyMatchingQuestionReviewSelectionState`
- `studyOrderingQuestionReviewReorderState`
- `studyMatchingOrderingEditPreservesPayload`
- `studyMatchingOrderingSurvivesGenerate`
- retained Stage 943 fill-in-the-blank/short-answer metrics
- retained Stage 941 choice metrics
- retained edit/delete/scheduling/progress/subset/review-history/Home review/source overview metrics
- cleanup dry-run `matchedCount: 0`
- `notesSidebarVisible: false`

## Validation Plan

- Backend pytest for matching/ordering create/update validation, missing-source rejection, canonical answer summaries, serialization, search material, schedule/review/delete compatibility, generated-sync preservation, source-scoped lists, progress/stage counts, and no schema migration.
- Frontend App tests for global matching creation, source-scoped ordering creation, edit payload preservation, search by pair/item text, Review matching selection, Review ordering reorder/reveal, rating after attempts, filtered Review queue compatibility, and retained Stage 942 fill-in-the-blank/short-answer behavior.
- Add `scripts/playwright/stage944_study_matching_ordering_question_types_after_stage943.mjs`.
- Add `scripts/playwright/stage945_post_stage944_study_matching_ordering_question_types_audit.mjs`.
- Run targeted Vitest, full `App.test.tsx`, frontend build, backend graph/notes/study pytest, `node --check`, Stage 944/945 Playwright, cleanup dry-run, and `git diff --check`.

## Validation Results

- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k "matching_and_ordering or fill_in_blank or choice_question_types" -q'` passed.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm exec tsc -- -b --pretty false'` passed.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/App.test.tsx -t "Study manual choice questions|Study fill-in-the-blank questions|Study matching questions|Study source-scoped ordering questions|Study short-answer review"'` passed.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/App.test.tsx'` passed on rerun.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm run build'` passed.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k "graph or note or study" -q'` passed.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/study_review_progress_shared.mjs && node --check scripts/playwright/stage944_study_matching_ordering_question_types_after_stage943.mjs && node --check scripts/playwright/stage945_post_stage944_study_matching_ordering_question_types_audit.mjs'` passed.
- `RECALL_STAGE944_BASE_URL=http://127.0.0.1:8011 node scripts/playwright/stage944_study_matching_ordering_question_types_after_stage943.mjs` passed with live browser evidence.
- `node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=http://127.0.0.1:8011` passed as dry-run with `matchedCount: 0`.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader && git diff --check'` passed.
