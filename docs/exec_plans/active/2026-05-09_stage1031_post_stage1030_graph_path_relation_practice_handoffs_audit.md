# Stage 1031 Post-Stage-1030 Graph Path Relation Practice Handoffs Audit

## Summary
Audit Stage 1030's Graph path-to-Study loop. The audit must prove that a found Graph Path Finder result derives practice coverage from existing relation-backed Study cards, starts a path-scoped Review session only for eligible path cards, and returns from the Study recap to the same highlighted Graph path without changing backend contracts, generated Reader outputs, FSRS ownership, Source/Home relation-practice returns, or cleanup hygiene.

## Audit Checklist
- Graph Path Finder can select two nodes and find a visible shortest path.
- The Graph focus rail shows compact path practice status after the path is found.
- `Practice path` is visible only when the highlighted path has eligible due/new relation-backed Study cards.
- Starting path practice creates a Study Review session whose snapshot includes `launch_intent: "graph-path-practice-review"`, `return_surface: "graph_path"`, `path_edge_ids`, `path_node_ids`, and path label.
- Rating the path practice card reaches a `Path practiced` recap.
- `Back to Graph path` returns to Graph with the original path endpoints selected, the path result active, and the path edges highlighted.
- A path without relation-backed Study cards shows a no-practice state and no false-ready Review action.
- Stage 1028 Graph single-connection recap still returns to `Back to Graph connection`.
- Source/Home relation-practice recap still returns through Source-focused behavior.
- Generated Reader outputs remain frozen.
- Cleanup dry-run reports `matchedCount: 0`.

## Validation Commands
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm test -- --run src/App.test.tsx --reporter=dot -t "Graph path|Graph relation practice|Relation practice review sessions"`
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm exec tsc -- -b --pretty false`
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm run build`
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader -- node scripts/playwright/stage1030_graph_path_relation_practice_handoffs_after_stage1029.mjs --base-url http://127.0.0.1:8001`
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader -- node scripts/playwright/stage1028_graph_relation_practice_return_loop_after_stage1027.mjs --base-url http://127.0.0.1:8001`
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/backend -- .venv/bin/python -m pytest tests/test_api.py -q`
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm test -- --run src/App.test.tsx --reporter=dot`
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm test -- --run src/api.test.ts --reporter=dot`
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm test -- --run --reporter=dot`
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader -- node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=http://127.0.0.1:8001`
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader -- git diff --check`

## Evidence To Capture
- Graph path selected before launch.
- Found path with compact path practice state and `Practice path`.
- Active path-scoped Study Review session.
- Path-practice recap.
- Returned highlighted Graph path.
- Stage 1028 single-connection return preservation.
- Cleanup dry-run result.

## Audit Results
- Stage 1030 Playwright passed and wrote `output/playwright/stage1030-graph-path-relation-practice-handoffs-validation.json`.
- Captures:
  - `output/playwright/stage1030-graph-path-practice-ready.png`
  - `output/playwright/stage1030-graph-path-practice-active-session.png`
  - `output/playwright/stage1030-graph-path-practice-recap.png`
  - `output/playwright/stage1030-graph-path-practice-return.png`
- Metrics confirmed:
  - `graphPathResultVisible: true`
  - `graphPathPracticeStatusVisible: true`
  - `graphPathPracticeStartsSession: true`
  - `graphPathPracticeSnapshotCarriesPathOrigin: true`
  - `graphPathPracticeRecapShowsGraphPathReturn: true`
  - `graphPathPracticeReturnHighlightsGraphPath: true`
  - `graphPathScheduledStateAvoidsFalseReady: true`
  - `generatedReaderOutputsFrozen: true`
  - `cleanupUtilityDryRunMatchedAfterStage1030: 0`
- Stage 1028 Playwright rerun passed with Graph single-connection return, Source return preservation, generated-output freeze, and cleanup dry-run `matchedCount: 0`.
- Regression gate passed: backend API tests, frontend typecheck, build, focused Graph path/relation tests, full `App.test.tsx`, `api.test.ts`, full Vitest, cleanup dry-run, and `git diff --check`.
