# Stage 999 Post-Stage-998 Highlight Review Graph Coverage And Knowledge Handoff Audit

## Summary
Audit Stage 998's Graph-connected highlight review loop. The audit must prove Graph coverage is derived from existing local graph metadata, Graph promotion updates local review state, and Home/custom collection plus Source review loops can create or open Graph nodes without disturbing Study coverage, guided sessions, Reader outputs, or cleanup hygiene.

## Audit Scope
- Backend derived Graph coverage for recall notes.
- Non-rejected versus rejected graph-node coverage behavior.
- Graph promotion review-state update for unreviewed and dismissed notes.
- Highlight inbox summary Graph counts and row coverage fields.
- Home/custom collection highlight review row status/actions.
- Source highlight review guided-session Graph status/actions.
- Notebook graph promotion seam and focused Graph handoff.
- Stage 996 guided-session behavior, Stage 994 bulk triage, Stage 992 next actions, and existing Study handoffs.
- Cleanup dry-run hygiene.

## Validation Commands
- `cd backend && .venv/bin/python -m pytest tests/test_api.py -q`
- `cd frontend && npm exec tsc -- -b --pretty false`
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot`
- `cd frontend && npm test -- --run src/api.test.ts --reporter=dot`
- `cd frontend && npm test -- --run --reporter=dot`
- `cd frontend && npm run build`
- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check`
- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check-openapi-snapshot`
- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check-generated-openapi-reference`
- `backend/.venv/bin/python scripts/contracts/audit_api_types_contract.py --check-generated-type-mapping`
- `node scripts/playwright/stage998_highlight_review_graph_coverage_and_knowledge_handoff_after_stage997.mjs --base-url=<live-url>`
- `node scripts/playwright/stage996_highlight_review_guided_triage_session_after_stage995.mjs --base-url=<live-url>`
- `node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=<live-url>`
- `git diff --check`

## Exit Criteria
- Graph coverage derives from `knowledge_nodes.metadata_json.promoted_note_ids`.
- Rejected graph nodes are ignored by rows and summary counts.
- Graph promotion moves notes to `reviewed`, clears `dismissed_at`, and keeps dismissed notes recoverable through Reviewed.
- Home/custom collection rows show `Connected to Graph` / `Not in Graph` and create/open Graph actions.
- Source guided-session active rows show Graph status and create/open Graph actions.
- Graph creation uses the existing Notebook promotion flow and returns to focused Graph.
- Existing Study coverage, Study creation, bulk triage, guided session advancement, Reader/Notebook handoffs, and generated Reader outputs remain stable.
- Cleanup dry-run reports `matchedCount: 0`.

## Audit Results
- Passed. Stage 998 Graph coverage is derived from promoted-note Graph metadata, rejected Graph nodes are excluded, and Graph promotion marks unreviewed or dismissed notes as reviewed while preserving recovery through the Reviewed filter.
- Browser evidence passed through Browser Use smoke plus `scripts/playwright/stage998_highlight_review_graph_coverage_and_knowledge_handoff_after_stage997.mjs` on `http://127.0.0.1:8001`, covering Home/custom collection Create Graph node, Notebook Graph promotion, focused Graph return, Source guided-session Open Graph node, generated-output freeze, and cleanup dry-run `matchedCount: 0`.
- Regression evidence passed: Stage 996 guided-session audit, backend `tests/test_api.py`, frontend typecheck, focused Graph tests, full `App.test.tsx`, `api.test.ts`, full Vitest, build, contract snapshot checks, cleanup dry-run `matchedCount: 0`, and `git diff --check`.
