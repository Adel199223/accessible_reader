# ExecPlan: Stage 9 Source-Linked Highlights and Notes

## Summary
- Add first-class highlights and notes to Recall without reopening deferred v1 scope.
- Start capture in Reader and management/search in Recall so note-taking stays close to reading while remaining discoverable in the Recall shell.
- Keep notes local-first, anchored only to deterministic `reflowed/default` content, and isolated from graph/study automation in this slice.

## Public Interfaces
- Add shared note contracts:
  - `RecallNoteAnchor`
  - `RecallNoteRecord`
  - `RecallNoteCreateRequest`
  - `RecallNoteUpdateRequest`
  - `RecallNoteSearchHit`
- Add Recall note routes:
  - `GET /api/recall/documents/{document_id}/notes`
  - `POST /api/recall/documents/{document_id}/notes`
  - `PATCH /api/recall/notes/{note_id}`
  - `DELETE /api/recall/notes/{note_id}`
  - `GET /api/recall/notes/search`
- Keep current Reader, Recall document, graph, study, export, browser-context, and workspace portability routes stable.

## Implementation Changes
- Shared storage and backend:
  - Add shared note storage plus note FTS and change events in the `workspace.db` repository layer.
  - Note anchors must include `source_document_id`, `variant_id`, `block_id`, `sentence_start`, `sentence_end`, and stable anchor/excerpt text.
  - Allow only one contiguous sentence range within a single block; reject cross-block, multi-variant, or non-`reflowed/default` note creation.
  - Add repository methods for note CRUD, document note listing, and note search.

- Reader capture:
  - Add sentence-range highlight capture in the Reader section using the existing sentence index model.
  - Support optional note body text when saving a highlight.
  - Keep capture bounded to `reflowed/default`; `original`, `simplified`, and `summary` remain read-only with respect to notes.
  - Add jump-back support so selecting a note from Recall opens Reader at the anchored sentence range.

- Recall experience:
  - Add a `Notes` section to Recall.
  - Show document-scoped note lists, note search results, anchor excerpts, edit/delete actions, and `Open in Reader`.
  - Keep notes isolated from graph extraction, study-card generation, and retrieval ranking in Stage 9.

- Documentation/continuity:
  - Keep Stage 10 and Stage 11 as follow-on roadmap stages:
    - Stage 10: browser note capture plus note-aware retrieval
    - Stage 11: portable annotation apply plus manual promotion into graph/study workflows

## Test Plan
- Backend:
  - note create/list/update/delete flows
  - note search and note FTS coverage
  - note change events
  - rejection of note creation outside `reflowed/default` or across multiple blocks
- Frontend:
  - Reader sentence-range note capture and save
  - Recall notes section renders document notes and search hits
  - `Open in Reader` restores the anchored sentence range
  - existing Reader, Recall, graph, study, export, and extension tests continue to pass
- Validation:
  - backend `.venv/bin/python -m pytest`
  - backend `.venv/bin/python -c "from app.main import app; print(app.title)"`
  - frontend `npm test -- --run`
  - frontend `npm run lint`
  - frontend `npm run build`
  - extension `npm test -- --run`
  - extension `npm run build`
  - one manual Edge smoke pass for Reader note capture and Recall-to-Reader jump-back

## Assumptions
- Stage 9 starts from branch `codex/stage8-closeout-doc-sync`.
- Notes are `highlight + optional note body` only in this slice.
- Tags, notebooks, browser note capture, note-aware retrieval, portable apply, and note promotion are deferred to later stages.

## Closeout
- Completed on 2026-03-13.
- Delivered:
  - shared note storage, note FTS, note change events, and note CRUD/search routes in the backend
  - Reader sentence-range note capture, persisted note highlights, and route-anchor jump-back in deterministic `reflowed/default`
  - Recall `Notes` section with document-scoped notes, note search, edit/delete flows, and `Open in Reader`
  - startup guards so stale saved sessions do not fetch note/view data for missing documents before the active document resolves
- Validation completed:
  - backend `.venv/bin/python -m pytest`
  - backend `.venv/bin/python -c "from app.main import app; print(app.title)"`
  - frontend `npm test -- --run`
  - frontend `npm run lint`
  - frontend `npm run build`
  - extension `npm test -- --run`
  - extension `npm run build`
  - live Playwright smoke on a clean temp workspace covering Reader note capture, Recall note visibility/search, and Recall-to-Reader jump-back
