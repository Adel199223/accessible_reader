# ExecPlan: Stage 443 Home Single-Board Pinned-Cluster Reset After Stage 442

## Summary
- The Stage 442 audit closed the current broad `Graph` slice and moved the clearest remaining Recall-parity gap back to `Home`.
- Official Recall organization guidance still points toward `Home` behaving like one organizer-driven library board rather than a workflow stack with a separate reopen shelf above a separate active board.
- Our current `Home` is materially closer after the unified-workbench reset, but it still reads as two destinations inside the main board area:
  - a separate pinned reopen shelf
  - a separate selected-group board
- This stage resets that split into one canonical library board instead of another tiny copy or chrome trim.

## Source Direction
- Recall's [Tagging deep dive](https://docs.getrecall.ai/deep-dives/tagging) continues to position grouped organization as the main browsing model for saved knowledge.
- Recall's [changelog](https://feedback.getrecall.ai/changelog) keeps reinforcing organization as a first-class desktop workflow, not a secondary archive screen.
- The [Feb 6, 2026 release notes](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-6-2026-ocr-improved-organization-track-your-reading-pos) reinforce the direction:
  - improved organization
  - stronger continuity across reading and saved knowledge
  - a practical working library instead of a stacked landing workflow

## Scope
- Rework wide-desktop `Home` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css` as one board-fusion reset.
- Collapse the pinned reopen shelf into the main library board:
  - keep `Resume here` / `Next source`
  - keep the lead reopen card and nearby sources
  - keep the same actions and source handoffs
  - stop rendering the reopen lane as a sibling destination beside the board
- Keep filtered matches inside the same canonical board shell rather than treating search results as a separate workflow stack.
- Preserve all current Home behavior:
  - organizer selection
  - `Recent` / `A-Z`
  - preview collapse
  - organizer hidden fallback
  - source reopen
  - source-workspace handoff
- Keep `Graph` and original-only `Reader` as regression checkpoints only.

## Guardrails
- Do not reopen generated-content `Reader` work.
- Keep `Reader` original-only and cosmetic-only in this track:
  - no `Reflowed`
  - no `Simplified`
  - no `Summary`
  - no generated-view UX
  - no transform logic
  - no generated placeholders
  - no generated-view controls
  - no mode-routing changes
- Do not widen into `Graph`, `Notes`, `Study`, or backend work in this stage unless a tiny shared-shell adjustment is required for the Home reset to read correctly.
- Keep the pass broad enough to matter: this is a board-composition reset, not another rail-copy polish.

## Public Interfaces / Types
- No backend, schema, or API contract changes.
- No route or continuity schema changes are expected.

## Validation
- targeted Vitest for `src/components/RecallWorkspace.stage37.test.tsx` and `src/App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 443/444 harness pair
- real Windows Edge Stage 443 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop `Home` reads as one organizer-led library board instead of a pinned-shelf-plus-board stack.
- The pinned reopen cluster feels attached to the active board instead of a sibling lane.
- Filtered matches stay inside the same canonical board.
- `Graph` and original-only `Reader` remain visually stable behind the Home pass.
