# Stage 879 - Post-Stage-878 Reader Active Listen Seam And Playback Progress Audit

## Summary

- Audit the Stage 878 Reader active Listen seam.
- Confirm that active and paused browser-native speech now read as one compact Reader-owned playback seam while idle Reader and all generated outputs remain stable.

## Evidence Targets

- `readerActiveListenSeamVisible`
- `readerActiveTransportToolbarBloomVisible`
- `readerActiveListenStatusLabel`
- `readerActiveSentenceProgressInline`
- `readerActiveCurrentSentenceExcerptVisible`
- `readerActivePrimaryPlaybackLabel`
- `readerShortDocumentCompletionStripHiddenWhileListening`
- `readerIdleCompletionStripReturnsAfterStop`
- `readerSupportOpenActiveListenSeamVisible`
- `readerGeneratedOutputsFrozen`

## Regression Targets

- Stage 876/877 short-document completion strip returns at rest.
- Stage 866/867 support-open short `Source` and `Notebook` continuity remains content-fit.
- Long/preview-backed Reader layout stays stable.
- Generated `Simplified` / `Summary` behavior remains frozen.
- Home, Graph, embedded Notebook, Study Review, and Study Questions remain regression surfaces.

## Validation

- Targeted Reader/App Vitest.
- `npm run build`.
- `cd backend && uv run pytest tests/test_api.py -k graph -q`.
- `node --check` on the shared Reader harness plus Stage 878/879 scripts.
- Live Stage 878/879 browser runs.
- `git diff --check`.

## Closeout Evidence

- Stage 879 live audit passed against `http://127.0.0.1:8000` with `runtimeBrowser: chromium`.
- The audit recorded `readerActiveListenSeamVisible: true`, `readerActiveTransportToolbarBloomVisible: false`, `readerActiveListenStatusLabel: Listening`, `readerPausedListenStatusLabel: Paused`, `readerActiveSentenceProgressInline: true`, `readerActiveCurrentSentenceExcerptVisible: true`, `readerActivePrimaryPlaybackLabel: Pause`, `readerPausedPrimaryPlaybackLabel: Resume`, `readerShortDocumentCompletionStripHiddenWhileListening: true`, `readerIdleCompletionStripReturnsAfterStop: true`, `readerSupportOpenActiveListenSeamVisible: true`, `readerSupportOpenShortDocumentContentFitStable: true`, and `readerGeneratedOutputsFrozen: true`.
