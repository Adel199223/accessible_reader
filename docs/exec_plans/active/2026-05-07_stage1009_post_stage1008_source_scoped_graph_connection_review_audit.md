# Stage 1009 Post-Stage-1008 Source-Scoped Graph Connection Review Audit

## Summary
Audit Stage 1008's source-scoped Graph connection-review handoff. The audit must prove source-local suggested Graph relations are visible from Source overview, open Graph with the source queue selected, remain evidence-backed and decidable, and do not disturb the existing global Graph connection queue, Graph gap build queue, highlight review state, Study coverage, Reader outputs, FSRS, or cleanup hygiene.

## Audit Scope
- Source overview Graph context suggested-connection counts.
- Source overview `Review connections` handoff into Graph.
- Graph connection review scope controls for `All`, `This source`, `Strong`, and `Multi-evidence`.
- Source-scoped queue relation focus, evidence handoff, confirm/reject decisions, and snapshot refresh.
- Stage 1006 global connection review queue behavior.
- Stage 1004 Graph gap build queue and return loop.
- Existing selected-node connection decisions, Source highlight review Graph coverage filters, generated Reader-output freeze, and cleanup dry-run hygiene.

## Validation Commands
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot -t "Graph connection review"`
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot -t "Source overview"`
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot`
- `cd frontend && npm test -- --run src/api.test.ts --reporter=dot`
- `cd frontend && npm test -- --run --reporter=dot`
- `cd frontend && npm exec tsc -- -b --pretty false`
- `cd frontend && npm run build`
- `cd backend && .venv/bin/python -m pytest tests/test_api.py -q`
- `node scripts/playwright/stage1008_source_scoped_graph_connection_review_after_stage1007.mjs --base-url=<live-url>`
- `node scripts/playwright/stage1006_graph_connection_review_queue_after_stage1005.mjs --base-url=<live-url>`
- `node scripts/playwright/stage1004_graph_gap_build_queue_and_return_loop_after_stage1003.mjs --base-url=<live-url>`
- `node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=<live-url>`
- `git diff --check`

## Exit Criteria
- Source overview shows source-local suggested connection counts when available.
- Source overview opens Graph with the active source and `This source` connection queue.
- Graph queue scope controls update visible rows/counts without changing persisted relation state.
- Reviewing, opening evidence, confirming, and rejecting source-scoped suggested relations still use existing Stage 1006 flows.
- Existing global queue, Graph gap build queue, highlight-review Graph coverage filters, Study semantics, Reader outputs, FSRS behavior, and generated API contracts remain stable.
- Cleanup dry-run remains `matchedCount: 0`.

## Audit Results
- Implemented Stage 1008 as a UI-derived source-scoped relation review layer over existing suggested Graph edges. Source overview now shows source-local suggested relation counts and a `Review connections` handoff; Graph's connection review queue now supports compact `All`, `This source`, `Strong`, and `Multi-evidence` scopes while preserving the existing review/evidence/confirm/reject actions.
- Hardened the frontend Graph snapshot fetch from `240` nodes / `400` edges so source-scoped relation review remains visible on a crowded local graph without adding API endpoints, persisted queue state, schema changes, generated contract drift, Reader output changes, or FSRS changes.
- Addressed code-review feedback by making `GET /api/recall/graph` include endpoint nodes for every returned non-rejected visible edge, even when `limit_nodes` is small; this keeps source-scoped counts and review rows from dropping valid source edges whose endpoint nodes would otherwise fall outside the node slice.
- Browser Use / in-app smoke at `http://127.0.0.1:8001/recall?section=graph` confirmed the Graph connection review queue, scope controls, suggested/strong/multi-evidence/confirmed counts, and zero warning/error console logs before the Playwright audit.
- `node scripts/playwright/stage1008_source_scoped_graph_connection_review_after_stage1007.mjs --base-url=http://127.0.0.1:8001` - passed with Source overview Graph-connection counts/handoff, source-scoped Graph queue, relation focus, Reader evidence handoff, confirm refresh, Stage 1006 global queue preservation, Stage 1004 Graph gap preservation, generated-output freeze, and cleanup dry-run `matchedCount: 0`.
- `node scripts/playwright/stage1006_graph_connection_review_queue_after_stage1005.mjs --base-url=http://127.0.0.1:8001` - passed with global queue, relation focus, Reader evidence handoff, confirm refresh, Graph gap queue preservation, generated-output freeze, and cleanup dry-run `matchedCount: 0`.
- `node scripts/playwright/stage1004_graph_gap_build_queue_and_return_loop_after_stage1003.mjs --base-url=http://127.0.0.1:8001` - passed with Graph gap queue, Source review handoff, Notebook Graph promotion, focused Graph return, generated-output freeze, and cleanup dry-run `matchedCount: 0`.
- `node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=http://127.0.0.1:8001` - dry-run `matchedCount: 0`.
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot -t "Graph connection review"` - 4 passed, 186 skipped.
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot -t "Source overview opens a source-scoped"` - 1 passed, 189 skipped.
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot` - 190 passed.
- `cd frontend && npm test -- --run src/api.test.ts --reporter=dot` - 12 passed.
- `cd frontend && npm test -- --run --reporter=dot` - 287 passed, 20 skipped.
- `cd frontend && npm exec tsc -- -b --pretty false` - passed.
- `cd frontend && npm run build` - passed with the existing Vite chunk-size warning.
- `cd backend && .venv/bin/python -m pytest tests/test_api.py::test_recall_graph_summary_and_manual_decision_flow -q` - 1 passed, including the tiny `limit_nodes` endpoint-node regression assertion.
- `cd backend && .venv/bin/python -m pytest tests/test_api.py -q` - 98 passed.
- After the endpoint-node fix, reran `node scripts/playwright/stage1008_source_scoped_graph_connection_review_after_stage1007.mjs --base-url=http://127.0.0.1:8001` - passed.
- After the endpoint-node fix, reran `node scripts/playwright/stage1006_graph_connection_review_queue_after_stage1005.mjs --base-url=http://127.0.0.1:8001` - passed.
- After the endpoint-node fix, reran `node scripts/playwright/stage1004_graph_gap_build_queue_and_return_loop_after_stage1003.mjs --base-url=http://127.0.0.1:8001` - passed.
- After the endpoint-node fix, reran `node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=http://127.0.0.1:8001` - dry-run `matchedCount: 0`.
- `git diff --check` - passed.
