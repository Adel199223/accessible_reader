# Stage 1029 Post-Stage-1028 Graph Relation Practice Return Loop Audit

## Summary
Audit Stage 1028's Graph-origin relation-practice return loop. The audit must prove that Graph-launched `Practice connection` sessions preserve Graph origin in the existing Study session snapshot, show Graph-specific recap copy, and return to the focused Graph connection row without changing Source-launched relation-practice returns, backend contracts, generated Reader outputs, FSRS ownership, cloud/chat/TTS/import behavior, or cleanup hygiene.

## Audit Checklist
- Graph relation `Practice connection` starts Review from a due/new relation-backed Study card.
- The session snapshot includes `launch_intent: "relation-practice-review"`, `return_surface: "graph"`, `relation_edge_id`, `relation_label`, `source_document_id`, and Graph node context.
- After rating, the recap shows `Connection practiced` and `Back to Graph connection`.
- `Back to Graph connection` returns to Graph, opens/focuses the practiced relation path, shows the `Connections` tab, and marks the target relation row as focused.
- Source-launched relation practice still shows `Back to source connection` and returns to Source overview with the focused relation row.
- Stage 1026 Graph practiced/scheduled Study Questions fallback and no-practice create handoff still work.
- Generated Reader outputs remain frozen.
- Cleanup dry-run reports `matchedCount: 0`.

## Validation Commands
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm test -- --run src/App.test.tsx --reporter=dot -t "Graph relation practice|Relation practice review sessions"`
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm exec tsc -- -b --pretty false`
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm run build`
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader -- node scripts/playwright/stage1028_graph_relation_practice_return_loop_after_stage1027.mjs --base-url http://127.0.0.1:8001`
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/backend -- .venv/bin/python -m pytest tests/test_api.py -q`
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm test -- --run src/App.test.tsx --reporter=dot`
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm test -- --run src/api.test.ts --reporter=dot`
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm test -- --run --reporter=dot`
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader -- node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=http://127.0.0.1:8001`
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader -- git diff --check`

## Evidence To Capture
- Graph connection row before launch.
- Active relation-practice Study session launched from Graph.
- Graph-specific relation-practice recap.
- Returned focused Graph connection row.
- Source-launched return preservation.
- Cleanup dry-run result.

## Audit Results
- Browser identity: in-app Browser tooling confirmed the live Recall Workspace at `http://127.0.0.1:8001/recall?section=graph`.
- Stage 1028 Playwright evidence passed and wrote `/home/fa507/dev/accessible_reader/output/playwright/stage1028-graph-relation-practice-return-loop-validation.json`.
- Captures were written under `/home/fa507/dev/accessible_reader/output/playwright/` for Graph connection launch, active Study session, Graph recap, focused Graph return, Source connection, Source recap, and Source return.
- Metrics confirmed `graphPracticeConnectionStartsSession: true`, `graphPracticeSnapshotCarriesGraphOrigin: true`, `graphPracticeRecapShowsGraphReturn: true`, `graphPracticeReturnFocusesGraphConnection: true`, `sourcePracticeRecapKeepsSourceReturn: true`, `sourcePracticeReturnFocusesSourceConnection: true`, `generatedReaderOutputsFrozen: true`, and `cleanupUtilityDryRunMatchedAfterStage1028: 0`.
- Focused relation-practice tests, frontend typecheck, backend API tests, full `App.test.tsx`, `api.test.ts`, full Vitest, frontend build, and cleanup dry-run all passed.
