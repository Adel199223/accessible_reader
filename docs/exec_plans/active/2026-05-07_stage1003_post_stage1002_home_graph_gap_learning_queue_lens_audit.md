# Stage 1003 Post-Stage-1002 Home Graph-Gap Learning Queue Lens Audit

## Summary
Audit Stage 1002's Home/custom collection Graph-gap Reading queue lens. The audit must prove Graph-gap source discovery is derived locally from existing note and Graph metadata, composes with Reading queue scope/state/collection filters, and preserves Stage 1000 highlight inbox Graph filters, Study coverage, Reader outputs, and cleanup hygiene.

## Audit Scope
- Backend Reading queue `graph_gaps` filtering.
- Queue-level `graph_covered` / `ungraphed` highlight review counts.
- Home/custom collection `Graph gaps` learning filter.
- Source overview handoff into `Not in Graph` highlight review.
- Notebook Graph promotion seam and focused Graph handoff preservation.
- Existing Study learning filters, highlight inbox Graph filters, guided sessions, generated Reader-output freeze, and cleanup dry-run hygiene.

## Validation Commands
- `cd backend && .venv/bin/python -m pytest tests/test_api.py -q`
- `cd frontend && npm exec tsc -- -b --pretty false`
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot -t "Graph gaps"`
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot`
- `cd frontend && npm test -- --run src/api.test.ts --reporter=dot`
- `cd frontend && npm test -- --run --reporter=dot`
- `cd frontend && npm run build`
- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check`
- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check-openapi-snapshot`
- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check-generated-openapi-reference`
- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check-generated-type-mapping`
- `node scripts/playwright/stage1002_home_graph_gap_learning_queue_lens_after_stage1001.mjs --base-url=<live-url>`
- `node scripts/playwright/stage1000_highlight_review_graph_connection_filters_after_stage999.mjs --base-url=<live-url>`
- `node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=<live-url>`
- `git diff --check`

## Exit Criteria
- `graph_gaps` returns sources with non-dismissed ungraphed highlights and excludes sources whose only ungraphed notes are dismissed.
- Non-rejected Graph nodes count as connected coverage; rejected Graph nodes do not.
- The filter composes with custom collections and reading state.
- Home/custom collection Reading queue shows `Graph gaps` and `not in Graph` row metadata.
- Row `Review highlights` opens Source overview with Source highlight review on `Not in Graph`.
- Existing Stage 1000 connected/unconnected inbox filters and Graph row/session actions remain stable.

## Audit Results
- Passed on May 7, 2026.
- Backend `tests/test_api.py` passed with 98 tests, including Graph-gap Reading queue derivation, dismissed-note exclusion, rejected Graph node treatment, collection/state composition, and existing highlight/Study behavior.
- Frontend `App.test.tsx` passed with 184 tests, `api.test.ts` passed with 12 tests, full Vitest passed with 281 tests and 20 skipped, and `npx tsc -b` plus `npm run build` passed with the existing Vite chunk-size warning.
- Contract checks passed for drift inventory, OpenAPI snapshot, generated OpenAPI reference, generated type mapping, and generated type adoptions.
- Browser Use in-app smoke at `http://127.0.0.1:8001/recall?section=library` confirmed the Recall workspace loads with Reading queue, `Graph gaps`, and Home highlight review present.
- `scripts/playwright/stage1002_home_graph_gap_learning_queue_lens_after_stage1001.mjs` passed with Home Graph-gap queue, source `Not in Graph` handoff, guided-session Graph action preservation, Notebook Graph promotion, focused Graph handoff, generated-output freeze, and cleanup dry-run `matchedCount: 0`.
- Stage 1000 rerun passed, preserving connected/unconnected highlight inbox filters, Graph row/session actions, generated-output freeze, and cleanup dry-run `matchedCount: 0`.
- Final cleanup dry-run returned `matchedCount: 0`; `git diff --check` passed.
