# Stage 1016 Home Relation Practice Queue Lens After Stage 1015

## Summary
Open a fresh Stage 1016/1017 slice that lifts Stage 1014 relation-practice readiness from Source overview into Home and custom collection Reading queues. Recall's current public direction emphasizes saved knowledge that becomes connected, reviewed, and resurfaced when useful. Stage 1014 made relation-backed Study cards visible once a source is already open; the next highest-leverage local-first move is to let the queue show which related-source connections are already practice-ready and open the existing Study Questions relation filter directly.

Sources checked: [Recall 2.0 changelog](https://feedback.recall.it/changelog/recall-release-notes-april-14-2026-recall-20), [Recall docs](https://docs.recall.it/), and [Connect Content docs](https://docs.recall.it/getting-started/5-linking-content).

## Key Changes
- Derive Home/custom collection relation-practice readiness from existing non-rejected Graph relation rows plus local Study cards whose `source_spans[].edge_id` matches the relation.
- Extend the existing frontend-only related-source summary with:
  - number of practice-ready relations
  - number of relation-backed Study questions
  - first practice-ready relation id for direct handoff
- In Home/custom collection Reading queue rows, show a compact practice-ready relation signal beside the existing related-source and confirmed-relation signal.
- Add a compact `Practice connection` / `Practice connections` action for rows with relation-backed Study cards. It opens the existing Study Questions surface scoped to that source and filtered to the selected Graph relation via the Stage 1014 `relationEdgeId` continuity.
- Preserve `Related sources` as the detailed handoff to Source overview when the user wants to inspect all related rows.
- Keep Stage 1014 Source overview relation-practice rows, Study relation filter chip/clear, Home related-source discovery, Graph relation review, generated Reader outputs, and Study FSRS ownership unchanged.

## Public APIs / Types
- No backend endpoint is required.
- No generated contract, OpenAPI snapshot, or database schema change is required.
- `RecallWorkspace` can extend its internal `SourceRelatedGraphConnectionSummary` shape only; public API types remain unchanged.
- Workspace export/restore remains backed by existing Graph and Study card payloads.

## Test Plan
- Frontend:
  - Home Reading queue related-source row shows a relation practice-ready signal when a non-rejected Graph relation has a matching Study card `source_spans[].edge_id`.
  - Home `Practice connection` opens Study Questions scoped to the source with the Stage 1014 relation filter active and only matching relation-backed cards visible.
  - Clearing the relation filter restores broader source-scoped Study Questions.
  - Custom collection Reading queue rows show the same practice-ready signal and action.
  - Related rows without relation-backed Study cards keep the existing related-source signal without a misleading practice action.
  - Existing Stage 1012 Home `Related sources` and Stage 1014 Source overview `Practice relation` tests remain stable.
- Browser/Playwright:
  - Use Browser Use first via `iab`.
  - Add `scripts/playwright/stage1016_home_relation_practice_queue_lens_after_stage1015.mjs`.
  - Capture Home queue relation-practice signal, custom collection queue signal, direct Study relation filter handoff/clear, Stage 1014 Source overview practice preservation, generated-output freeze, and cleanup dry-run `matchedCount: 0`.
- Regression gate:
  - Focused `App.test.tsx` Home relation-practice queue tests.
  - Focused Stage 1012/1014 related-source and relation-practice tests.
  - Frontend typecheck and build.
  - Stage 1016 Playwright audit.
  - Cleanup dry-run and `git diff --check`.

## Implementation Results
- Extended the internal related-source summary so Home/custom collection Reading queue rows derive practice-ready relation counts, question counts, due/new counts, and the first relation edge id from existing Graph rows plus local Study cards.
- Added `Practice connection` / `Practice connections` actions beside the existing `Related sources` action; the handoff reuses the Stage 1014 source-scoped Study relation filter.
- Added source-specific Study-card loading for visible Reading queue rows so relation-practice readiness is not accidentally limited by the global Study card fetch cap in large local workspaces.
- Added focused `App.test.tsx` coverage for Home, custom collection, no-practice related rows, Stage 1012 preservation, and Stage 1014 relation-practice preservation.
- Added `scripts/playwright/stage1016_home_relation_practice_queue_lens_after_stage1015.mjs` with Home/custom collection screenshots, direct Study relation-filter handoff/clear, Source overview preservation, generated-output freeze, and cleanup dry-run evidence.

## Assumptions
- "Practice-ready" means at least one non-deleted local Study card references a related Graph edge id.
- The Home action may open the first practice-ready relation by the same sorted priority used by Source overview; Source overview remains the full chooser.
- No relation practice state is stored separately.
- No chat, cloud sync, notifications, TTS, extension capture, Reader-output generation, AI note generation, generated Study changes, or FSRS changes are introduced.
