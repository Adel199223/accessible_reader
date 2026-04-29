# Stage 973 - Post-Stage-972 Reader Highlights And Resume Audit

## Status

Pre-staged audit plan for after Stage 972 implementation.

## Intent

Audit that Reader resume points, collection highlight review, and source reading context preserve the existing local-first Recall baselines.

## Scope

- Confirm collection overviews expose reading summary, recent resume sources, and highlight review items for parent and leaf collections.
- Confirm Continue reading opens Reader at the stored saved position and highlight rows reopen anchored Reader or Notebook handoffs.
- Confirm Source overview shows last-read and highlight/source-note context without changing Source memory/review/export behavior.
- Confirm Reader shows the new jump-to-last-read action only when useful and keeps generated `Original`, `Reflowed`, `Simplified`, and `Summary` outputs frozen.
- Preserve Stage 970 collection workspace actions, Stage 968 tree behavior, Stage 966/964 import collections, Stage 958-963 backup/export/restore, Reader-led quiz launch, Study sessions/habits/attempts, Home review signals, Notebook, Graph, Add Content, and cleanup dry-run `matchedCount: 0`.

## Evidence Metrics

- `collectionReadingSummaryVisible`
- `collectionContinueReadingOpensSavedPosition`
- `collectionHighlightInboxOpensReader`
- `sourceOverviewResumeContextVisible`
- `sourceOverviewHighlightReviewVisible`
- `readerJumpToLastReadVisible`
- `readerGeneratedOutputsFrozen`
- retained cleanup dry-run `matchedCount: 0`

## Validation Plan

- Run after Stage 972 backend/frontend tests pass.
- Capture live browser evidence for Home collection reading context, Reader resume/highlight handoffs, Source overview highlight review, and broad regression surfaces.
- Run backend/frontend broad checks, cleanup dry-run, and `git diff --check`.
