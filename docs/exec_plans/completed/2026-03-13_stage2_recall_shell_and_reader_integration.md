# ExecPlan: Stage 2 Recall-First Shell and Reader Integration

## Purpose
- Make `Recall` the product shell without rewriting or destabilizing the current reader.
- Preserve the accessible-reader experience as an integrated reader section inside the new Recall-first app shell.
- Turn the shared backend schema groundwork into a usable Stage 2 vertical slice with chunking, keyword retrieval, and Markdown export.

## Scope
- In scope:
  - roadmap and continuity updates that close Stage 1 and activate Stage 2
  - deterministic content chunk generation and startup backfill
  - Recall-focused backend listing, search, and Markdown export routes
  - a Recall-first frontend shell with explicit Recall and Reader sections
  - route-based handoff from Recall into the existing reader flow
- Out of scope:
  - repo renaming
  - API-wide renaming of current reader routes
  - notes, graph editing, study workflows, or embeddings-based retrieval
  - local TTS or AI scope expansion

## Assumptions
- Stage 1 is complete because the interrupted validation rerun has been verified green.
- The repo stays one workspace with a shared backend and a Recall-first product shell.
- The current reader API, speech behavior, and AI boundaries remain stable during this slice.
- `Reflowed` is the canonical export source because it is deterministic and local-first.

## Milestones
1. Close Stage 1 in docs and activate a Stage 2 ExecPlan.
2. Implement backend chunking, chunk backfill, Recall list/search, and Markdown export.
3. Introduce a Recall-first frontend shell and integrate the current reader into a dedicated Reader section.
4. Validate end to end in WSL plus one manual Edge smoke pass.

## Detailed Steps
1. Update the roadmap and continuity docs so Stage 2 is the active milestone and Stage 1 is recorded as completed only after the resumed validation rerun.
2. Extend backend shared storage for deterministic chunking:
   - sync chunks from the default `reflowed` variant
   - split oversized blocks by sentence boundaries with stable ordinals and provenance metadata
   - add chunk FTS and startup backfill for existing documents
3. Add Recall backend APIs:
   - `GET /api/recall/documents`
   - `GET /api/recall/documents/{document_id}`
   - `GET /api/recall/search`
   - `GET /api/recall/documents/{document_id}/export.md`
4. Keep current reader APIs stable while adding shared response models for Recall list/search payloads.
5. Rework the frontend shell so the app lands on Recall by default and keeps Reader as a dedicated section.
6. Add Recall document browsing, keyword retrieval, `Open in Reader`, and Markdown export actions without mixing those controls into the reader surface.
7. Extend backend and frontend tests for chunking, search, export, Recall shell routing, and Reader handoff.

## Decision Log
- 2026-03-13: `Recall` is the default product shell, while the accessible reader remains an integrated Reader section instead of a standalone top-level app.
- 2026-03-13: The repo name and broad package/API renaming are deferred until after the Recall shell is stable.
- 2026-03-13: Stage 2 retrieval stays keyword and FTS based; embeddings, notes, and study remain later milestones.
- 2026-03-13: Markdown export uses the deterministic `reflowed` variant and appends provenance instead of exporting AI-generated variants.

## Validation
- Backend in WSL:
  - `.venv/bin/python -m pytest`
  - `.venv/bin/python -c "from app.main import app; print(app.title)"`
- Frontend in WSL:
  - `npm test -- --run`
  - `npm run lint`
  - `npm run build`
- Manual browser check:
  - Edge smoke pass for Recall landing, document search, Reader handoff, and Markdown export download

## Replan Triggers
- Deep-link routing requires a larger backend/static-serving change than a bounded Stage 2 shell update.
- Chunk backfill or Recall FTS breaks current reader reopen, progress, or delete behavior.
- The shared document shape proves too thin for Recall export/search without a broader schema redesign.
