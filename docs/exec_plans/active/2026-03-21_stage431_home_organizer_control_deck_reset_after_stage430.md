# ExecPlan: Stage 431 Home Organizer Control Deck Reset After Stage 430

## Summary
- The Stage 430 audit moved the next broad Recall-parity opportunity back to `Home`.
- Official Recall references still emphasize the homepage/tag-tree panel as the main organizer surface: filter/search, sort behavior, expand-collapse control, and a lighter working board that follows the organizer instead of competing with it.
- Our current `Home` is materially closer than the pre-Stage-428 versions, but it still reads like a wide top seam plus a browse strip plus a board, not yet like one organizer-led workspace.

## Source Direction
- Recall's [Tagging deep dive](https://docs.getrecall.ai/deep-dives/tagging) frames the left tag tree as the core organizational control surface.
- The [Feb 6, 2026 release notes](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-6-2026-ocr-improved-organization-track-your-reading-pos) call out tag-tree improvements including flexible sorting, expand/collapse-all behavior, and stronger homepage organization.
- The [Recall changelog](https://feedback.getrecall.ai/changelog) also notes homepage card-source clarity and one-click homepage actions, reinforcing that the homepage should feel like a direct working organizer rather than a passive landing board.

## Scope
- Rework wide-desktop `Home` in `frontend/src/components/RecallWorkspace.tsx`, `frontend/src/index.css`, and the small continuity types needed to support a bounded organizer-control model.
- Make the organizer rail a stronger control deck:
  - add a lightweight organizer sort mode
  - upgrade preview collapse into a clearer expand/collapse-all style control
  - add an explicit hide/show organizer flow
  - keep search tightly attached to the organizer model
- Compress the top Home seam so it reads more like a slim status-and-access strip than a broad introductory banner.
- Let the main board respond to organizer visibility:
  - when the organizer is visible, keep the board subordinate to it
  - when the organizer is hidden, let the board widen and start sooner without losing access to search or organizer reopening
- Preserve current product behavior:
  - browse-first Home landing
  - selected group continuity
  - pinned reopen shelf
  - focused source reopen behavior
  - search filtering
  - source handoff into overview, Reader, Notes, Graph, and Study
- Keep `Graph` and original-only `Reader` as regression checkpoints only.

## Guardrails
- Do not widen into `Graph`, `Notes`, `Study`, or backend work except for tiny shared-shell adjustments needed to support the Home reset.
- Keep `Reader` original-only and cosmetic-only in this track:
  - no `Reflowed`
  - no `Simplified`
  - no `Summary`
  - no generated-view UX
  - no transform logic
  - no generated placeholders
  - no generated-view controls
  - no mode-routing changes
- Keep the slice broad enough to matter. This is not another copy trim or single-chip tweak; the organizer control model and the Home seam hierarchy should both move.

## Public Interfaces / Types
- No backend or API contract changes.
- Frontend continuity may grow lightweight Home organizer state so sort mode and organizer visibility survive section switching.

## Validation
- targeted Vitest for `RecallWorkspace.stage37.test.tsx` plus `App.test.tsx`
- `npm run lint` in `frontend`
- `npm run build` in `frontend`
- `git diff --check`
- `node --check` for the Stage 431/432 harness pair
- real Windows Edge Stage 431 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop `Home` uses a more Recall-like organizer control deck instead of a simple browse strip with one collapse button.
- The top seam is slimmer and more utility-first.
- Hiding the organizer is a supported desktop state and the board responds cleanly.
- Search and sorting still feel coherent whether the organizer is visible or hidden.
- `Graph` and original-only `Reader` remain visually stable behind the Home pass.
