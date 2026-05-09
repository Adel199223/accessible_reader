# Stage 1007 Post-Stage-1006 Graph Connection Review Queue Audit

## Summary
Audit Stage 1006's Graph connection-review queue. The audit must prove suggested Graph relations are visible, reviewable, evidence-backed, and decidable through the existing local Graph APIs while Stage 1004 Graph gaps, highlight review state, Study coverage, Reader outputs, FSRS, and cleanup hygiene remain stable.

## Audit Scope
- Graph `Connection review` queue for suggested edges.
- Queue relation focus and existing connection detail context.
- Queue `Open evidence`, `Confirm`, and `Reject` actions.
- Graph snapshot refresh after relation decisions.
- Stage 1004 Graph gap build queue and `Back to Graph gaps` return loop.
- Existing selected-node connection decisions, Source overview memory stack, Study coverage, generated Reader-output freeze, and cleanup dry-run hygiene.

## Validation Commands
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot -t "Graph connection review"`
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot -t "Graph gap"`
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot`
- `cd frontend && npm test -- --run src/api.test.ts --reporter=dot`
- `cd frontend && npm test -- --run --reporter=dot`
- `cd frontend && npm exec tsc -- -b --pretty false`
- `cd frontend && npm run build`
- `cd backend && .venv/bin/python -m pytest tests/test_api.py -q`
- `node scripts/playwright/stage1006_graph_connection_review_queue_after_stage1005.mjs --base-url=<live-url>`
- `node scripts/playwright/stage1004_graph_gap_build_queue_and_return_loop_after_stage1003.mjs --base-url=<live-url>`
- `node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=<live-url>`
- `git diff --check`

## Exit Criteria
- Graph shows suggested relations as a compact `Connection review` queue.
- Reviewing a queued relation focuses the existing connection detail/evidence context.
- Opening evidence uses the existing Reader/source handoff.
- Confirming or rejecting a queued relation calls the existing edge decision API and refreshes the queue.
- No new persisted relation-review state, schema migration, Reader-output drift, FSRS behavior, or generated API contract drift is introduced.
- Cleanup dry-run remains `matchedCount: 0`.

## Audit Results
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot -t "Graph connection review"`: passed, 2 tests.
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot -t "Graph gap"`: passed, 3 tests.
- `cd frontend && npm exec tsc -- -b --pretty false`: passed.
- `cd frontend && npm run build`: passed with the existing Vite chunk-size warning.
- Browser Use `iab` smoke at `http://127.0.0.1:8001/recall?section=graph`: `Connection review` queue visible with 4 rows, Stage 1004 Graph gap queue still present, and zero warning/error console logs. In-app screenshot capture timed out, so Playwright captures remain the visual evidence.
- `node scripts/playwright/stage1006_graph_connection_review_queue_after_stage1005.mjs --base-url=http://127.0.0.1:8001`: passed with all Stage 1006 metrics true and cleanup dry-run `matchedCount: 0`.
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot`: passed, 188 tests.
- `cd frontend && npm test -- --run src/api.test.ts --reporter=dot`: passed, 12 tests.
- `cd backend && .venv/bin/python -m pytest tests/test_api.py -q`: passed, 98 tests.
- `cd frontend && npm test -- --run --reporter=dot`: passed, 285 tests, 20 skipped.
- `node scripts/playwright/stage1004_graph_gap_build_queue_and_return_loop_after_stage1003.mjs --base-url=http://127.0.0.1:8001`: passed with all Stage 1004 metrics true and cleanup dry-run `matchedCount: 0`.
- `node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=http://127.0.0.1:8001`: passed, dry-run `matchedCount: 0`.
- `git diff --check`: passed.
