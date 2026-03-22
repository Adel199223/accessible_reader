# ExecPlan: Stage 415 Home Organizer Highlight Deflation After Stage 414

## Summary
- The post-Stage-414 checkpoint still leaves `Home` as the clearest remaining Recall-parity gap in the current track.
- Stage 413/414 made the active organizer state more continuous, but the selected row still carries slightly more highlight chrome than Recall's leanest organizer rails.
- This stage keeps the scope on `Home` only and deflates that remaining selected-row highlight so the organizer reads even more like a minimal working list rather than a highlighted control card.

## Source Direction
- Recall's [Tagging deep dive](https://docs.getrecall.ai/deep-dives/tagging) frames the tag tree as a compact organizer that drives the homepage rather than a collection of nested feature cards.
- Recall's [changelog](https://feedback.getrecall.ai/changelog) continues to emphasize lighter organization flows, faster scanning, and cleaner at-a-glance control surfaces.
- The remaining mismatch after Stage 414 is no longer continuity. It is emphasis: the active row should still be obvious, but more through rhythm and hierarchy than through border-and-badge chrome.

## Scope
- Rework wide-desktop `Home` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css`.
- Keep the Stage 414 continuous selected-state structure as the base.
- Reset the remaining active-row highlight chrome:
  - reduce the selected-row border and fill treatment so it reads more like a light selection wash than a framed panel
  - soften the active count chip so it behaves more like an attached status hint than a bold badge
  - deflate any remaining active preview emphasis so the row and its children stay in one organizer rhythm
  - preserve clear selection affordance in both expanded and collapsed states
- Preserve current product behavior:
  - source search and filtering
  - group selection
  - collapse/expand organizer previews
  - pinned reopen actions
  - `Home` to focused-source handoff
  - shell `Search` and `New` actions
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
- Do not widen into `Graph`, `Notes`, `Study`, or backend work in this stage unless a tiny shared-shell adjustment is required for the Home organizer reset to read correctly.
- Avoid another micro-adjustment with no visible payoff: the active organizer row should materially stop reading like a special highlighted tile.

## Validation
- targeted Vitest for `RecallWorkspace.stage37.test.tsx` plus `App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 415/416 harness pair
- real Windows Edge Stage 415 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop `Home` active organizer selection reads more like a minimal list selection and less like a highlighted mini-panel.
- The active row remains clear without depending on bold chip-and-border chrome.
- Attached preview children stay subordinate and visually quiet.
- `Graph` and original-only `Reader` remain visually stable behind the Home pass.
