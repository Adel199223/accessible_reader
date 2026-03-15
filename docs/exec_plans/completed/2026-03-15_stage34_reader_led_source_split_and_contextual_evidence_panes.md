# ExecPlan: Stage 34 Reader-Led Source Split and Contextual Evidence Panes

## Summary
- Stage 33 confirmed that Stage 32 fixed the full-surface swap problem, but the split workspace still centered too much around `Source overview`.
- This slice made the live source in `Reader`, not a summary card, the steady primary pane during focused note, graph, and study work.
- The benchmark stayed Recall's live-content-first split direction: expanded reading space, split-screen note work, and flexible adjacent tools around active content.

## Goals
- Make the live source surface in `Reader` the default primary pane for source-local note, graph, and study work.
- Keep `Overview` available as the source home and summary surface without making it the default anchor during active source work.
- Improve evidence and anchor handoffs so note highlights, graph mentions, and study excerpts can be reviewed beside live source content with fewer reopen loops.
- Preserve browse-first section entry, source-centered continuity, local-first behavior, routes, anchors, browser-companion handoff, and current reading/speech behavior.

## Implementation
- Added a bounded embedded Reader pane for focused `Notes`, `Graph`, and `Study`, while `Overview` remains the source-home surface for source-local browsing.
- Extended Recall continuity so source-focused work keeps a `readerAnchor` and can preserve or reset the embedded highlight range as the active source changes.
- Changed note anchors, graph evidence/mentions, and study source spans to retarget the embedded Reader in place; explicit `Open in Reader` deep links still navigate to `/reader`.
- Passed current `ReaderSettings` into Recall so the embedded Reader keeps the same typography and accessibility settings as full Reader.
- Preserved explicit full-browse section entry:
  - manual `Library`, `Notes`, `Graph`, and `Study` clicks still reopen browse-first surfaces
  - source-focused split work does not trap the user away from those broader views

## Constraints
- No backend API, storage, export, or browser-companion protocol changes by default.
- Keep `/recall` and `/reader?document=...&sentenceStart=...&sentenceEnd=...` stable.
- Do not widen this slice into local TTS, OCR, sync, chat/Q&A, or another search overhaul.

## Test Plan
- Targeted frontend coverage is green for reader-led continuity and focused evidence handoffs.
- Validation completed in this slice:
  - `frontend npm run lint`
  - `frontend npm run build`
  - `frontend vitest run src/components/RecallWorkspace.stage34.test.tsx`
  - repo-owned real Edge smoke via `scripts/playwright/stage34_reader_led_source_split_edge.mjs`
- Live smoke coverage includes:
  - note anchor work beside live Reader content
  - graph evidence beside live Reader content
  - study evidence beside live Reader content
  - return to browse-first `Notes`, `Graph`, and `Study`

## Notes
- This slice is a UX correction, not a feature expansion.
- The goal was not to remove `Overview`, but to stop making it the steady pane during work that is really about live source reading and evidence validation.
- The large `frontend/src/App.test.tsx` runner-stability issue still exists as a whole-file problem, but Stage 34 no longer depends on that broad runner to close.
