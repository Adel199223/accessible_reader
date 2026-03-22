# ExecPlan: Stage 447 Home Organizer-Owned Navigation Reset After Stage 446

## Summary
- The Stage 446 audit closed the current broad `Graph` slice and moved the clearest remaining Recall-parity gap back to `Home`.
- Wide desktop `Home` is materially calmer than it used to be, but it still spreads one browsing task across too many control layers:
  - a top workbench seam
  - an organizer-rail header with its own controls
  - a board header that repeats status and selection context again
- Recall's current organization direction is still more sidebar-owned:
  - the left tags panel carries the header controls
  - selecting a tag filters the card list on the right
  - the right side behaves more like the working card board than a second control destination
- This stage resets `Home` around that organizer-owned navigation model instead of reopening another small organizer-row or copy-only trim.

## Source Direction
- Recall's [Tagging deep dive](https://docs.getrecall.ai/deep-dives/tagging) explicitly frames the left tags panel as the main navigation surface:
  - a hierarchical tag panel in the left sidebar
  - header controls at the top of that side panel
  - clicking a tag filters the card list on the right side of the home page
- The [Feb 6, 2026 release notes](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-6-2026-ocr-improved-organization-track-your-reading-pos) reinforce the same direction:
  - improved organization
  - a stronger, more flexible tag tree
  - collapse and sorting controls that belong to the left panel
- The [Recall changelog](https://feedback.getrecall.ai/changelog) continues to reinforce organization as a primary working workflow rather than a separate landing stack.

## Scope
- Rework wide-desktop `Home` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css` as one organizer-owned navigation reset.
- Demote the top Home seam into a smaller shell-status strip:
  - keep the section identity visible
  - keep essential counts/status nearby
  - stop using the seam as a second board-header destination
- Promote the organizer rail into the clear owner of browse controls:
  - keep search in the rail
  - keep sorting in the rail
  - keep organizer hide/show
  - shift the preview-collapse behavior toward a more explicit `Collapse all` / `Expand all` style control if that reads closer to the current Recall direction
- Simplify the right-side board header:
  - keep the selected group/filter identity
  - keep the item count
  - reduce repeated helper copy and duplicated status chips
  - make the board feel like the results/work area, not a second command deck
- Keep the reopen cluster attached inside the board, but reduce its visual claim relative to the active card list so the right side reads like one filtered board with a continuation band, not a stacked workflow.
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
- Keep the pass broad enough to matter: this is a navigation-ownership reset, not another chip, sentence, or spacing-only pass.

## Public Interfaces / Types
- No backend, schema, or API contract changes.
- No route or continuity schema changes are expected.

## Validation
- targeted Vitest for `src/components/RecallWorkspace.stage37.test.tsx` and `src/App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 447/448 harness pair
- real Windows Edge Stage 447 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop `Home` reads more like a sidebar-owned organizer and a quieter filtered board, not three stacked control destinations.
- The organizer rail clearly owns search/sort/collapse/hide behavior.
- The right-side board header feels materially lighter and more result-focused.
- `Graph` and original-only `Reader` remain visually stable behind the Home pass.
