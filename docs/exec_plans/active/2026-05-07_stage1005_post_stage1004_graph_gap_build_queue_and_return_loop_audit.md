# Stage 1005 Post-Stage-1004 Graph Gap Build Queue And Return Loop Audit

## Summary
Audit Stage 1004's Graph-owned build queue and return loop. The audit must prove Graph-gap work is derived locally from the existing highlight review inbox, Graph promotion still lands in focused Graph, and the user can return to the same `Graph gaps` / `Not in Graph` review context without changing Study coverage, Reader outputs, FSRS, or stored Graph coverage state.

## Audit Scope
- Graph-surface unconnected highlight/source-note build queue.
- Graph queue `Create Graph node` and `Open source review` handoffs.
- Notebook Graph promotion from Graph-gap context.
- Focused Graph handoff after promotion.
- `Back to Graph gaps` return to Source/Home/custom collection highlight review context.
- Existing Home Graph gaps, Source Graph filters, Study covered-highlight review, generated Reader-output freeze, and cleanup dry-run hygiene.

## Validation Commands
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot -t "Graph gap"`
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot`
- `cd frontend && npm test -- --run src/api.test.ts --reporter=dot`
- `cd frontend && npm test -- --run --reporter=dot`
- `cd frontend && npm exec tsc -- -b --pretty false`
- `cd frontend && npm run build`
- `cd backend && .venv/bin/python -m pytest tests/test_api.py -q`
- `node scripts/playwright/stage1004_graph_gap_build_queue_and_return_loop_after_stage1003.mjs --base-url=<live-url>`
- `node scripts/playwright/stage1002_home_graph_gap_learning_queue_lens_after_stage1001.mjs --base-url=<live-url>`
- `node scripts/playwright/stage1000_highlight_review_graph_connection_filters_after_stage999.mjs --base-url=<live-url>`
- `node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=<live-url>`
- `git diff --check`

## Exit Criteria
- Graph shows a compact build queue when unconnected highlight/source notes exist.
- Queue rows open the existing Notebook Graph promotion seam and Source `Not in Graph` review.
- Promotion from the queue or a highlight review Graph-gap context lands in focused Graph.
- `Back to Graph gaps` restores the originating unconnected review context and preserves `graph_gaps` where applicable.
- Existing Stage 998-1003 Graph coverage, Home queue, Source overview, Study coverage, and cleanup hygiene remain stable.

## Audit Results
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot -t "Graph gap"`: passed, 3 tests.
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot`: passed, 186 tests.
- `cd frontend && npm test -- --run src/api.test.ts --reporter=dot`: passed, 12 tests.
- `cd frontend && npm test -- --run --reporter=dot`: passed, 283 tests, 20 skipped.
- `cd frontend && npm exec tsc -- -b --pretty false`: passed.
- `cd frontend && npm run build`: passed with the existing large-chunk warning.
- `cd backend && .venv/bin/python -m pytest tests/test_api.py -q`: passed, 98 tests.
- Browser Use `iab` smoke check at `http://127.0.0.1:8001/recall?section=graph`: Graph settings sidebar and `Graph gap build queue` visible; 4 `Create Graph node` actions visible on the live dataset.
- `node scripts/playwright/stage1004_graph_gap_build_queue_and_return_loop_after_stage1003.mjs --base-url=http://127.0.0.1:8001`: passed with all Stage 1004 metrics true and cleanup dry-run `matchedCount: 0`.
- `node scripts/playwright/stage1002_home_graph_gap_learning_queue_lens_after_stage1001.mjs --base-url=http://127.0.0.1:8001`: passed with all Stage 1002 metrics true and cleanup dry-run `matchedCount: 0`.
- `node scripts/playwright/stage1000_highlight_review_graph_connection_filters_after_stage999.mjs --base-url=http://127.0.0.1:8001`: passed with all Stage 1000 metrics true and cleanup dry-run `matchedCount: 0`.
- `node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=http://127.0.0.1:8001`: passed, dry-run `matchedCount: 0`.
- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py`: passed. A first system-Python attempt failed because `fastapi` was not installed outside the backend venv; the venv run is the valid result.
- `git diff --check`: passed.
