# Stage 1026 Graph Relation Practice Handoffs After Stage 1025

## Summary
Open a fresh Stage 1026/1027 slice that brings the Stage 1024 relation-practice learning loop into the Graph detail `Connections` tab. Home/custom collections and Source overview now distinguish ready, practiced, scheduled, unscheduled, and missing relation practice. The remaining high-leverage gap is that Graph connection rows still behave like graph-only exploration controls, even though Recall's public direction emphasizes saved knowledge, graph resurfacing, and review progress. Stage 1026 should make Graph relation rows show the same derived local practice state and offer the same Study/Create handoffs without adding backend state, cloud sync, chat/API work, generated Reader-output changes, or FSRS changes.

Sources checked: [Recall 2.0 changelog](https://feedback.getrecall.ai/changelog/recall-release-notes-april-14-2026-recall-20), [Quiz 2.0 review workflow](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-19-2026-quiz-20-with-shared-challenges), [Graph View 2.0 notes](https://feedback.getrecall.ai/changelog/recall-release-notes-jan-12-2026-graph-view-20-and-much-more), and [Recall card review docs](https://recall.cards/docs/studying).

## Key Changes
- Derive Graph connection-row practice state from existing local `StudyCardRecord.source_spans[].edge_id`, review/status fields, and selected Graph relation ids.
- In the selected Graph node `Connections` tab, show compact relation practice chips:
  - `No practice yet` when no relation-backed Study card exists
  - `practice question`, `due`, and `new` when a due/new relation card can start Review
  - `Practiced`, `Scheduled`, and `Unscheduled` when a relation-backed card exists but is not immediately reviewable
- Add Graph row handoffs:
  - `Practice connection` starts the existing relation-scoped Study review session for due/new relation cards.
  - `Study questions` opens relation-filtered Study Questions for practiced, scheduled, or unscheduled relation cards.
  - `Create practice card` creates a relation-backed Study card against the best local source document for that edge, then opens relation-filtered Study Questions.
- Keep Graph exploration actions intact: Follow, Confirm, Reject, and Open source/evidence remain available.
- Reuse existing Source/Home relation-practice helpers where practical; if needed, factor a generic relation-card creation helper from the Source-only path.
- Preserve Stage 1024 Home/Source behavior, relation-practice recap Source return, Reader generated-output freeze, cleanup hygiene, backend/public API shape, and Study FSRS ownership.

## Public APIs / Types
- No new endpoint is required.
- No database migration is required.
- No generated API contract drift is expected.
- Any new helper types remain frontend-local.

## Test Plan
- Frontend:
  - Graph selected node `Connections` row with a due/new relation card shows `Practice connection` and starts a relation-scoped Study Review session.
  - Graph selected node `Connections` row with a practiced/scheduled relation card shows practiced/scheduled state, hides `Practice connection`, and opens relation-filtered Study Questions through `Study questions`.
  - Graph selected node `Connections` row with no relation-backed card shows `No practice yet` and `Create practice card`, then creates a relation-backed local Study card and opens relation-filtered Study Questions.
  - Existing Home/Source relation practice and Graph connection review tests remain stable.
- Browser/Playwright:
  - Use Browser Use first if available; if its runtime is unavailable, record the reason and use repo Playwright.
  - Add `scripts/playwright/stage1026_graph_relation_practice_handoffs_after_stage1025.mjs`.
  - Capture Graph ready relation practice handoff, Graph practiced/scheduled state, Graph create-practice-card handoff, Source/Home Stage 1024 preservation, generated-output freeze, and cleanup dry-run `matchedCount: 0`.
- Regression gate:
  - Focused `App.test.tsx` Graph/relation-practice tests.
  - Frontend typecheck and build.
  - Backend `tests/test_api.py -q`.
  - Full `App.test.tsx`, `api.test.ts`, and full Vitest if focused changes are stable.
  - Cleanup dry-run and `git diff --check`.

## Assumptions
- Graph row practice state is derived, not persisted.
- `Practice connection` means an active relation-scoped Review can start now.
- `Study questions` is the correct browse/manage fallback for non-ready relation-backed cards.
- When an edge has multiple source documents, existing relation-backed cards choose their own `source_document_id`; otherwise Graph creation uses the first local source document attached to the edge or endpoint nodes.
- Graph should not auto-generate AI labels or relation cards; the explicit `Create practice card` action stays user-visible and local.

## Implementation Notes
- Added a frontend-local Graph relation practice source resolver that chooses an eligible relation-card source document first, then an existing relation-card source, then local edge/endpoint source documents.
- Factored the relation-backed Study card creation path so Source overview and Graph connection rows share the same local card payload.
- Graph detail `Connections` rows now expose Stage 1026 practice state data hooks, compact practice chips, and `Practice connection` / `Study questions` / `Create practice card` handoffs while preserving Follow, Confirm, Reject, and source-opening actions.
- Added focused App tests for Graph ready relation Review launch, Graph practiced/scheduled Study Questions fallback, and Graph no-card create-practice behavior.
- Added `scripts/playwright/stage1026_graph_relation_practice_handoffs_after_stage1025.mjs` with seeded Graph/Home/Source relation-practice evidence.

## Validation Results
- Red/green TDD: `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm test -- --run src/App.test.tsx --reporter=dot -t "Graph relation"` failed first against Stage 1025 behavior, then passed with 3 tests after implementation.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm test -- --run src/App.test.tsx --reporter=dot -t "Graph relation|relation practice"` - 6 passed, 198 skipped.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm exec tsc -- -b --pretty false` - passed.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm run build` - passed with the existing Vite chunk-size warning.
- In-app browser tooling opened `http://127.0.0.1:8001/recall?section=graph` and confirmed page title `Recall Workspace`.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader -- node scripts/playwright/stage1026_graph_relation_practice_handoffs_after_stage1025.mjs --base-url http://127.0.0.1:8001` - passed with Graph ready relation Review launch, Graph practiced/scheduled state, Graph no-practice create handoff, Home/Source relation-practice preservation, generated-output freeze, and cleanup dry-run `matchedCount: 0`.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/backend -- .venv/bin/python -m pytest tests/test_api.py -q` - 98 passed.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm test -- --run src/App.test.tsx --reporter=dot` - 204 passed.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm test -- --run src/api.test.ts --reporter=dot` - 12 passed.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader/frontend -- npm test -- --run --reporter=dot` - 301 passed, 20 skipped.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader -- node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=http://127.0.0.1:8001` - dry-run `matchedCount: 0`.
- `wsl -d Ubuntu --cd /home/fa507/dev/accessible_reader -- git diff --check` - passed.
