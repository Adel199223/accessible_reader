# ExecPlan: Stage 1 Baseline Stabilization and Shared Core Extraction

## Purpose
- Stabilize the current accessible-reader branch once the active reader/UI work settles.
- Extract the reader's document/storage pipeline into a shared local document core without changing the shipped reader API or speech behavior.
- Reframe the repo as the reader/converter sibling app inside a broader local-first knowledge workspace.

## Scope
- In scope:
  - frontend validation reconciliation after the active reader/UI pass lands
  - roadmap and continuity docs for the new staged direction
  - shared backend document-core schema and migration groundwork
  - storage compatibility so current reader data still opens after the workspace migration
- Out of scope:
  - a new Recall frontend surface
  - graph extraction, spaced repetition, browser extension work, or sync
  - local TTS or AI scope expansion

## Assumptions
- The current accessible-reader app remains the reader/converter sibling app.
- The backend stays the single local service host for both the reader and future Recall surfaces.
- Existing reader routes remain stable while storage moves underneath them.
- Dirty repo state may include user work, so edits must stay narrowly scoped and avoid unrelated reversions.

## Milestones
1. Stage 1A: reconcile frontend validation after the active reader UI/web-link pass is ready.
2. Stage 1B: introduce a shared document-core schema, migration path, and adapter-backed repository behavior.
3. Update roadmap continuity and future-integration notes once the slice is validated.

## Detailed Steps
1. Park the UI-only ExecPlan and replace it with this Stage 1 plan.
2. Add the persistent planning docs required by the new roadmap:
   - stage research brief
   - decision, risk, assumption, and backlog logs
   - repo-fit log
   - future integration logs for accessibility/converter and tablet companion work
3. Reconcile frontend regressions after the user-owned reader/UI pass lands:
   - rerun lint, tests, and build against the latest accessible-reader branch
   - align component tests with the final accessibility model and library row actions
   - preserve the upcoming web-link import path while reconnecting to the shared core
4. Introduce shared backend domain contracts for the document core.
5. Migrate storage from the reader-only schema toward a workspace schema:
   - use `workspace.db` as the primary local database
   - migrate from `reader.db` when present
   - add namespaced shared tables for source documents, document variants, reading sessions, app settings, change events, and future Recall groundwork
   - keep reader-facing repository methods and API responses unchanged
6. Add migration and compatibility tests so current reader data survives the schema transition.
7. Update roadmap and anchor docs so the active milestone is Stage 1A/1B, not further UI-only polish.

## Decision Log
- 2026-03-13: The repo will remain one workspace with the current accessible-reader app preserved as the reader/converter sibling.
- 2026-03-13: Shared-core extraction will happen behind the current reader API instead of through a rewrite or parallel backend.
- 2026-03-13: New shared records use UUIDv7-style IDs; current reader document IDs remain valid during migration.
- 2026-03-13: The current accessible-reader UI and web-link pass is being handled in parallel, so this ExecPlan proceeds backend-first until that branch is ready to reconcile.
- 2026-03-13: Public webpage snapshot import is allowed as a bounded Stage 1A detour only if it stays article-first, snapshot-based, and local-first after fetch rather than expanding into live URL sync.

## Recent Execution Notes
- 2026-03-13: Added the Stage 0/1 planning set:
  - `docs/research_notes/2026-03-13_stage0_research_brief.md`
  - decision, risk, assumption, backlog, and repo-fit logs
  - future integration logs for accessibility/converter and tablet paths
- 2026-03-13: Completed the minimum Stage 1B backend shared-core extraction:
  - switched the primary database target to `workspace.db`
  - added namespaced workspace tables for source documents, variants, reading sessions, app settings, change events, and future Recall groundwork
  - kept current reader API responses stable through the repository adapter
  - added automatic migration from legacy `reader.db`
  - added a generic `source_locator` field in storage so future web-link import fits without another schema redesign
- 2026-03-13: Backend validation is green:
  - backend `.venv` `python -m pytest`
  - backend `.venv` `python -c "from app.main import app; print(app.title)"`
- 2026-03-13: Frontend reconciliation is intentionally paused because the reader UI and web-link import are being changed in parallel elsewhere.
- 2026-03-13: Implemented bounded public webpage snapshot import on the reader branch:
  - added backend `POST /api/documents/import-url`
  - fetches public article-style HTML once with strict timeouts and content-type guards
  - stores a local `.html` snapshot, extracts readable content locally, and reuses the normal reader pipeline
  - keeps `source_type='web'` with a stored source locator and relies on the existing delete path to clean up snapshots
  - adds a compact `Web page` disclosure inside `Add document` without reopening broader UI scope
- 2026-03-13: Validation is green for the detour:
  - backend `.venv` `pytest -q`
  - frontend `npm test -- --run`
  - frontend `npm run lint`
  - frontend `npm run build`
  - live Chromium webpage-import validation in the existing Playwright harness
  - live Edge webpage-import validation in the existing Playwright harness
- 2026-03-13: Stage 1A closeout was verified after the interrupted validation rerun resumed successfully:
  - frontend `npm test -- --run`
  - frontend `npm run lint`
  - frontend `npm run build`
  - backend `.venv` `python -m pytest`
  - backend `.venv` `python -c "from app.main import app; print(app.title)"`

## Validation
- Backend in WSL:
  - `.venv/bin/python -m pytest`
  - `.venv/bin/python -c "from app.main import app; print(app.title)"`
- Migration:
  - a legacy reader database migrates into the workspace schema without breaking reader document listing, view loading, progress restore, or settings
- Frontend in WSL after the parallel reader/UI work lands:
  - `npm test`
  - `npm run lint`
  - `npm run build`

## Replan Triggers
- User-owned dirty changes directly conflict with the storage migration.
- The parallel accessible-reader UI/web-link pass changes storage or API assumptions before reconciliation happens.
- The workspace schema cannot preserve current reader behavior without a larger compatibility layer.
- Validation exposes a real product regression outside the current slice.
