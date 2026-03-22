# ExecPlan: Stage 409 Home Organizer-Rail Header Compression After Stage 408

## Summary
- The post-Stage-408 checkpoint still leaves `Home` as the clearest remaining Recall-parity gap in the current track.
- Stage 407/408 flattened the top seam and made the board start earlier, but the organizer rail still spends too much height on its own entry stack before the tag tree begins.
- This stage keeps the scope on `Home` only and compresses that organizer-rail entry into a more utility-first working header so the tree starts doing the work sooner.

## Source Direction
- Recall Tagging deep dive: the tags panel is the thing driving the card list, so the panel should read like a working organizer rather than a second intro card.
- Recall changelog direction: homepage organization improvements emphasize faster filtering, clearer source-at-a-glance browsing, and more direct content-management actions, not more header chrome.
- Graph View 2.0 and homepage changelog notes reinforce the same pattern: utility surfaces should stay attached to the workbench, while visible content starts sooner.

## Scope
- Rework wide-desktop `Home` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css`.
- Keep the Stage 408 flatter top seam and earlier board start as the base.
- Reset the organizer rail entry stack so it feels more like one working header:
  - collapse the current organizer kicker, heading, explainer copy, control row, and extra summary row into a tighter utility-first rail header
  - let search and preview-toggle controls sit closer to the rail title instead of reading like a second section
  - remove redundant active-group explanation from the rail top when the selected group and board header already carry that context
  - raise the first visible group card so the tree begins sooner in the viewport
  - keep the rail readable and grounded when search is active
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
- Do not widen into `Graph`, `Notes`, `Study`, or backend implementation work in this stage unless a tiny shared-shell adjustment is required for the Home rail compression to read correctly.
- Avoid another micro-pass: the visible result should materially reduce the sense that the organizer rail introduces itself before it starts organizing.

## Validation
- targeted Vitest for `RecallWorkspace.stage37.test.tsx` plus `App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 409/410 harness pair
- real Windows Edge Stage 409 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop `Home` starts the organizer rail with a tighter working header instead of a stacked intro plus summary treatment.
- The first visible group rises higher and feels more directly attached to the rail controls.
- Search-active and grouped-browse states both remain clear without reintroducing a second intro card.
- `Graph` and original-only `Reader` remain visually stable behind the Home pass.
