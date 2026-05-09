# Stage 1027 Post-Stage-1026 Graph Relation Practice Handoffs Audit

## Summary
Audit Stage 1026's Graph relation-practice handoffs. The audit must prove that Graph connection rows now show derived local practice state, route ready relation cards into active Study Review, route non-ready relation cards into relation-filtered Study Questions, and create relation-backed Study cards from no-practice Graph rows without changing backend contracts, generated Reader outputs, FSRS ownership, cloud/chat/TTS/import behavior, or cleanup hygiene.

Status: completed on 2026-05-08.

## Audit Scope
- Graph selected node `Connections` rows show `No practice yet`, ready, practiced, scheduled, and unscheduled practice state from existing Study card fields.
- Graph ready relation rows expose `Practice connection` and start a relation-scoped Study Review session.
- Graph non-ready relation rows expose `Study questions` and land in relation-filtered Study Questions.
- Graph no-card relation rows expose `Create practice card`, create a relation-backed Study card, and land in relation-filtered Study Questions.
- Existing Follow, Confirm, Reject, Reader/source evidence, Home/Source relation-practice signals, and Stage 1024 recap return remain stable.
- Cleanup dry-run stays `matchedCount: 0`.

## Validation Commands
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot -t "Graph relation practice|relation practice"`
- `cd frontend && npm exec tsc -- -b --pretty false`
- `cd frontend && npm run build`
- `cd backend && .venv/bin/python -m pytest tests/test_api.py -q`
- `node scripts/playwright/stage1026_graph_relation_practice_handoffs_after_stage1025.mjs --base-url=<live-url>`
- `node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=<live-url>`
- `git diff --check`

## Exit Criteria
- Graph connection-row practice state matches Home/Source relation-practice semantics.
- Active Review is only started for due/new relation cards.
- Practiced/scheduled/unscheduled relation cards stay visible as progress and route to Study Questions.
- No-card relation gaps remain explicit and create a relation-backed local Study card only after the user action.
- No new backend endpoint, database schema, generated API contract, generated Reader-output, cloud/chat/TTS/extension capture, import behavior, or non-Study FSRS behavior is introduced.

## Audit Results
- In-app browser tooling opened the live app at `http://127.0.0.1:8001/recall?section=graph` and confirmed title `Recall Workspace`; seeded interaction evidence used repo Playwright.
- `scripts/playwright/stage1026_graph_relation_practice_handoffs_after_stage1025.mjs --base-url http://127.0.0.1:8001` passed with `graphPracticeConnectionVisible`, `graphPracticeConnectionStartsSession`, `graphPracticedScheduledStateVisible`, `graphNoPracticeStateVisible`, `graphNoPracticeCreateHandoff`, Home/Source relation-practice preservation, generated-output freeze, and cleanup dry-run `matchedCount: 0`.
- Captures written under `output/playwright/`: `stage1026-graph-practice-connection.png`, `stage1026-graph-practice-active-session.png`, `stage1026-graph-practiced-scheduled-state.png`, `stage1026-graph-no-practice-state.png`, `stage1026-graph-create-practice-questions.png`, plus Home/Source preservation captures.
- Focused Graph/relation tests passed with 6 tests.
- Backend `tests/test_api.py` passed with 98 tests.
- Full `src/App.test.tsx` passed with 204 tests.
- Frontend API tests passed with 12 tests.
- Full Vitest passed with 301 tests and 20 skipped.
- Frontend typecheck and build passed; build retained the existing Vite chunk-size warning.
- Cleanup dry-run stayed at `matchedCount: 0`.
- `git diff --check` passed.
