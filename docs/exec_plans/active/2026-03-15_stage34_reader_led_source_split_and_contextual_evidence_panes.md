# ExecPlan: Stage 34 Reader-Led Source Split and Contextual Evidence Panes

## Summary
- Stage 33 confirmed that Stage 32 fixed the full-surface swap problem, but the split workspace still centers too much around `Source overview`.
- The next slice should keep the live source itself, not a summary card, as the steady primary pane during note, graph, and study work.
- The benchmark is Recall's live-content-first split direction: expanded reading space, split-screen note work, and flexible adjacent tools around active content.

## Goals
- Make the live source surface in `Reader` the default primary pane for source-local note, graph, and study work.
- Keep `Overview` available as the source home and summary surface without making it the default anchor during active source work.
- Improve evidence and anchor handoffs so note highlights, graph mentions, and study excerpts can be reviewed beside live source content with fewer reopen loops.
- Preserve browse-first section entry, source-centered continuity, local-first behavior, routes, anchors, browser-companion handoff, and current reading/speech behavior.

## Implementation
- Rework the source-focused primary-pane model so it can hold either:
  - `Overview` as the source home tab
  - `Reader` as the live source tab and default active pane for source-local work
- Change source-local handoffs so focused `Notes`, `Graph`, and `Study` prefer a reader-led split layout when the user enters from:
  - note anchors
  - graph evidence or mentions
  - study evidence or active cards
  - `Open in Reader`
  - `/reader` deep links
- Keep the right-side secondary pane adaptable for:
  - note workbench/detail
  - graph node/evidence detail
  - study card/evidence detail
- Tighten the primary-secondary relationship:
  - keep overview metadata lighter when `Reader` is active
  - avoid duplicating summary cards that push live content away
  - prefer nearby anchored evidence actions over reopen-only handoffs where possible
- Preserve explicit full-browse section entry:
  - manual `Library`, `Notes`, `Graph`, and `Study` clicks should still reopen browse-first surfaces
  - source-focused split work should not trap the user away from those broader views

## Constraints
- No backend API, storage, export, or browser-companion protocol changes by default.
- Keep `/recall` and `/reader?document=...&sentenceStart=...&sentenceEnd=...` stable.
- Do not widen this slice into local TTS, OCR, sync, chat/Q&A, or another search overhaul.

## Test Plan
- Frontend coverage:
  - source-local note, graph, and study handoffs keep `Reader` as the primary pane when live source context matters
  - `Overview` remains available as a source home without blocking reader-led split work
  - browse-first section clicks still reopen full browse surfaces
  - `/reader` deep links, anchored note reopen, graph evidence reopen, and study evidence reopen stay stable
- Validation:
  - targeted frontend tests around reader-led split continuity
  - `frontend npm run lint`
  - `frontend npm run build`
  - repo-owned real Edge smoke covering:
    - note anchor work beside live Reader content
    - graph evidence beside live Reader content
    - study evidence beside live Reader content
    - return to browse-first `Notes`, `Graph`, and `Study`
- If the large `frontend/src/App.test.tsx` file still stalls, keep the workaround bounded to targeted coverage and honest reporting rather than blocking the product slice on unrelated runner cleanup.

## Notes
- This slice is a UX correction, not a feature expansion.
- The goal is not to remove `Overview`, but to stop making it the steady pane during work that is really about live source reading and evidence validation.
