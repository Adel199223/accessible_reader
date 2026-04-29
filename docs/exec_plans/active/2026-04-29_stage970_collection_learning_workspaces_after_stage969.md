# Stage 970 - Collection Learning Workspaces After Stage 969

## Status

Completed on April 29, 2026.

## Intent

Make hierarchical Library collections usable from the places users actually learn, not just from Home organization. Stage 970 turns collections into source-aware learning workspaces with collection review, graph, export, and organize-in-place actions while preserving local-first Recall behavior.

## Scope

- Add read-only collection workspace APIs for overview and collection learning-pack ZIP export.
- Derive collection path, direct/descendant source membership, memory counts, Study due/new counts, and recent activity from existing Library settings and local source memory data.
- Add Home collection workspace actions for selected custom collections: Review collection, Study questions, Graph collection, Export collection pack, and Continue reading.
- Add source-owned organize-in-place affordances in Source overview for assigning/removing the current source from existing root/child collections and creating a new collection.
- Show compact collection context in Reader source-owned chrome while routing editing to Source overview.
- Preserve parent membership as computed descendant membership, Study collection filters/sessions, Graph focus semantics, source learning-pack provenance, workspace export/restore, FSRS scheduling, Reader generated-output freeze, and cleanup hygiene.

## Validation Plan

- Backend tests for collection overview root/child/parent/empty/missing behavior and collection learning-pack ZIP export.
- Frontend tests for Home collection workspace actions, collection-filtered Study handoff, Graph collection focus, Source overview organize-in-place persistence, and Reader collection context.
- Focused Stage 970 Playwright evidence for collection overview actions, source organize-in-place, Reader context, Study/Graph handoffs, export ZIP, and cleanup dry-run `matchedCount: 0`.
- Broad Stage 971 audit evidence plus backend/frontend tests, typecheck, build, and `git diff --check`.

## Completion Notes

- Added collection overview and collection learning-pack ZIP export APIs using existing Library settings, source memory, Study cards, and source learning-pack export primitives.
- Added Home selected-collection workspace actions, collection-filtered Study session launch, stable collection-id Graph focus, Reader collection context, and Source overview organize-in-place assignment/creation.
- Added backend, API, App, and Playwright coverage for parent descendant membership, export availability, Reader context, Source organize-in-place, and cleanup hygiene.
