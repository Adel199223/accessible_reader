# Stage 976 - Highlight Review State And Collection Study Coverage

## Status

Completed May 6, 2026, after completed Stage 974/975 Library reading queue and highlight-to-Study actions.

## Intent

Turn the existing highlight/source-note inbox into a managed local review loop. Highlights and source notes should be visible as unreviewed work, recoverable after dismissal, and marked as Study-covered when an existing non-deleted Study card is grounded in that note.

## Scope

- Add durable local review state to `recall_notes`: `unreviewed`, `reviewed`, or `dismissed`, with timestamps for reviewed/dismissed transitions.
- Derive Study coverage from existing non-deleted `review_cards.source_spans_json[].note_id`; do not store a separate promoted flag.
- Add `PATCH /api/recall/notes/{note_id}/review-state`.
- Add `GET /api/recall/library/highlight-review-inbox` with built-in, collection, and source scoping plus `needs_review`, `covered`, `reviewed`, `dismissed`, and `all` filters.
- Replace raw Home collection and Source overview highlight lists with filterable review inbox controls and actions.
- Keep existing Reader, Notebook, and Study handoffs: sentence notes open anchored Reader; source notes open Notebook; Study creation uses the existing Notebook promotion seam.

## Out Of Scope

- No generated Reader output changes, transform routing changes, AI note generation, local TTS, cloud sync, notifications, shared challenges, extension capture, or destructive import/restore behavior.
- No FSRS scheduling changes; Study ratings remain the only scheduling mutation path.
- No global mixed memory-object board or broad Home redesign.

## Validation Plan

- Backend tests for review-state patching, invalid state and 404 handling, inbox scoping/filtering, Study coverage derivation, note-promotion coverage, and workspace export/restore preservation.
- Frontend tests for Home/collection inbox filters, mark reviewed/dismiss/restore, Study coverage and promotion handoff, Source overview controls, and existing queue regressions.
- Stage 976 Playwright evidence for Home collection inbox, Source overview inbox, Notebook promotion, Reader anchoring, and cleanup dry-run `matchedCount: 0`.
- Stage 977 broad audit preserving Stage 975 reading queue, Stage 972 highlight/resume inbox, Stage 970 collection workspaces, Study sessions/habits/attempts, Reader generated-output freeze, Graph, Add Content, export/backup/restore, and cleanup hygiene.

## Validation Results

- Backend `tests/test_api.py` passed with 94 tests, including review-state patching, inbox scoping/filtering, Study coverage derivation, promotion coverage, invalid-state/404 handling, and workspace export/restore preservation.
- Frontend `App.test.tsx`, `api.test.ts`, `RecallWorkspace.stage34.test.tsx`, `RecallWorkspace.stage37.test.tsx`, full Vitest, and production build passed after adding the new inbox APIs and UI controls.
- Contract audits passed for OpenAPI snapshot, generated OpenAPI reference, wrapper paths, and type exports.
- Stage 976 Playwright evidence passed with Home collection inbox filters, reviewed/dismissed/restore actions, covered Study handoff, Source overview controls, Notebook promotion seam, and cleanup dry-run `matchedCount: 0`.
- Stage 975 regression audit passed after the new summary label preserved the existing `Source highlight review` list lookup.

## Assumptions

- Existing notes default to `unreviewed`.
- Dismissed notes remain user data and are recoverable through the `Dismissed` filter.
- A note is Study-covered when at least one non-deleted Study card references its id in `source_spans_json`.
