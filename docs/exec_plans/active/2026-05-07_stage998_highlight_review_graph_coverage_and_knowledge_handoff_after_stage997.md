# Stage 998 Highlight Review Graph Coverage And Knowledge Handoff After Stage 997

## Summary
Connect the managed highlight review loop to the existing local Knowledge Graph. Stage 996 made highlight triage work one visible item at a time; Stage 998 adds derived Graph coverage and Graph handoffs so reviewed highlights/source notes can move into local knowledge resurfacing without storing another promoted flag or changing Reader, Study scheduling, chat, cloud, TTS, or extension capture behavior.

## Scope
- Derive Graph coverage for recall notes from non-rejected `knowledge_nodes.metadata_json.promoted_note_ids`.
- Add `graph_covered` and optional `graph_node_id` to note, search, collection highlight item, and highlight inbox row contracts.
- Add `graph_covered_items` and `ungraphed_items` to the highlight review inbox summary while keeping Study `covered` semantics unchanged.
- Update note-to-Graph promotion so successful promotion marks the source note `reviewed` and clears `dismissed_at`.
- Add `Connected to Graph` / `Not in Graph` status plus `Create Graph node` / `Open Graph node` actions to Home/custom collection and Source highlight review rows and active guided-session items.
- Keep Graph creation on the existing Notebook promotion seam and Graph opening on the focused source Graph surface.

## Out Of Scope
- No new endpoint and no schema migration.
- No stored Graph-covered state.
- No `connected` / `unconnected` filters in this slice; summary chips plus row/session actions carry the Graph workflow.
- No generated Reader-output changes.
- No FSRS scheduling changes outside existing Study review/rating flows.
- No AI-generated note, label, card, or graph content.

## Implementation Plan
1. Add backend tests for derived Graph coverage, rejected-node exclusion, graph-promotion review-state updates, and inbox scoping.
2. Add frontend tests for Home/custom collection Create Graph node and Source guided-session Open Graph node flows.
3. Extend backend models, storage mapping helpers, highlight inbox summaries, collection overview highlight items, and graph promotion state updates.
4. Extend frontend public types, generated OpenAPI references, highlight review row/session UI, and Notebook graph promotion reload behavior.
5. Add a Stage 998 Playwright harness covering Home, collection, Source overview, Notebook graph promotion, focused Graph handoff, Stage 996 session preservation, generated-output freeze, and cleanup dry-run hygiene.
6. Create the Stage 999 audit plan and update continuity docs after validation.

## Test Plan
- `cd backend && .venv/bin/python -m pytest tests/test_api.py::test_highlight_review_inbox_derives_graph_coverage_from_note_promotions -q`
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot -t "Graph"`
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
- Highlight inbox rows and summaries expose derived Graph coverage for Home, custom collections, and Source scope.
- Rejected graph nodes do not count as coverage.
- Graph promotion marks unreviewed or dismissed notes reviewed and clears dismissal timestamps.
- Home/custom collection and Source review rows can create missing Graph nodes through Notebook.
- Covered rows/session items can open focused Graph on `graph_node_id`.
- Existing Reader, Notebook, Study, bulk triage, guided session, filters, and generated-output baselines remain stable.
- Cleanup dry-run reports `matchedCount: 0`.
