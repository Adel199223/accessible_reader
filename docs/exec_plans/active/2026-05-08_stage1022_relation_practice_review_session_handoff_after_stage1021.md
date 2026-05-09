# Stage 1022 Relation Practice Review Session Handoff After Stage 1021

## Summary
Open a fresh Stage 1022/1023 slice that closes the relation-practice loop created by Stages 1014-1021. Home can now discover relation-practice gaps, Source can create a relation-backed Study card, and Home/Source can show practice-ready relation signals. The next highest-leverage compliant move is to make `Practice connection` / `Practice relation` start an existing local relation-scoped Study review session when due/new relation cards are available, while falling back to the current relation-filtered Questions handoff when nothing is review-eligible.

Sources checked: [Recall 2.0 changelog](https://feedback.recall.it/changelog/recall-release-notes-april-14-2026-recall-20), [Recall docs](https://docs.getrecall.ai/), [Recall studying docs](https://recall.cards/docs/studying), and [Recall card reviews docs](https://recall.cards/docs/card-reviews).

## Key Changes
- Add a frontend-only relation review-session helper that:
  - scopes Study to the source document
  - applies the existing relation filter
  - selects local Study cards whose `source_spans[].edge_id` matches the Graph relation
  - starts a Study review session only from review-eligible `new` / `due` cards
  - preserves existing Study timer/settings snapshots and FSRS-owned rating flow
  - falls back to relation-filtered Study Questions when no eligible queue exists or session start fails
- Wire Home `Practice connection` and Source overview `Practice relation` to the helper instead of only opening Questions.
- Add a relation-practice session recap branch using `StudyReviewSessionRecap.filterSnapshot`:
  - show compact `Connection practiced` language
  - expose `Back to source connection`, returning to Source overview
  - expose `Study questions`, returning to relation-filtered Study Questions
- Preserve existing `Review filtered` behavior from Study Questions.
- Preserve Stage 1018 Source `Create practice card`, Stage 1020 Home `Build practice`, generated Reader-output freeze, public API shape, backend schema, Graph decisions, cloud/chat/TTS/extension capture exclusions, and FSRS ownership.

## Public APIs / Types
- No new endpoint is required.
- No database migration or generated API contract drift is expected.
- Relation review launch state is carried through the existing Study session `filter_snapshot`.

## Implementation Notes
- Added a shared relation-practice launcher in `frontend/src/components/RecallWorkspace.tsx` that loads the selected source's local Study cards, filters by `source_spans[].edge_id`, starts a Study review session for eligible `new` / `due` cards, and opens relation-filtered Questions when no eligible queue exists.
- Home `Practice connection` and Source overview `Practice relation` now use the active Study session path.
- Relation sessions store `launch_intent: relation-practice-review`, `relation_edge_id`, `relation_label`, and source scope in the existing Study session `filter_snapshot`.
- Study session recap now recognizes relation-practice sessions, shows `Connection practiced`, and offers `Back to source connection` plus `Study questions`.
- The focused Study prompt now exposes `aria-label="Active review prompt"` to match the desktop active review surface.

## Test Plan
- Frontend:
  - Home `Practice connection` starts a relation-scoped Study review session for due/new relation cards.
  - Source overview `Practice relation` starts the same relation-scoped session.
  - Relation practice falls back to relation-filtered Questions when matching relation cards are scheduled/unscheduled or otherwise not review-eligible.
  - Relation practice session recap shows connection language and can return to Source overview or relation-filtered Study Questions.
  - Existing Study `Review filtered`, Source `Create practice card`, Home `Build practice`, and relation-filter clear behavior remain stable.
- Browser/Playwright:
  - Use Browser Use first via `iab`; if unavailable, record the reason and use the repo Playwright harness.
  - Add `scripts/playwright/stage1022_relation_practice_review_session_handoff_after_stage1021.mjs`.
  - Capture Home relation-practice session start, Source relation-practice session start, relation recap, recap return to Source, recap Study Questions handoff, Stage 1020 gap/build preservation, generated-output freeze, and cleanup dry-run `matchedCount: 0`.
- Regression gate:
  - Focused `App.test.tsx` relation-practice tests.
  - Frontend typecheck and build.
  - Backend `tests/test_api.py -q`.
  - Full `App.test.tsx`, `api.test.ts`, and full Vitest if focused changes are stable.
  - Cleanup dry-run and `git diff --check`.

## Assumptions
- “Practice connection” should mean active recall when a ready queue exists; Questions remains the browse/manage fallback.
- A relation-scoped session reviews only existing local due/new Study cards; it does not create new cards.
- Recap return to Source overview does not need a new persisted relation-focus state; the Source related Graph stack is already the relation context.
- FSRS remains owned only by Study review/rating flows.

## Validation Results
- Browser plugin was tried first; the installed Browser cache is still missing `browser-use/0.1.0-alpha2/scripts/browser-client.mjs`, so the repo Playwright fallback captured evidence.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm test -- --run src/App.test.tsx --reporter=dot -t "relation practice"` - 3 passed, 197 skipped.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader -- node scripts/playwright/stage1022_relation_practice_review_session_handoff_after_stage1021.mjs --base-url http://127.0.0.1:8001` - passed with Home, collection, Source overview, active Study session, relation recap, Source return, generated-output freeze, and cleanup dry-run `matchedCount: 0`.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/backend -- .venv/bin/python -m pytest tests/test_api.py -q` - 98 passed.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm exec tsc -- -b --pretty false` - passed.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm run build` - passed with the existing Vite chunk-size warning.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm test -- --run src/App.test.tsx --reporter=dot` - 200 passed.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm test -- --run src/api.test.ts --reporter=dot` - 12 passed.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm test -- --run --reporter=dot` - passed on rerun with 297 passed, 20 skipped; the first run hit an existing Reader/search-control timing flake that was already green in the standalone App suite.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader -- node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=http://127.0.0.1:8001` - dry-run `matchedCount: 0`.
