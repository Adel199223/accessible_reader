# Stage 972 - Reader Highlights, Resume Points, And Collection Review Inbox

## Status

Active as of April 29, 2026.

## Intent

Connect hierarchical Library collections back into the reading loop by making saved reading positions and highlighted/source notes visible from collection and source workspaces. This keeps the Stage 970 collection workspace model local-first while following Recall's direction around saved-content reading, hierarchical tags, reading-position tracking, and reviewable highlights.

## Scope

- Extend the read-only collection overview API with derived reading summary, recent resume sources, and highlight review items from existing `reading_sessions`, source views, and `recall_notes`.
- Add Reader continuity intent fields so Home collection, Source overview, and note/highlight rows can reopen Reader at the saved position or highlighted passage without changing generated Reader outputs.
- Add Home selected-collection reading context: compact reading state, Continue reading, and Review highlights inbox using direct/descendant membership.
- Add Source overview reading context: last-read resume action plus compact highlighted/source-note review list.
- Add a quiet Reader `Jump to last read` affordance when stored progress exists, preserving the current Source/Notebook/Study seams and existing note-anchor reopen behavior.
- Preserve Stage 970 collection actions, Source organize-in-place, Study/Graph collection handoffs, Reader-led quiz launch, FSRS scheduling, export/restore, cleanup hygiene, and generated Reader output freeze.

## Validation Plan

- Backend tests for collection reading summaries, resume-source ordering and progress percent derivation, direct/descendant membership, empty/missing collections, and highlight inbox filtering.
- Frontend tests for collection reading summary/resume/highlight inbox, Reader resume/highlight handoff, Source overview reading context, and generated-output stability.
- Stage 972 Playwright evidence for collection reading inbox, Reader resume, Source overview highlight review, Reader jump-to-last-read, and cleanup dry-run `matchedCount: 0`.
- Stage 973 broad audit over Stage 970 collection workspaces, Stage 968 collection tree, Stage 966/964 bulk imports, Stage 958-963 export/backup/restore, Reader-led quiz, Study sessions/habits/attempts, Source overview memory/review/export, Home review signals, Notebook, Graph, Add Content, and cleanup.

## Assumptions

- No schema migration is required; all new output is derived from existing local tables.
- Existing sentence-anchored Notebook notes are the reviewable highlight objects; source-attached notes remain source-owned memory and can appear in the review list with source-level handoff.
- This stage does not add chat/API, cloud sync, notifications, shared challenges, extension side-panel work, AI note generation, destructive import, or generated Reader-output changes.
