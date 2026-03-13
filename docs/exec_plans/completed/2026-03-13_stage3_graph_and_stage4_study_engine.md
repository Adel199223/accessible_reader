# ExecPlan: Combined Stage 3 Knowledge Graph and Stage 4 Study Engine

## Purpose
- Deliver the next two roadmap milestones in one pass because the user explicitly requested Stage 3 and Stage 4 together.
- Turn the shared document core into a provenance-aware local knowledge workspace with graph suggestions, hybrid retrieval, and spaced-review workflows.
- Keep the Stage 2 Recall shell and current Reader stable while expanding the backend and Recall surface underneath them.

## Scope
- In scope:
  - roadmap and continuity updates that mark Stage 2 complete and activate one combined Stage 3/4 pass
  - deterministic local graph extraction over shared `reflowed` document content
  - confidence-ranked graph suggestions and a manual confirm/reject loop
  - hybrid retrieval across chunks, graph nodes, and study cards
  - source-grounded study card generation and FSRS-backed review logging
  - Recall UI additions for graph inspection, correction, retrieval, and study review
- Out of scope:
  - MV3 extension work
  - cloud sync, notes, or collaboration
  - local TTS
  - AI scope expansion beyond opt-in `Simplify` and `Summary`

## Assumptions
- Stage 2 is complete and should remain behaviorally stable while Stage 3/4 lands.
- Graph extraction should be local-first and deterministic, so the first version will use heuristic extraction and lexical signals instead of mandatory online models.
- FSRS scheduling should be real enough to preserve state and review history across sessions, even if card generation remains intentionally bounded and source-driven.
- The workspace is small enough that full graph and study backfills at startup remain acceptable for this slice.

## Milestones
1. Close Stage 2 in planning docs and activate this combined Stage 3/4 ExecPlan.
2. Implement deterministic graph extraction plus manual graph feedback.
3. Implement hybrid retrieval and study-card generation on top of the graph and chunk core.
4. Extend Recall UI for graph, retrieval, and study flows without destabilizing Reader.
5. Validate backend, frontend, and one live browser smoke path end to end.

## Detailed Steps
1. Update roadmap continuity:
   - record Stage 2 as complete
   - note that Stage 3 and Stage 4 are being executed together by explicit user request
   - make Stage 5 the next milestone after this slice
2. Extend backend graph infrastructure:
   - extract entity mentions deterministically from `reflowed` views and chunks
   - aggregate mentions into global knowledge nodes with deterministic IDs
   - infer relation edges with provenance-rich evidence and ranked confidence
   - persist node and edge review status so suggestions can be confirmed or rejected
3. Add graph APIs:
   - graph summary/listing
   - node detail with supporting mentions and relations
   - manual decision endpoints for graph suggestions
4. Add retrieval and study backend infrastructure:
   - build deterministic lexical vectors in the shared embeddings table
   - combine keyword, lexical, and graph evidence into hybrid retrieval ranking
   - generate stable, source-grounded review cards from graph evidence and chunk text
   - preserve review-card scheduling state and review-event history across regeneration
   - wire FSRS-backed review updates for `forgot`, `hard`, `good`, and `easy`
5. Add Recall UI sections:
   - keep the existing library/detail flow
   - add a graph section that exposes suggestions, evidence, and manual confirm/reject actions
   - add a study section that shows queue state, generated cards, review controls, and hybrid retrieval
6. Expand test coverage:
   - graph extraction and startup backfill
   - graph feedback persistence
   - hybrid retrieval ranking and evidence
   - deterministic card generation and FSRS review updates
   - Recall UI graph and study workflows
   - Reader route and Stage 2 export/handoff regressions

## Decision Log
- 2026-03-13: Stage 3 and Stage 4 are being implemented together only because the user explicitly requested the combined pass.
- 2026-03-13: Graph extraction stays heuristic and deterministic for this slice; large local ML extractors remain future benchmarking work.
- 2026-03-13: The shared embeddings table stores sparse lexical vectors so hybrid retrieval remains local and dependency-light.
- 2026-03-13: Review-card IDs must be deterministic so regeneration does not erase FSRS state or review logs.
- 2026-03-13: Manual correction in v1 means confirm/reject loops over suggested nodes and edges, not full graph editing.

## Validation
- Backend in WSL:
  - `.venv/bin/python -m pytest`
  - `.venv/bin/python -c "from app.main import app; print(app.title)"`
- Frontend in WSL:
  - `npm test -- --run`
  - `npm run lint`
  - `npm run build`
- Manual browser check:
  - Recall graph inspection
  - graph confirm/reject loop
  - hybrid retrieval
  - study-card review cycle
  - Reader handoff and Markdown export still working

## Replan Triggers
- Heuristic graph extraction produces unusably noisy nodes or relations in normal imported documents.
- Preserving FSRS state across deterministic card regeneration proves incompatible with the current schema.
- Hybrid retrieval requires a broader search/index redesign than a bounded Stage 3/4 slice allows.
- The new Recall sections destabilize Reader import, speech, progress, or Stage 2 export behavior.
