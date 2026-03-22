# ExecPlan: Stage 411 Home Organizer-Row Flattening After Stage 410

## Summary
- The post-Stage-410 checkpoint still leaves `Home` as the clearest remaining Recall-parity gap in the current track.
- Stage 409/410 compressed the organizer-rail header and raised the first visible group, but the saved-source groups themselves still read a little too much like stacked mini-cards.
- This stage keeps the scope on `Home` only and flattens the organizer rows so the rail reads more like Recall's lean tag-list control surface and less like a second shelf of boxed content.

## Source Direction
- Recall's [Tagging deep dive](https://docs.getrecall.ai/deep-dives/tagging) frames tags as a compact organizer that drives the library, not a separate card wall.
- Recall's [changelog](https://feedback.getrecall.ai/changelog) keeps reinforcing faster organization, clearer at-a-glance filtering, and utility-first library controls over decorative browse chrome.
- The remaining mismatch after Stage 410 is less about header structure and more about row rhythm: the active and inactive organizer entries should feel flatter, denser, and more list-like.

## Scope
- Rework wide-desktop `Home` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css`.
- Keep the Stage 410 tighter organizer header as the base.
- Reset the saved-source group rows so they feel more like one lean organizer list:
  - flatten inactive group rows so they stop reading like standalone cards
  - give the active group a stronger selected-row treatment without restoring a bulky boxed tile
  - tighten the label/count relationship so the count reads like a compact working meter instead of a subtitle block
  - reduce preview-child weight so active previews read like attached list items instead of nested mini-cards
  - keep the organizer readable when previews are collapsed and when search is active
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
- Avoid another seam-level nudge: the visible result should materially reduce the sense that the organizer tree is made of stacked tiles.

## Validation
- targeted Vitest for `RecallWorkspace.stage37.test.tsx` plus `App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 411/412 harness pair
- real Windows Edge Stage 411 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop `Home` organizer rows read as a flatter, denser control list rather than stacked mini-cards.
- The active group still feels selected and grounded without becoming a bulky feature tile.
- Preview children stay useful but visually subordinate to the group list.
- `Graph` and original-only `Reader` remain visually stable behind the Home pass.
