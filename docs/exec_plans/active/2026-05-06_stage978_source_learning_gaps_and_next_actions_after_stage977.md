# Stage 978 - Source Learning Gaps And Next Actions

## Status

Completed on May 6, 2026, after completed Stage 976/977 highlight review state and Study coverage.

## Intent

Turn Stage 976 review state into source-level learning gap signals. Home collection reading queues and Source overview should show which sources still have highlights/source notes needing review, which highlights are already covered by Study, and what local action to take next.

## Scope

- Derive per-source highlight review counts for `total`, `needs_review`, `covered`, `reviewed`, and `dismissed` from existing `recall_notes` and note-grounded non-deleted `review_cards`.
- Add those counts to Library reading queue rows without a schema migration.
- Surface compact next-action chips in Home/custom collection reading queue rows: continue reading, review highlights, covered by Study, and due/new Study prompts.
- Make `Review highlights` open the existing Source overview highlight review panel; make Study prompt signals reuse source-scoped Study handoffs.
- Add Source overview learning-gap summary that mirrors the source-scoped highlight review inbox counts.
- Preserve existing filterable highlight inboxes, Notebook promotion seam, Reader anchoring, Study handoffs, collection membership, and cleanup hygiene.

## Out Of Scope

- No generated Reader output changes.
- No FSRS scheduling changes; Study ratings remain the only scheduling mutation path.
- No cloud sync, general chat/API/MCP workflows, notifications, local TTS, shared challenges, AI note generation, or extension capture.
- No new mixed global memory-object collection or broad Home dashboard redesign.
- No destructive note cleanup; dismissed notes remain recoverable.

## Validation Plan

- Backend tests for reading queue rows carrying derived highlight review counts, including Study-covered derivation and collection scoping.
- Frontend tests for Home reading queue learning-gap chips, Review highlights source handoff, Study prompt source handoff, and Source overview summary consistency after dismiss/restore.
- Stage 978 Playwright evidence for Home collection/source rows, Source overview learning-gap summary, promotion/coverage continuity, Stage 976 highlight controls, and cleanup dry-run `matchedCount: 0`.
- Stage 979 audit gate re-running Stage 978 focused evidence plus Stage 976 and Stage 975 regressions, backend tests, frontend tests/typecheck/build, cleanup dry-run, and `git diff --check`.

## Result

- Backend reading queue rows now include derived `highlight_review_counts` for each source.
- Home/custom collection Reading queue rows expose `Needs review`, `Covered by Study`, `Review highlights`, and `Study prompts` next actions while keeping rows source-owned.
- Source overview now includes a compact `Source learning gaps` summary with review, coverage, Study prompt, and dismissed signals plus handoffs into the existing highlight inbox and source-scoped Study.
- Study coverage remains derived from non-deleted note-grounded Study cards; no generated Reader output or FSRS scheduling behavior changed.

## Assumptions

- `covered` remains derived from existing non-deleted Study cards whose `source_spans_json` references a note id.
- `covered` is the stronger display signal when a note is both reviewed and Study-covered.
- Reading queue rows should stay source-owned and compact; the detail work remains in Source overview and the existing highlight review inbox.
