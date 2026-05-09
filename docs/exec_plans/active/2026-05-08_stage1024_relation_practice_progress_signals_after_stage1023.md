# Stage 1024 Relation Practice Progress Signals After Stage 1023

## Summary
Open a fresh Stage 1024/1025 slice that turns relation practice from a launcher into a visible local learning loop. Stage 1022 made Home/custom collection `Practice connection` and Source `Practice relation` start active relation-scoped Study sessions. The next highest-leverage compliant move is to show whether a Graph relation is ready now, already practiced, scheduled for later, unscheduled, or still missing a practice card, while returning completed sessions to the exact source connection context.

Sources checked: [Recall 2.0 changelog](https://feedback.getrecall.ai/changelog), [Recall docs](https://docs.recall.it/), [Recall card reviews docs](https://recall.cards/docs/card-reviews), and [Recall key concepts](https://recall.cards/docs/key-concepts).

## Key Changes
- Derive relation practice progress from existing local `StudyCardRecord` fields and relation `source_spans[].edge_id`; do not add schema or API state.
- Split relation practice summary semantics:
  - `ready`: relation-backed Study cards whose status is `due` or `new`
  - `practiced`: relation-backed Study cards with local review history / practiced knowledge state
  - `scheduled`: relation-backed Study cards scheduled for later
  - `unscheduled`: relation-backed Study cards manually deferred
  - `gap`: Graph relation has no relation-backed Study card
- Home/custom collection Reading queue should:
  - keep `Practice connection` only when at least one relation has a due/new card
  - show practiced/scheduled/unscheduled relation progress when no immediate review is available
  - route non-ready practiced/scheduled relations to relation-filtered Study Questions instead of implying a live Review session
  - keep `Build practice` for genuine no-card gaps
- Source overview relation rows should show compact progress state beside existing Graph relation metadata and use `Practice relation`, `Study questions`, or `Create practice card` according to derived state.
- Relation-practice recap should return to the focused Source overview relation row, not only the source page.
- Preserve Stage 1022 active review-session launch, Stage 1020 Home `Build practice`, Stage 1018 Source `Create practice card`, Study FSRS ownership, generated Reader-output freeze, cleanup hygiene, public API shape, backend schema, cloud/chat/TTS/extension exclusions, and import behavior.

## Public APIs / Types
- No new endpoint is required.
- No database migration is required.
- No generated API contract drift is expected.
- Any helper types stay frontend-local unless an existing type surface requires widening.

## Test Plan
- Frontend:
  - A reviewed/scheduled relation-backed card no longer renders Home `Practice connection`; Home shows practiced/scheduled relation state and opens relation-filtered Study Questions.
  - Source overview shows practiced/scheduled relation state and offers `Study questions` when no due/new relation card is available.
  - Ready due/new relation cards still start active Study review from Home and Source.
  - No-card relation gaps still show `Build practice` / `Create practice card`.
  - Relation-practice recap `Back to source connection` focuses the practiced Source relation row.
- Browser/Playwright:
  - Use Browser Use first if available; if its runtime is unavailable, record the reason and use repo Playwright.
  - Add `scripts/playwright/stage1024_relation_practice_progress_signals_after_stage1023.mjs`.
  - Capture Home practiced/scheduled state, Source practiced/scheduled row, ready relation review-session preservation, focused Source return from recap, generated-output freeze, and cleanup dry-run `matchedCount: 0`.
- Regression gate:
  - Focused `App.test.tsx` relation-practice tests.
  - Frontend typecheck and build.
  - Backend `tests/test_api.py -q`.
  - Full `App.test.tsx`, `api.test.ts`, full Vitest if focused changes are stable.
  - Cleanup dry-run and `git diff --check`.

## Assumptions
- “Practice connection” should mean an active review can start now.
- “Study questions” is the correct browse/manage fallback for practiced, scheduled, or unscheduled relation cards.
- Practiced relation state is derived from existing local review/card state, not a separate persisted relation-practice flag.
- Returning to the exact relation can be represented by a focused Source overview row highlight; no route or persisted continuity migration is required.

## Implementation Notes
- Added a frontend-local relation practice summary helper that derives ready, practiced, scheduled, unscheduled, and gap state from existing Study card status/review fields plus relation `source_spans[].edge_id`.
- Home/custom collection Reading queue now keeps `Practice connection` for due/new relation cards only; practiced or scheduled relation cards show progress and expose `Study connection` into relation-filtered Study Questions.
- Source overview relation rows now show practiced/scheduled/unscheduled status chips and use `Practice relation`, `Study questions`, or `Create practice card` based on derived local state.
- Relation-practice recap return now marks the practiced Source relation row with a focused Stage 1024 data hook.

## Validation Results
- In-app browser tooling opened `http://127.0.0.1:8001/recall` and confirmed the page identity as `Recall Workspace`; the deeper seeded interaction evidence used repo Playwright.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm test -- --run src/App.test.tsx --reporter=dot -t "Relation practice action opens filtered|Relation practice progress shows|Relation practice review sessions"` - red first against Stage 1023 behavior, then 3 passed after implementation.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm test -- --run src/App.test.tsx --reporter=dot -t "relation practice"` - 3 passed, 198 skipped.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm exec tsc -- -b --pretty false` - passed.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm run build` - passed with the existing Vite chunk-size warning.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader -- node scripts/playwright/stage1024_relation_practice_progress_signals_after_stage1023.mjs --base-url http://127.0.0.1:8001` - passed with ready relation Review launch, practiced/scheduled Home and Source states, focused Source relation return, generated-output freeze, and cleanup dry-run `matchedCount: 0`.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/backend -- .venv/bin/python -m pytest tests/test_api.py -q` - 98 passed.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm test -- --run src/App.test.tsx --reporter=dot` - 201 passed.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm test -- --run src/api.test.ts --reporter=dot` - 12 passed.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm test -- --run --reporter=dot` - 298 passed, 20 skipped.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader -- node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=http://127.0.0.1:8001` - dry-run `matchedCount: 0`.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader -- git diff --check` - passed.
