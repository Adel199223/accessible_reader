# ExecPlan: Stage 493 Graph Card Drawer And Connection Follow Reset After Stage 492

## Summary
- Reopen `Graph` for the next broad Recall-parity slice after the Stage 492 Home audit.
- Keep the current canvas-first graph model intact:
  - minimal launcher plus top-right search/navigation corner
  - explicit `Fit to view` and `Lock graph` / `Unlock graph` controls
  - settings-owned presets, timeline, content filters, color groups, and appearance/layout controls
  - bottom working rail for focus mode, source continuity, and multi-select/path ownership
  - live legend, resizable settings drawer, and lock-gated manual arrangement
- Close the remaining high-leverage parity gap by turning the selected-node drawer into a truer card drawer with clearer source continuity and connection-follow behavior.

## Benchmark Direction
- Anchor this pass to Recall's current Graph selection and drawer direction:
  - [Graph selection and exploration](https://docs.getrecall.ai/deep-dives/graph/selection-and-exploration)
  - [Graph overview](https://docs.getrecall.ai/deep-dives/graph/overview)
  - [Recall Release Notes: Jan 12, 2026 - Graph View 2.0 and much more](https://feedback.getrecall.ai/changelog/recall-release-notes-jan-12-2026-graph-view-20-and-much-more)
- The repo already matches the broader Recall direction on:
  - canvas-first hierarchy with lighter corner controls
  - settings-owned filtering, presets, timeline, legend, and live view controls
  - focus mode, bottom-rail path ownership, and multi-select path finding
  - calmer hover preview and stronger selected-node dimming
- The remaining broad mismatch is the selected-node drawer itself:
  - the right drawer still reads like `Overview / Mentions / Relations`
  - it does not yet feel like a full card drawer that lets the user read card context first, then move into source content and linked-card exploration
  - linked relations do not yet behave like a clear follow-connection workflow from inside the drawer
- Inference from those sources:
  - the next honest parity move is not another settings or canvas-control tweak
  - the highest-leverage improvement is a drawer reset that feels more like Recall's current card drawer while staying local-first and original-only on source content

## Implementation Scope

### 1. Reset the Graph drawer around a card-first tab model
- Replace the current expanded drawer tab language with a truer card workflow:
  - `Card`
  - `Reader`
  - `Connections`
- Keep the peek state lightweight, but make the expanded state feel like one selected card workspace instead of a grouped evidence dashboard.
- Default the expanded drawer to `Card`.

### 2. Make the `Card` tab feel like a real selected-card surface
- Promote the selected node's own context:
  - title
  - node type / status / confidence
  - description or fallback summary
  - aliases when present
  - source-document inventory for the card
- Keep validation actions available, but stop letting them dominate the drawer hierarchy.
- Preserve grounded provenance; do not turn the drawer into an ungrounded summary surface.

### 3. Turn the current mentions flow into a clearer original-only `Reader` tab
- Keep the source-grounded mention runs and source reopen actions.
- Reframe that content as the original/source-content continuity tab rather than a secondary mention utility stack.
- Keep this original-only:
  - no generated-content work
  - no `Reflowed`, `Simplified`, or `Summary`
  - no generated-view UX, transform logic, placeholders, controls, or mode-routing changes

### 4. Turn relations into a clearer `Connections` exploration tab
- Keep relation evidence and validation actions.
- Add a direct follow-connection action so the user can move from the selected card to the linked card from inside the drawer.
- Preserve the bottom working rail path/focus model while making the drawer a more believable exploration surface.

### 5. Preserve the rest of the Graph system
- Preserve:
  - search navigation
  - path mode and path highlighting
  - settings drawer behavior
  - color groups and legend
  - fit/lock/manual arrangement
  - focus trail and source continuity in the bottom rail
- Do not reopen `Home` or `Reader` design work in this stage except for regression verification.
- Do not add backend schema changes; the intended solution stays frontend-only.

## Files Expected
- `frontend/src/components/RecallWorkspace.tsx`
- `frontend/src/index.css`
- targeted Graph regressions in:
  - `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - `frontend/src/App.test.tsx`

## Test Plan
- Extend `frontend/src/components/RecallWorkspace.stage37.test.tsx` to lock:
  - the expanded Graph drawer now exposes `Card`, `Reader`, and `Connections`
  - the `Card` tab shows aliases and source-document context when available
  - the `Reader` tab keeps source-grounded evidence and source reopen actions
  - the `Connections` tab exposes follow-connection navigation
- Keep `frontend/src/App.test.tsx` aligned with the new Graph workflow so:
  - selecting a node still opens the calmer drawer
  - following a connection from the drawer moves focus to the linked node
  - the bottom rail and source continuity stay intact
- Add a new real Edge harness pair:
  - Stage 493 implementation harness for Graph default wide state, selected card drawer, reader tab, and connections-follow state
  - Stage 494 audit harness refreshing `Graph`, `Home`, and original-only `Reader`

## Validation
- targeted Vitest for:
  - `src/components/RecallWorkspace.stage37.test.tsx`
  - `src/App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 493/494 harness pair
- live `200` checks for:
  - `http://127.0.0.1:8000/recall?section=graph`
  - `http://127.0.0.1:8000/reader`
- real Windows Edge runs against `http://127.0.0.1:8000`

## Exit Criteria
- Wide desktop `Graph` now uses a more believable card-first drawer instead of an `Overview / Mentions / Relations` evidence panel.
- The expanded drawer exposes clearer selected-card context, an original-only source/Reader continuity tab, and a clearer linked-card exploration tab.
- Following a connection from the drawer feels direct and keeps the broader path/focus model intact.
- `Home` and original-only `Reader` stay visually stable behind the Graph pass.
