# ExecPlan: Stage 29 Post-Stage-28 Recall UX Refresh

## Summary
- Stage 28 completed the shared source-pane and contextual browse-drawer correction.
- The next step should be a fresh UX audit from the live post-Stage-28 product state rather than another guessed feature pass.
- The goal is to identify the highest-friction remaining workflow break after the source workspace became the primary working canvas.

## Goals
- Reassess the live Recall workspace after the Stage 28 source-pane consolidation.
- Compare the current Library, Reader, Notes, Graph, Study, current-context dock, recent-work flow, and search loop against the product brief and current Recall workflow benchmark.
- Identify the next bounded milestone based on UX leverage first, not on preserving the current layout or on widening deferred scope.

## Implementation
- Inspect the current shell/state architecture, Stage 20-28 artifacts, and the live browser flow.
- Review whether shared source panes plus contextual drawers resolved the main source-focus break or exposed a more specific bottleneck nearby.
- Compare the current source workspace, collection drawers, and section switching model against the original Recall benchmark and the product brief.
- Sync roadmap continuity docs so only one post-Stage-28 milestone is active.

## Constraints
- Preserve local-first parsing, storage, search, settings, progress, deterministic reflow, speech behavior, note anchors, browser-companion handoff, and existing Reader behavior.
- Keep `/recall` and `/reader?document=...&sentenceStart=...&sentenceEnd=...` stable.
- Do not reopen deferred scope by default:
  - local TTS
  - OCR for scanned PDFs
  - cloud sync/collaboration
  - chat/Q&A
  - new AI surfaces beyond existing `Simplify` and `Summary`

## Test Plan
- Audit and continuity pass only unless the review uncovers a concrete product fix worth landing immediately.
- If the stage remains docs/audit-only, prefer targeted repo searches, artifact review, and live-browser observations over full validation reruns.
- If the audit lands a code correction, rerun only the validations touched by that change.

## Notes
- This stage should choose the next milestone from the current live product state, not from pre-Stage-28 assumptions about source focus.
