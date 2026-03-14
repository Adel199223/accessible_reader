# ExecPlan: Stage 23 Post-Stage-22 Recall UX Refresh

## Summary
- Stage 22 completed the unified workspace-search correction.
- The audit confirmed search continuity fixed the prior discovery split, but the next major workflow break is still note work that remains too detached from active reading.
- The next step is a bounded Reader-plus-notebook adjacency correction so saved-note editing, review, and promotion can stay beside the source instead of forcing routine jumps into the separate `Notes` section.

## Goals
- Reassess the live Recall workspace after the shared-search continuity pass.
- Compare the current add, search, Library, Notes, Graph, Study, and Reader loops against the product brief and the original Recall workflow benchmark.
- Identify the highest-friction remaining workflow break and turn it into the next bounded implementation milestone.

## Implementation
- Inspect the current shell/state architecture, Stage 13-22 artifacts, and live browser flows.
- Audit whether search continuity solved the largest loop break or exposed a new primary bottleneck nearby.
- Review the latest live artifacts and current Reader/Notes split against the Recall benchmark.
- Sync roadmap continuity docs so only one post-Stage-22 milestone is active.

## Constraints
- Preserve local-first parsing, storage, search, settings, progress, deterministic reflow, speech behavior, note anchors, and browser-companion handoff.
- Keep `/recall` and `/reader?document=...&sentenceStart=...&sentenceEnd=...` stable.
- Do not reopen deferred scope by default:
  - local TTS
  - OCR for scanned PDFs
  - cloud sync/collaboration
  - chat/Q&A
  - new AI surfaces beyond existing `Simplify` and `Summary`

## Test Plan
- Audit and continuity pass only unless the review uncovers a concrete product fix worth landing immediately.
- If the stage remains docs/audit-only, prefer targeted repo searches and artifact review over full validation reruns.
- If the audit lands a code correction, rerun only the validations touched by that change.

## Notes
- This stage should choose the next milestone from the live product state, not from pre-Stage-22 search assumptions.
- Audit outcome:
  - the shell and Library search loop now hold together well enough that discovery is no longer the main bottleneck
  - the highest-friction remaining break is that Reader note capture is adjacent, but saved-note editing and promotion still live mostly in the standalone `Notes` section
  - the next bounded milestone should therefore target Recall-style notebook adjacency inside Reader rather than another generic shell polish pass
