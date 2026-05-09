# Stage 1011 Post-Stage-1010 Source Related Connections Audit

## Summary
Audit Stage 1010's Source overview related-source Graph resurfacing. The audit must prove related saved sources are derived from existing non-rejected Graph relations, navigate to the related source, open the existing Graph relation surface, and do not disturb Stage 1008 source-scoped relation review, Stage 1006 global relation review, highlight review Graph coverage, Reader outputs, FSRS, or cleanup hygiene.

## Audit Scope
- Source overview related-source rows derived from Graph relations.
- Related-source row status, relation label, and evidence count display.
- `Open related source` handoff to the existing Source overview.
- `Open relation` / `Review relation` handoff into focused Graph relation review.
- Stage 1008 Source overview suggested connection counts and `Review connections` handoff.
- Stage 1008 Graph connection review scopes for `All`, `This source`, `Strong`, and `Multi-evidence`.
- Stage 1006 relation focus, Reader evidence handoff, confirm/reject decisions, and snapshot refresh.
- Existing highlight review Graph coverage filters, generated Reader-output freeze, Study FSRS behavior, and cleanup dry-run hygiene.

## Validation Commands
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot -t "related Graph source"`
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot -t "Graph connection review"`
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot`
- `cd frontend && npm test -- --run src/api.test.ts --reporter=dot`
- `cd frontend && npm test -- --run --reporter=dot`
- `cd frontend && npm exec tsc -- -b --pretty false`
- `cd frontend && npm run build`
- `cd backend && .venv/bin/python -m pytest tests/test_api.py -q`
- `node scripts/playwright/stage1010_source_related_connections_after_stage1009.mjs --base-url=<live-url>`
- `node scripts/playwright/stage1008_source_scoped_graph_connection_review_after_stage1007.mjs --base-url=<live-url>`
- `node scripts/playwright/stage1006_graph_connection_review_queue_after_stage1005.mjs --base-url=<live-url>`
- `node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=<live-url>`
- `git diff --check`

## Exit Criteria
- Source overview shows related-source rows only for non-rejected relations connecting the active source to another saved source.
- Related rows prioritize confirmed relations before suggested relations and remain compact.
- `Open related source` moves to the related source without losing the existing source overview model.
- Relation handoffs reuse the existing Graph relation focus and suggested-edge review behavior.
- Stage 1008 source-scoped queue behavior and Stage 1006 global queue behavior remain stable.
- Existing highlight-review Graph coverage, Study semantics, Reader outputs, FSRS behavior, and generated API contracts remain stable.
- Cleanup dry-run remains `matchedCount: 0`.

## Audit Results
- Implemented Stage 1010 as a UI-derived related-source resurfacing layer over existing non-rejected Graph relations. Source overview now shows compact related-source rows inside `Graph context`, with relation label, suggested/confirmed status language, evidence count, `Open related source`, and `Review relation` / `Open relation` handoffs.
- Kept Stage 1008 source-scoped `Review connections` intact: suggested relation counts still open Graph with `This source` selected, while the new related-source rows reuse the existing Graph relation focus rather than adding a new review model, schema, endpoint, generated contract, Reader output, or FSRS behavior.
- Browser Use / in-app smoke at `http://127.0.0.1:8001/recall?section=library` confirmed the rebuilt Recall workspace loaded with zero warning/error console logs.
- `node scripts/playwright/stage1010_source_related_connections_after_stage1009.mjs --base-url=http://127.0.0.1:8001` - passed with Source overview related-source rows, related-source navigation, focused Graph relation handoff, Stage 1008 source-scoped queue preservation, generated-output freeze, and cleanup dry-run `matchedCount: 0`.
- `node scripts/playwright/stage1008_source_scoped_graph_connection_review_after_stage1007.mjs --base-url=http://127.0.0.1:8001` - passed with Source overview Graph-connection counts/handoff, source-scoped Graph queue, relation focus, Reader evidence handoff, confirm refresh, Stage 1006 global queue preservation, Graph gap preservation, generated-output freeze, and cleanup dry-run `matchedCount: 0`.
- `node scripts/playwright/stage1006_graph_connection_review_queue_after_stage1005.mjs --base-url=http://127.0.0.1:8001` - passed with global queue, relation focus, Reader evidence handoff, confirm refresh, Graph gap preservation, generated-output freeze, and cleanup dry-run `matchedCount: 0`.
- `cd backend && .venv/bin/python -m pytest tests/test_api.py -q` - 98 passed.
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot -t "related Graph source|Graph connection review"` - 6 passed, 186 skipped.
- `cd frontend && npm test -- --run src/App.test.tsx --reporter=dot` - 192 passed.
- `cd frontend && npm test -- --run src/api.test.ts --reporter=dot` - 12 passed.
- `cd frontend && npm test -- --run --reporter=dot` - 289 passed, 20 skipped.
- `cd frontend && npm exec tsc -- -b --pretty false` - passed.
- `cd frontend && npm run build` - passed with the existing Vite chunk-size warning.
- `node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=http://127.0.0.1:8001` - dry-run `matchedCount: 0`.
- `git diff --check` - passed.
