# ExecPlan: Stage 435 Home Board-First Organizer Workspace Reset After Stage 434

## Summary
- The Stage 434 audit moved the clearest remaining broad Recall-parity gap back to `Home`.
- Official Recall tagging guidance still points to a left tag panel that drives one filtered card list on the right, with compact header controls rather than a dashboard of separate sidecars and lower streams.
- Our current `Home` is calmer than the pre-Stage-431 surface, but it still opens as organizer rail plus pinned reopen sidecar plus extra lower library stream, which reads more like a multi-panel dashboard than Recall's leaner organizer-led workspace.

## Source Direction
- Recall's [Tagging deep dive](https://docs.getrecall.ai/deep-dives/tagging) describes the tags panel as the left sidebar that filters the card list on the right side of the home page.
- The same tagging guide keeps the side-panel header focused on quick actions like filter, sort, collapse, and hide rather than a layered preview panel.
- Recall's [Feb 6, 2026 release notes](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-6-2026-ocr-improved-organization-track-your-reading-pos) emphasize tag-tree improvements around sorting, performance, expand/collapse, and filtering, which reinforces a control-rail model rather than a standing dashboard support column.

## Scope
- Rework wide-desktop `Home` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css` as one broader board-first organizer reset.
- Keep the organizer visible by default, but flatten it into a leaner list-first rail:
  - reduce extra panel framing and helper copy
  - keep search, sort, preview collapse, and hide/show organizer available
  - keep the active group and previews readable without making the organizer feel like a co-equal destination panel
- Merge the current `Pinned reopen shelf` into the top of the main board:
  - keep the lead reopen and nearby reopen actions available
  - stop presenting reopen as a standing companion sidecar beside the board
- Make the active board the clear dominant lane:
  - let the selected group own the main card field
  - keep the board visually continuous instead of splitting attention between board and sidecar
- Remove the separate wide-desktop `Other library groups` stream when the organizer is visible:
  - let the organizer own group switching
  - keep organizer-hidden mode as the fallback compact state only
- Keep filtered mode inside the same board-first workspace rather than switching to a detached search-results card model.
- Preserve current product behavior:
  - search filter
  - sort mode
  - organizer show/hide
  - preview collapse
  - selected-group continuity
  - reopen actions
  - focused source overview handoff
  - Reader reopen
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
- Keep the stage broad enough to matter: this is a structural organizer/workspace reset, not another small organizer-row trim.

## Public Interfaces / Types
- No backend or API contract changes.
- No route or continuity schema changes are expected.

## Validation
- targeted Vitest for `src/components/RecallWorkspace.stage37.test.tsx` and `src/App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 435/436 harness pair
- real Windows Edge Stage 435 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop `Home` reads as one organizer-led workspace with one dominant board instead of board plus standing sidecar plus lower stream.
- The organizer feels like a lean control rail that drives the board rather than a co-equal support panel.
- Reopen actions stay available, but they are folded into the main board workspace instead of occupying a separate companion destination.
- Filtered mode still feels like the same workspace instead of switching to a detached card model.
- `Graph` and original-only `Reader` remain visually stable behind the Home pass.
