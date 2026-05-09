# Stage 988 Multi-Card Highlight Study Coverage Selection

## Summary
Harden the local highlight review loop when more than one Study card references the same `recall_notes.id`. Stage 984-987 made covered highlights reviewable through existing Study cards and then marked linked highlights reviewed after practice; the next correctness layer is making coverage selection card-set aware so one stale, scheduled, or unscheduled card cannot hide another ready local card for the same highlight.

This keeps the Recall-like saved-knowledge and review loop focused on local notes, review, and personal recall while staying inside the repo brief. It does not add cloud sync, chat/API work, generated Reader-output changes, FSRS changes, or a new public API shape.

Sources: [Recall 2.0 changelog](https://feedback.getrecall.ai/changelog), [Quiz 2.0 review workflow](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-19-2026-quiz-20-with-shared-challenges), [Recall docs](https://docs.recall.it/), [Recall review content docs](https://docs.recall.it/getting-started/6-review-content), [Recall note-taking docs](https://docs.recall.it/deep-dives/note-taking-in-recall).

## Key Changes
- Replace single-card-only internal highlight Study coverage selection with card-set-aware coverage details.
- Keep `study_covered` true when any non-deleted local Study card references a note.
- Prefer a reviewable `due` / `new` linked card for row-level `study_card_id`; fall back to scheduled and then unscheduled cards.
- Derive `reviewable_study_card_ids` from all linked `due` / `new` cards for each covered highlight row, deduped in inbox row order.
- Keep `reviewable_covered_items` as a note/item count, not a card count.
- Preserve existing response fields and frontend types for Stage 988.

## Public APIs / Types
- No new endpoint.
- No new response field.
- `HighlightReviewInboxRow.study_card_id` continues to expose one row-level handoff card, now selected by reviewability priority.
- `HighlightReviewInboxResponse.reviewable_study_card_ids` continues to expose queue cards, now from every reviewable linked card instead of only the chosen single coverage card.

## Implementation Tasks
1. Backend TDD:
   - Add a failing `backend/tests/test_api.py` test that creates one highlight note, promotes it to Study card A, creates card B, rewires B to the same note span, unschedules B so it is newest but not reviewable, and verifies the covered inbox still reports card A as reviewable and as the row handoff.
   - Assert `covered_items == 1`, `reviewable_covered_items == 1`, and no duplicate covered rows.
2. Backend storage:
   - Add a private internal helper that returns coverage entries grouped by note id, including card id, status, and updated time.
   - Make the existing single-card helper choose the preferred card from those entries for compatibility.
   - Update `get_highlight_review_inbox` to use grouped entries for row `study_card_id`, reviewable summary counts, and `reviewable_study_card_ids`.
3. Frontend compatibility:
   - Adjust the App test highlight inbox mock so it can model multiple Study cards for one note and prefers reviewable cards the same way the backend does.
   - Add one focused App test assertion if existing UI tests do not already cover preferred row handoff.
4. Browser evidence:
   - Add `scripts/playwright/stage988_multicard_highlight_study_coverage_selection_after_stage987.mjs` to create the duplicate-card condition, verify covered row `Open Study card` opens the reviewable card, verify `Review covered highlights` starts with the reviewable card, and retain Notebook promotion, generated-output freeze, and cleanup dry-run `matchedCount: 0`.
5. Docs and audit:
   - Create Stage 989 audit plan.
   - Update `BUILD_BRIEF.md`, `docs/ROADMAP.md`, `docs/ROADMAP_ANCHOR.md`, `agent.md`, and `docs/assistant/INDEX.md` after validation.

## Test Plan
- Backend focused new test, then `backend/tests/test_api.py`.
- Frontend typecheck, focused `App.test.tsx`, `api.test.ts`, full Vitest, and build.
- Stage 988 Playwright evidence.
- Stage 986, 984, 982, 980, 978, 976, and 975 regression ladder as time allows against the same live URL.
- Cleanup dry-run `matchedCount: 0`.
- `git diff --check`.

## Implementation Notes
- Added grouped Study coverage entries by note id in backend storage, sorted by due/new/scheduled/unscheduled priority.
- Kept the compatibility single-card coverage helper, now backed by the grouped entries.
- Updated `GET /api/recall/library/highlight-review-inbox` so row `study_card_id`, `reviewable_study_card_ids`, and `reviewable_covered_items` use the full linked-card set without duplicating highlight rows.
- Updated the frontend test inbox mock to model multiple cards per note and all reviewable linked cards.
- Hardened source-scoped Study focus so an explicit covered-highlight card handoff is not overwritten by a generated source card while Study data reloads.

## Validation Results
- `cd backend && .venv/bin/python -m pytest tests/test_api.py::test_highlight_review_inbox_prefers_reviewable_card_when_note_has_multiple_study_cards -q` - passed.
- `cd backend && .venv/bin/python -m pytest tests/test_api.py -k "highlight_review_inbox or study_card_review_marks_unreviewed_linked_highlights_reviewed or workspace_restore_preserves_highlight_review_state" -q` - passed.
- `cd backend && .venv/bin/python -m pytest tests/test_api.py -q` - 96 passed.
- `cd frontend && npm exec tsc -- -b --pretty false` - passed.
- `cd frontend && npm test -- --run src/App.test.tsx -t "Home covered highlight rows prefer reviewable Study handoff" --reporter=dot` - passed with duplicate-card and generated-card distractor coverage.
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot` - 171 passed.
- `cd frontend && npm test -- --run src/api.test.ts --reporter=dot` - 12 passed.
- `cd frontend && npm test -- --run --reporter=dot` - 268 passed, 20 skipped.
- `cd frontend && npm run build` - passed.
- `node scripts/playwright/stage988_multicard_highlight_study_coverage_selection_after_stage987.mjs --base-url http://127.0.0.1:8000 --database-path /home/fa507/dev/accessible_reader/backend/.data/workspace.db` - passed with `highlightCoveredInboxKeepsAllLinkedCardsReviewable: true`, `highlightCoveredRowPrefersReviewableCard: true`, `highlightCoveredReviewSessionUsesReviewableCard: true`, `highlightCoveredRowOpenStudyPrefersReviewableCard: true`, `readerGeneratedOutputsFrozen: true`, and cleanup dry-run `matchedCount: 0`.
- Stage 986, 984, 982, 980, 978, 976, and 975 Playwright regression ladder passed against `http://127.0.0.1:8000`, including Stage 975 cleanup dry-run `matchedCount: 0`.
- Browser Use in-app smoke loaded `http://127.0.0.1:8000/recall`, showed the workspace navigation/Home collection rail, and reported zero warning/error console logs.
- `node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=http://127.0.0.1:8000` - dry-run `matchedCount: 0`.
- `git diff --check` - passed.

## Assumptions
- A highlight can be covered by several non-deleted local cards; the inbox should not duplicate the highlight row.
- Ready local cards are `due` and `new`, matching Stage 984.
- Scheduled and unscheduled cards still count as coverage, but they are not ready review targets.
- FSRS scheduling and Study review/rating ownership remain unchanged.
