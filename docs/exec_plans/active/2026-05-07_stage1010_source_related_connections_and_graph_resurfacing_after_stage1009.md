# Stage 1010 Source Related Connections And Graph Resurfacing After Stage 1009

## Summary
Open a fresh Stage 1010/1011 slice that turns Stage 1008's source-scoped Graph connection review into useful source-to-source resurfacing. Recall's current public direction emphasizes saved knowledge, connected ideas, Graph exploration, and reviewable relationships. This repo now lets a user review source-local suggested Graph relations, but Source overview still stops at counts and a queue handoff. The highest-leverage compliant move is to derive related saved sources from existing non-rejected Graph relations and make them navigable from Source overview without adding chat, cloud sync, TTS, FSRS changes, generated Reader-output changes, or a new backend contract.

Sources checked: [Recall 2.0 changelog](https://feedback.recall.it/changelog/recall-release-notes-april-14-2026-recall-20), [Recall docs](https://docs.recall.it/), [Connect Content docs](https://docs.recall.it/getting-started/5-linking-content), [Knowledge Graph overview](https://docs.recall.it/deep-dives/graph/overview), and [Graph selection/exploration docs](https://docs.recall.it/deep-dives/graph/selection-and-exploration).

## Key Changes
- Derive related source rows in Source overview from existing `KnowledgeGraphSnapshot.edges` and endpoint node `source_document_ids`.
- Include non-rejected Graph relations only; confirmed relations should sort before suggestions, and rejected relations should never surface.
- Keep Stage 1008 suggested-relation counts and `Review connections` intact.
- Add a compact Source overview `Related sources` list inside the existing Graph context section when a relation connects the active source to another saved source.
- Each related-source row should show the related source, relation label, status language, and evidence count.
- Add `Open related source` to switch to that source's existing Source overview.
- Add `Open relation` / `Review relation` to focus the existing Graph relation surface and reuse Stage 1006/1008 review behavior.
- Preserve existing handoffs: source-local Graph nodes still open focused Graph, suggested relations still open the Graph review queue, Reader evidence handoff remains owned by Graph relation review, and source memory/search/review/Study surfaces keep their current semantics.

## Public APIs / Types
- No new backend endpoint is required.
- Existing `GET /api/recall/graph` supplies nodes, edges, status, evidence counts, and source document ids.
- Existing `POST /api/recall/graph/edges/{edge_id}/decision` remains the only relation decision path.
- No generated API contract, OpenAPI snapshot, or schema drift is expected.

## Test Plan
- Frontend:
  - Source overview derives related sources from a Graph relation that spans the active source and another saved source.
  - Confirmed related-source rows show before suggested rows.
  - Rejected relations do not produce related-source rows.
  - `Open related source` navigates to the related source's existing Source overview.
  - `Open relation` / `Review relation` focuses the existing Graph relation surface without changing decision semantics.
  - Stage 1008 source-scoped `Review connections` and scope controls remain stable.
- Browser/Playwright:
  - Use Browser Use first via `iab`.
  - Add `scripts/playwright/stage1010_source_related_connections_after_stage1009.mjs`.
  - Capture Source overview related-source rows, related-source navigation, relation focus/review handoff, Stage 1008 source-scoped queue preservation, Stage 1006 global queue preservation, generated-output freeze, and cleanup dry-run `matchedCount: 0`.
- Regression gate:
  - Focused `App.test.tsx` source-related Graph tests.
  - Focused Stage 1008 source overview/Graph connection tests.
  - Full `App.test.tsx`, `api.test.ts`, full Vitest, frontend typecheck, and build.
  - Backend `tests/test_api.py` if any API behavior drifts.
  - Stage 1008 and Stage 1006 Playwright reruns.
  - Cleanup dry-run and `git diff --check`.

## Assumptions
- Related-source resurfacing is derived UI state, not a new persisted recommendation model.
- "Related sources" should describe source-to-source knowledge relationships; "Connected" remains reserved for note-to-Graph coverage in highlight review.
- Edges can associate sources through edge `source_document_ids` or endpoint node `source_document_ids`, so the derivation should inspect both.
- If the Graph context section becomes crowded, show only a compact top slice of rows plus existing Graph handoffs.
