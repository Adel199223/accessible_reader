# Stage 974 - Library Reading Queue And Highlight-To-Study Actions

## Status

Implemented and audited baseline as of April 29, 2026. Stage 975 is complete.

## Intent

Turn the Stage 972 resume and highlight surfaces into an actionable local reading queue across Home, custom collections, Source overview, and Reader. This keeps Recall local-first while following the benchmark direction around read-it-later ownership, tag-based navigation, reading-position tracking, highlights, and review from saved content.

## Scope

- Add a derived read-only Library reading queue API over existing source documents, reading sessions, notes, Study cards, and Library settings.
- Add a source reading completion endpoint that writes only existing reading progress/session state.
- Add compact Home reading queue controls for all sources, built-in groups, and selected custom collections, including state filters and queue-aware Continue reading.
- Add Mark complete in Home queue and Source overview.
- Make highlight inbox rows actionable with Open in Reader, Open in Notebook, and Create Study card handoffs that reuse the existing Notebook promotion seam.
- Add Reader Next in queue when Reader is launched from a queue scope.
- Preserve Reader generated output freeze, Study FSRS semantics, Source memory/review/export, collection workspaces, imports, backup/restore, Notebook, Graph, and cleanup hygiene.

## Validation Plan

- Backend tests for queue summaries, built-in and custom scopes, unread/in-progress/completed filters, missing collections, descendant membership, note/highlight counts, Study due/new counts, and mark-complete no-unrelated-mutation behavior.
- Frontend tests for Home queue rendering/filtering, Reader resume handoff, Mark complete refresh, Source overview completion action, highlight Open Reader/Notebook/Create Study card handoffs, and Reader Next in queue.
- Stage 974 Playwright evidence for Home reading queue, queue-aware Reader handoff, Source overview mark-complete, highlight-to-Study handoff, Reader Next in queue, and cleanup dry-run `matchedCount: 0`.
- Stage 975 broad audit over Stage 972 resume/highlight inbox, Stage 970 collection workspaces, Stage 968 collection tree, Stage 966/964 imports, Stage 958-963 export/backup/restore, Reader-led quiz, Study sessions/habits/attempts, Home review signals, Source overview memory/review/export, Notebook, Graph, Add Content, and cleanup.

## Assumptions

- Reading state remains derived from existing `reading_sessions`; no migration is required.
- Highlight review actionability uses existing Reader, Notebook, and Study promotion paths, not a new durable reviewed/unreviewed note state.
- Built-in Home collections keep their current source-type definitions.
- FSRS scheduling remains controlled only by Study rating flows.
