# Stage 1001 Post-Stage-1000 Highlight Review Graph Connection Filters Audit

## Summary
Audit Stage 1000's Graph connection filters for the highlight review loop. The audit must prove connected/unconnected filters are derived locally from Graph metadata, compose with existing Home/custom collection and Source scopes, and preserve Study coverage, guided sessions, Reader outputs, and cleanup hygiene.

## Audit Scope
- Backend connected/unconnected highlight inbox filtering.
- Non-rejected versus rejected Graph node behavior.
- Home/custom collection Graph connection controls.
- Source overview Graph connection controls.
- Guided-session behavior from connected and unconnected queues.
- Notebook Graph promotion seam and focused Graph handoff preservation.
- Existing Study coverage filters, bulk triage, Stage 998 row/session actions, and generated Reader-output freeze.
- Cleanup dry-run hygiene.

## Validation Commands
- `cd backend && .venv/bin/python -m pytest tests/test_api.py -q`
- `cd frontend && npm exec tsc -- -b --pretty false`
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot -t "Graph"`
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot`
- `cd frontend && npm test -- --run src/api.test.ts --reporter=dot`
- `cd frontend && npm test -- --run --reporter=dot`
- `cd frontend && npm run build`
- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check`
- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check-openapi-snapshot`
- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check-generated-openapi-reference`
- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check-generated-type-mapping`
- `node scripts/playwright/stage1000_highlight_review_graph_connection_filters_after_stage999.mjs --base-url=<live-url>`
- `node scripts/playwright/stage998_highlight_review_graph_coverage_and_knowledge_handoff_after_stage997.mjs --base-url=<live-url>`
- `node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=<live-url>`
- `git diff --check`

## Exit Criteria
- `connected` returns only non-dismissed rows with non-rejected Graph coverage.
- `unconnected` returns non-dismissed rows without Graph coverage.
- Rejected Graph nodes do not count as connected.
- Home/custom collection and Source panels expose compact Graph filters without replacing the existing Study coverage filters.
- Connected filtered rows open focused Graph; unconnected filtered rows create Graph nodes through Notebook promotion.
- Guided sessions start from the filtered connected/unconnected rows.
- Existing Stage 998 Graph row/session actions, Study coverage semantics, bulk triage, Reader/Notebook handoffs, generated Reader outputs, and cleanup dry-run remain stable.

## Audit Results
- Passed on May 7, 2026 against `http://127.0.0.1:8001`.
- Stage 1000 Browser Use smoke loaded Recall with Home highlight review Graph filters present and zero warning/error console logs.
- `stage1000_highlight_review_graph_connection_filters_after_stage999.mjs` passed with Home unconnected/connected filters, Notebook Graph promotion from the unconnected queue, focused Graph handoff, Source learning-gap Graph filter, Source unconnected guided session preservation, generated-output freeze, and cleanup dry-run `matchedCount: 0`.
- Stage 998 audit rerun passed with Graph promotion and focused handoff preservation, Source guided-session Graph handoff, generated-output freeze, and cleanup dry-run `matchedCount: 0`.
- Backend `tests/test_api.py` passed: 97 tests.
- Frontend typecheck, focused Graph tests, full `App.test.tsx`, `api.test.ts`, full Vitest, build, contract/OpenAPI checks, cleanup dry-run, and `git diff --check` all passed.
