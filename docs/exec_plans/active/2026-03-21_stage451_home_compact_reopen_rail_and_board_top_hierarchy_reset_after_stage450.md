# ExecPlan: Stage 451 Home Compact Reopen Rail And Board-Top Hierarchy Reset After Stage 450

## Summary
- The Stage 450 audit closed the current broad `Graph` slice and moved the clearest remaining Recall-parity gap back to `Home`.
- Wide desktop `Home` is materially closer to Recall than it used to be, but the top of the working board still over-prioritizes the reopen cluster:
  - a tall pinned `Open next` hero
  - a separate companion reopen list
  - then the active filtered board starts lower than it should
- Recall's current organization direction reads more like one lean working surface:
  - the left organizer owns navigation
  - the right side behaves like one active card board
  - the next item is visible, but it does not dominate the board as a featured hero
- This stage resets the top of `Home` around that compact board-top hierarchy instead of reopening another organizer-row or shell-copy trim.

## Source Direction
- Recall's [Tagging deep dive](https://docs.getrecall.ai/deep-dives/tagging) continues to frame the left tags panel as the main navigation surface and the right side as the filtered card list.
- The same deep dive also reinforces that tags and cards can sit in one more continuous organization flow instead of looking like separate stacked destinations.
- The [Feb 6, 2026 release notes](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-6-2026-ocr-improved-organization-track-your-reading-pos) reinforce improved organization and a stronger, more flexible tag tree, which fits a calmer organizer-plus-board workflow instead of a hero-led landing stack.
- The [Recall changelog](https://feedback.getrecall.ai/changelog) continues to treat organization as an active working surface, not a decorated landing page.

## Scope
- Rework wide-desktop `Home` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css` as one board-top hierarchy reset.
- Compress the pinned reopen cluster from a tall featured shelf into a compact reopen rail:
  - keep one clear next source
  - keep nearby reopen choices
  - stop letting the reopen block dominate the whole top of the board
- Start the active selected-group board earlier:
  - reduce the gap between the board header and the first saved-source rows
  - reduce the vertical claim of the pinned reopen area
  - make the right side read more like one continuous filtered board
- Tighten the main board entries so more of the active group is visible above the fold without reopening a separate density-only pass.
- Keep the organizer rail visually stable overall:
  - search stays in the organizer
  - sorting stays in the organizer
  - organizer hide/show stays intact
  - active group selection still drives the right-side board
- Preserve all current Home behavior:
  - organizer selection
  - source reopen
  - `Recent` / `A-Z`
  - search filtering
  - organizer hidden fallback
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
- Keep the pass broad enough to matter: this is a board-top hierarchy reset, not another card-gap, chip, or sentence-only tweak.

## Public Interfaces / Types
- No backend, schema, or API contract changes.
- No route or continuity schema changes are expected.

## Validation
- targeted Vitest for `src/components/RecallWorkspace.stage37.test.tsx` and `src/App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 451/452 harness pair
- real Windows Edge Stage 451 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop `Home` reads more like one active working board with a compact reopen rail, not a featured reopen hero followed by the actual board.
- The selected-group list begins materially earlier and feels more continuous with the board header.
- The organizer still clearly owns navigation while the right side reads more like filtered work than a staged landing stack.
- `Graph` and original-only `Reader` remain visually stable behind the Home pass.
