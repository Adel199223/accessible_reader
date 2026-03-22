# ExecPlan: Stage 439 Home Unified Workbench Surface Reset After Stage 438

## Summary
- The Stage 438 audit closed the current broad `Graph` slice and moved the clearest remaining Recall-parity gap back to `Home`.
- Official Recall organization guidance still points toward `Home` behaving like one organizer-driven library workspace rather than a stack of separate hero, rail, and board cards.
- Our current `Home` is materially closer than the earlier board-fill and organizer-row passes, but it still reads as:
  - a boxed full-width top seam
  - a separately boxed organizer shell
  - a separately boxed library board
- This stage resets that hierarchy into one slimmer workbench surface instead of another small polish pass.

## Source Direction
- Recall's [Tagging deep dive](https://docs.getrecall.ai/deep-dives/tagging) continues to position tags and grouped organization as the main control model for browsing saved knowledge.
- Recall's [changelog](https://feedback.getrecall.ai/changelog) keeps reinforcing organization as a first-class desktop workflow rather than a secondary archive view.
- The [Feb 6, 2026 release notes](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-6-2026-ocr-improved-organization-track-your-reading-pos) reinforce the current direction:
  - improved organization
  - reading-position continuity
  - Home behaving like a practical working library, not a static landing page

## Scope
- Rework wide-desktop `Home` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css` as one broader workbench-surface reset.
- Flatten the current boxed top seam into a slimmer workbench bar:
  - keep the current status/readout semantics
  - reduce the hero-card feel
  - let the main library workspace start sooner
- Dock the organizer rail more tightly into the workspace:
  - keep search, sort, preview collapse, and organizer hide/show
  - reduce the sense that the organizer is a separate sidebar card competing with the board
- Flatten the primary library board into one calmer shell:
  - keep the reopen cluster attached at the top
  - keep filtered matches inside the same board shell
  - keep the selected-group board as the dominant browsing lane
- Preserve all existing Home behavior:
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
- Keep the pass broad enough to matter: this is a workbench hierarchy reset, not another tiny organizer-row trim.

## Public Interfaces / Types
- No backend, schema, or API contract changes.
- No route or continuity schema changes are expected.

## Validation
- targeted Vitest for `src/components/RecallWorkspace.stage37.test.tsx` and `src/App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 439/440 harness pair
- real Windows Edge Stage 439 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop `Home` reads as one organizer-led workbench instead of three stacked cards.
- The top seam becomes a slimmer workbench bar rather than a full-width hero block.
- The organizer rail reads like a docked control surface instead of a competing boxed column.
- The reopen cluster and selected-group board feel like one calmer library shell.
- `Graph` and original-only `Reader` remain visually stable behind the Home pass.
