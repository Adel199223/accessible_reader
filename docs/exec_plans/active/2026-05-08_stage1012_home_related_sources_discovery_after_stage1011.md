# Stage 1012 Home Related Sources Discovery After Stage 1011

## Summary
Open a fresh Stage 1012/1013 slice that lifts Stage 1010's source-related Graph resurfacing from Source overview into Home and custom collection Reading queues. Recall's current public direction emphasizes saved knowledge, connected ideas, personal notes, review, and Graph-style exploration; this repo now derives related saved-source rows once a user opens a source, but Home still hides that connection signal until after the drill-in. The highest-leverage compliant move is to make connected saved sources visible where users choose what to read next, without adding chat, cloud sync, TTS, FSRS changes, generated Reader-output changes, or a new backend contract.

Sources checked: [Recall 2.0 changelog](https://feedback.recall.it/changelog/recall-release-notes-april-14-2026-recall-20), [Recall docs](https://docs.recall.it/), [Connect Content docs](https://docs.recall.it/getting-started/5-linking-content), [Knowledge Graph overview](https://docs.recall.it/deep-dives/graph/overview), and [Graph selection/exploration docs](https://docs.recall.it/deep-dives/graph/selection-and-exploration).

## Key Changes
- Derive per-source related-source summaries for Home Reading queue rows from existing non-rejected `KnowledgeGraphSnapshot.edges`, endpoint node `source_document_ids`, and saved source documents.
- Add compact Reading queue row status text for related saved sources and confirmed relations when present.
- Add a `Related sources` row action for sources with related-source Graph connections; it opens the existing Source overview so Stage 1010's related-source rows and Graph relation handoffs remain the detailed surface.
- Apply the same behavior to all Reading queue scopes, including Home built-in scopes and custom collection workspaces.
- Do not add Home Graph relation filters in this stage; the current row already carries reading state, highlight review, Study coverage, Graph gaps, and Study prompts, so the new signal should stay compact.
- Preserve existing handoffs: row primary still opens Reader, `Review highlights` keeps highlight review state, `Study prompts` opens Study Questions, Graph-gap rows keep the Not-in-Graph review handoff, and Source overview keeps `Open related source` plus `Open relation` / `Review relation`.

## Public APIs / Types
- No backend endpoint is required.
- Existing `GET /api/recall/graph` supplies nodes, edges, status, evidence counts, and source document ids.
- Existing `GET /api/recall/library/reading-queue` remains unchanged; related-source summaries are derived on the frontend from already-loaded Graph and document state.
- No generated API contract, OpenAPI snapshot, or schema drift is expected.

## Test Plan
- Frontend:
  - Home Reading queue rows show related-source and confirmed-relation status derived from Graph relations.
  - Rejected Graph relations do not create related-source row signals.
  - `Related sources` opens the existing Source overview for that row.
  - Custom collection Reading queue rows show the same related-source signal for collection-scoped queues.
  - Existing Graph gaps learning filter and highlight review handoff remain stable.
  - Existing Stage 1010 Source overview related-source rows and focused Graph relation handoff remain stable.
- Browser/Playwright:
  - Use Browser Use first via `iab`.
  - Add `scripts/playwright/stage1012_home_related_sources_discovery_after_stage1011.mjs`.
  - Capture Home Reading queue related-source signal, custom collection queue signal, Source overview handoff to Stage 1010 related-source rows, focused Graph relation handoff, Stage 1010 preservation, generated-output freeze, and cleanup dry-run `matchedCount: 0`.
- Regression gate:
  - Focused `App.test.tsx` Home related-source tests.
  - Focused Stage 1010 related-source tests.
  - Full `App.test.tsx`, `api.test.ts`, full Vitest, frontend typecheck, and build.
  - Backend `tests/test_api.py` if any API behavior drifts.
  - Stage 1010 and Stage 1008 Playwright reruns.
  - Cleanup dry-run and `git diff --check`.

## Assumptions
- Related-source discovery is derived UI state, not a persisted recommendation model.
- "Related sources" describes source-to-source Graph relationships; "Connected" remains reserved for highlight note-to-Graph coverage.
- Home rows should expose the signal and handoff without turning the Reading queue into a second Graph review queue.
- The detailed relation review path remains owned by Source overview and Graph.

## Implementation Notes
- Completed Stage 1012 by deriving Home/custom collection Reading queue related-source summaries from the existing Graph snapshot and saved source documents.
- Added compact related-source status and `Related sources` row action only when non-rejected Graph relations connect the row source to another saved source.
- Preserved existing Reading queue, Reader, highlight review, Study, Graph-gap, Source overview, and focused Graph handoffs without backend schema, endpoint, generated contract, Reader-output, or FSRS changes.
