# Stage 878 - Reader Active Listen Seam And Playback Progress Ownership After Stage 877

## Summary

- Reopen `Reader` after the Stage 877 short-document completion checkpoint.
- Keep the existing browser-native speech system and idle `Read aloud` pill intact.
- Convert active and paused read-aloud from a technical transport-toolbar bloom into one compact Reader-owned Listen seam.

## Scope

- Update `ReaderWorkspace` so active or paused playback shows a compact inline seam with `Listening` / `Paused`, sentence progress, current-sentence excerpt, and playback controls.
- Hide the Stage 876 short-document completion strip while playback is active or paused, then restore it when playback returns to idle.
- Preserve support-open short-document continuity, long-document layout, source/notebook handoffs, sentence highlighting, auto-scroll, progress save, overflow theme/voice/rate controls, and generated-output invariants.

## Implementation Notes

- Keep the same speech handlers and accessible button labels for previous, pause, resume, next, and stop.
- Keep the idle `Start read aloud` button as the established labeled `Read aloud` pill.
- Do not add local TTS, voice cloning, Listen Mode backend, cloud sync, new routing, new storage, or generated-content changes.

## Validation

- Targeted Reader/App Vitest for idle, active, paused, stop/return, short-document strip visibility, support-open continuity, long documents, and generated modes.
- `node --check` on the shared Reader harness plus Stage 878/879 scripts.
- Live Stage 878/879 browser evidence with deterministic speech stubbing.
- Standard build, backend graph test, and `git diff --check`.

## Closeout Evidence

- Implemented in `ReaderWorkspace` as one compact active/paused Listen seam in the fused Reader header, preserving idle `Read aloud`.
- Live Stage 878 validation recorded `readerActiveListenSeamVisible: true`, `readerActiveTransportToolbarBloomVisible: false`, `readerActiveListenStatusLabel: Listening`, `readerPausedListenStatusLabel: Paused`, `readerShortDocumentCompletionStripHiddenWhileListening: true`, `readerIdleCompletionStripReturnsAfterStop: true`, `readerSupportOpenActiveListenSeamVisible: true`, and `readerGeneratedOutputsFrozen: true`.
