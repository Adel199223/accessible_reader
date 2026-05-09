# Stage 1008 Source-Scoped Graph Connection Review After Stage 1007

## Summary
Open a fresh Stage 1008/1009 slice that makes Stage 1006's Graph connection-review queue source-aware. Recall's latest public direction emphasizes intentionally engaging with saved knowledge, discovering relationships between saved items, and using Graph View to reveal connected ideas. This repo now exposes suggested Graph relations as a review queue, but a user studying one source still has to process the global queue. The highest-leverage compliant move is to add a source-scoped connection review handoff from Source overview into Graph and compact Graph queue filters for all/source/strong/multi-evidence suggestions.

Sources checked: [Recall 2.0 changelog](https://feedback.recall.it/changelog/recall-release-notes-april-14-2026-recall-20), [Recall docs](https://docs.recall.it/), [Connect Content docs](https://docs.recall.it/getting-started/5-linking-content), [Knowledge Graph overview](https://docs.recall.it/deep-dives/graph/overview), and [Graph selection/exploration docs](https://docs.recall.it/deep-dives/graph/selection-and-exploration).

## Key Changes
- Keep Graph connection review derived from existing `KnowledgeGraphSnapshot.edges` where `status === "suggested"`; do not add persisted queue state, schema, or API endpoints.
- Add compact Graph queue scopes:
  - `All` suggested connections.
  - `This source` when Graph is focused on a source.
  - `Strong` suggestions with high confidence.
  - `Multi-evidence` suggestions with more than one evidence span.
- Make the queue rows/counts reflect the selected scope while preserving Stage 1006 row actions: `Review connection`, `Open evidence`, `Confirm`, and `Reject`.
- Add Source overview Graph-context counts for source-local suggested connections.
- Add `Review connections` from Source overview to open Graph focused on that source with the `This source` queue selected.
- Keep Source highlight review Graph-gap behavior separate from relation review: highlight `Connected` / `Not in Graph` filters continue to describe note-to-node coverage, not suggested edge decisions.
- Preserve Stage 1004 Graph gap build queue, Stage 1006 relation focus/evidence/decision flow, Reader outputs, Study coverage semantics, FSRS, and cleanup hygiene.

## Public APIs / Types
- No new backend endpoint is required.
- Existing `GET /api/recall/graph` supplies suggested edges and source document ids.
- Existing `POST /api/recall/graph/edges/{edge_id}/decision` remains the only relation decision path.
- No generated API contract, OpenAPI snapshot, or backend schema drift is expected.

## Test Plan
- Frontend:
  - Graph connection review queue exposes compact scope controls.
  - `This source` filters suggested edges to the active source and falls back quietly when no source is active.
  - `Strong` and `Multi-evidence` filters update rows/counts without changing decision behavior.
  - Source overview Graph context shows source-local suggested connection counts and a `Review connections` handoff.
  - Source overview handoff opens Graph focused on that source with the source-scoped connection queue.
  - Existing Stage 1006 `Review connection`, `Open evidence`, `Confirm`, and `Reject` actions remain stable.
- Browser/Playwright:
  - Use Browser Use first via `iab`.
  - Add `scripts/playwright/stage1008_source_scoped_graph_connection_review_after_stage1007.mjs`.
  - Capture Source overview Graph-context handoff, source-scoped Graph queue, relation focus, evidence handoff, Stage 1006 global queue preservation, Stage 1004 Graph gap preservation, generated-output freeze, and cleanup dry-run `matchedCount: 0`.
- Regression gate:
  - Focused `App.test.tsx` Graph connection tests.
  - Source overview focused tests for the new handoff.
  - Full `App.test.tsx`, `api.test.ts`, full Vitest, frontend typecheck, and build.
  - Backend `tests/test_api.py` if any API behavior drifts.
  - Stage 1006 and Stage 1004 Playwright reruns.
  - Cleanup dry-run and `git diff --check`.

## Assumptions
- Source-scoped relation review is UI-derived from edge/source metadata; it is not a new review model.
- Strong suggestions use the existing edge confidence value; multi-evidence uses `evidence_count`.
- Edges may be associated with more than one source, so `This source` matches any source document id attached to the edge or either endpoint node.
- If the Graph sidebar becomes crowded, the scope controls stay as compact chips inside the existing connection review section.
