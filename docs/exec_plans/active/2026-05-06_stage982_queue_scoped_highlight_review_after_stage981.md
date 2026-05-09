# Stage 982 - Queue-Scoped Highlight Review

## Status

Completed on May 6, 2026, after completed Stage 980/981 learning-gap queue filters.

## Intent

Turn the filtered Reading queue into a managed highlight review loop. Stage 980 made source-level learning gaps filterable; Stage 982 should make the local highlight review inbox follow those same reading-state and learning filters so users can review the exact source subset they are triaging instead of bouncing row by row.

Recall's latest public direction emphasizes intentional engagement with saved content, notes, review, knowledge stages, and read-it-later workflows. This slice stays inside the repo brief by improving local saved-note/highlight review and Study coverage workflows without adding chat, API/MCP, cloud sync, notifications, local TTS, generated Reader-output changes, or FSRS changes.

## Scope

- Extend `GET /api/recall/library/highlight-review-inbox` with queue-scope filters:
  - `reading_state=all|unread|in_progress|completed`
  - `learning_filter=all|needs_review|uncovered|covered|study_prompts`
- Apply queue filters backend-side before highlight rows are selected and before the inbox row limit is applied.
- Add `uncovered` as a highlight review inbox state, showing non-dismissed highlights/source notes that are not Study-covered, including notes already marked reviewed.
- Return the active queue filters in `HighlightReviewInboxResponse`.
- Extend frontend API/types for the new query and response fields.
- In Home built-in source boards and custom collection workspaces, load the review inbox for the same scope/collection plus active Reading queue filters.
- Keep Source overview highlight review source-scoped and unchanged except for response compatibility.
- Keep existing handoffs:
  - sentence highlights open anchored Reader
  - source notes open Notebook/source context
  - covered highlights open Study card
  - uncovered highlights use the Notebook Study promotion seam

## Out Of Scope

- No bulk highlight-to-Study generation or auto-promotion.
- No generated Reader output changes.
- No FSRS scheduling changes; Study ratings remain owned by Review flows.
- No cloud sync, general chat/API/MCP workflows, notifications, local TTS, shared challenges, AI note generation, or extension capture.
- No mixed global memory-object dashboard.
- No deletion of user notes; dismissed notes remain recoverable through existing review filters.

## Public APIs / Types

- `HighlightReviewInboxState` gains `uncovered`.
- `HighlightReviewInboxSummary` gains `uncovered_items`.
- `HighlightReviewInboxResponse` gains `reading_state` and `learning_filter`.
- `GET /api/recall/library/highlight-review-inbox` gains optional `reading_state` and `learning_filter`.
- `fetchHighlightReviewInbox` gains `readingState` and `learningFilter` options.

## Validation Plan

- Backend: highlight review inbox filters by reading state and learning filter across collection and built-in scope, applies queue filtering before inbox limit, preserves source-scoped inbox, rejects invalid query values, and preserves Study coverage derivation.
- Frontend: Home built-in board review inbox appears, custom collection review inbox sends active queue filters, changing Reading queue filters narrows review rows, dismissed/reviewed recovery still works, and Study/Notebook/Reader handoffs remain intact.
- Browser evidence: Stage 982 Playwright validates Home built-in scope review inbox, custom collection queue-scoped review, reading-state and learning-filter composition, existing row actions, and cleanup dry-run `matchedCount: 0`.
- Regression gate: Stage 983 reruns Stage 982 evidence plus Stage 980/978/976/975 regressions, backend `tests/test_api.py`, frontend typecheck, focused `App.test.tsx`, full Vitest, build, cleanup dry-run, contracts, and `git diff --check`.

## Assumptions

- Queue-scoped review uses the same AND semantics as the Reading queue: source scope/custom collection, reading state, and learning filter must all match.
- `needs_review` remains unreviewed and not Study-covered.
- `uncovered` remains total highlights/source notes minus Study-covered minus dismissed.
- Built-in Home source boards can expose the same review inbox as custom collections because the backend already supports built-in scopes.

## Result

- Added queue-scoped `reading_state` and `learning_filter` handling to `GET /api/recall/library/highlight-review-inbox`, including backend filter-before-limit behavior and returned active filters.
- Added the `uncovered` highlight inbox state and `uncovered_items` summary count for non-dismissed notes that are not Study-covered, including already reviewed notes.
- Extended frontend API/types/OpenAPI contracts and wired Home built-in source boards plus custom collection workspaces to load the highlight review inbox from the active Reading queue filters.
- Preserved Source overview as source-scoped review, covered-row Study handoff, Notebook promotion seam, Reader highlight handoff, dismissed recovery, generated Reader-output freeze, and FSRS ownership.

## Validation

- `backend/.venv/bin/python -m pytest tests/test_api.py -q` - 94 passed.
- `npm exec tsc -- -b --pretty false` - passed.
- `npm test -- --run src/App.test.tsx --reporter=dot` - 168 passed on final full-file rerun.
- `npm test -- --run --reporter=dot` - 265 passed, 20 skipped.
- `npm run build` - passed with existing Vite chunk-size warning.
- Contract audit checks for API inventory, OpenAPI snapshot, generated OpenAPI reference, generated type mapping, and generated type adoptions - passed.
- Stage 982 Playwright evidence passed with `homeScopeHighlightReviewVisible`, queue reading-state/learning-filter composition, collection rows-only scoping, filter-before-limit, preserved actions, source scoping, and cleanup dry-run `matchedCount: 0`.
- Stage 980, Stage 978, Stage 976, and Stage 975 Playwright regressions passed.
- Cleanup utility dry-run returned `matchedCount: 0`.
- In-app browser smoke loaded `http://127.0.0.1:8012/recall?section=library` and found Reading queue plus Review highlights.
- `git diff --check` - passed.
