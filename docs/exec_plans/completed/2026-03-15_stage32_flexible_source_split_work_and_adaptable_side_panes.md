# ExecPlan: Stage 32 Flexible Source Split Work and Adaptable Side Panes

## Summary
- Stage 31 confirmed that the active source is visually primary again, but source-local work still required too many hard switches between full-surface `Reader`, `Notes`, `Graph`, and `Study`.
- This slice turned source-focused `Notes`, `Graph`, and `Study` into nearby split-work tools so one source stays visible while the user edits notes, validates graph evidence, or reviews study context.
- The benchmark remained Recall's split-work direction: side-by-side reading and notebook work, expanded reading space, and flexible nearby tools.

## Goals
- Keep one active source visible while making nearby note, graph, and study work available in an adaptable side pane.
- Reduce context-breaking tab switches during source-focused work.
- Preserve the source-centered workspace identity introduced in Stages 26-30.
- Preserve local-first behavior, routes, anchors, browser-companion handoff, and current reading/speech behavior.

## Implementation
- Reworked the source-focused workspace so it now keeps:
  - one primary content pane for the shared source surface
  - one secondary pane for source-local `Notes`, `Graph`, or `Study` work
- Kept `Overview` and `Reader` as the main-surface modes.
- Added a secondary tool flow for the right pane so source-local note detail/workbench, graph evidence/detail, and study evidence/card detail can stay adjacent to the active source instead of replacing the full surface.
- Preserved explicit full-browse section entry:
  - manual `Library`, `Notes`, `Graph`, and `Study` section clicks still reopen browse-first surfaces
  - source-focused side-pane work does not trap the user away from broader browse views
- Kept handoffs stable:
  - `Open in Reader`
  - note edit/promotion
  - graph evidence reopen
  - study evidence reopen
  - global search result handoffs

## Constraints
- No backend API, storage, or export changes were required.
- `/recall` and `/reader?document=...&sentenceStart=...&sentenceEnd=...` remain stable.
- This slice did not widen into chat, OCR, sync, local TTS, or another search rewrite.

## Test Plan
- Frontend coverage:
  - source-focused work keeps the main source surface visible while switching side-pane tools
  - notes, graph, and study side panes preserve the active source and do not force a main-surface route reset
  - manual section clicks still reopen browse-first surfaces
  - anchored Reader reopen, note promotion, graph evidence, and study handoffs remain stable
- Validation completed in this session:
  - `frontend npm run lint`
  - `frontend npm run build`
  - repo-owned real Edge smoke via `scripts/playwright/stage32_flexible_source_split_edge.mjs`
- Live smoke coverage included:
  - source-focused note work beside the active source
  - source-focused graph and study side switching
  - return to browse-first `Notes` and `Study`
  - cleanup verification with `remainingDocuments: 0`

## Notes
- The real Edge smoke is now green and recorded in:
  - `output/playwright/stage32-source-split-notes.png`
  - `output/playwright/stage32-source-split-graph.png`
  - `output/playwright/stage32-source-split-study.png`
  - `output/playwright/stage32-source-split-notes-browse.png`
  - `output/playwright/stage32-source-split-study-browse.png`
  - `output/playwright/stage32-source-split-validation.json`
- The broad `frontend/src/App.test.tsx` suite still has a runner-stability issue when executed as one large file. That remains a supporting stabilization item, not a reason to keep Stage 32 open.
- Stage 32 solved the full-surface swap problem, but the next audit should reassess whether the split workspace is sufficiently source-led or still too summary-led.
