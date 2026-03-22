# ExecPlan: Stage 478 Post-Stage-477 Graph Timeline Presets And Filter Customization Audit

## Summary
- Audit the Stage 477 `Graph` filtering/customization reset against Recall's current Graph View 2.0 direction.
- Judge whether the settings sidebar now behaves like a real customization surface instead of a thin depth/layout control stack.
- Keep `Home` and original-only `Reader` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - `Graph`
  - `Home`
  - original-only `Reader`
- Supporting `Graph` crops:
  - settings drawer with presets/content/timeline controls
  - timeline-filtered state
  - preset/filter state that materially changes the canvas and rail

## Acceptance
- The audit states clearly whether Stage 477 materially reduced the remaining mismatch between Recall's current graph benchmark and our local graph settings workflow.
- The audit records whether presets, timeline, and content filters materially recompose the canvas instead of reading like decorative chrome.
- The audit records whether the bottom rail and selected-node/path flows remain coherent while filtered or timeline-bound.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 477/478 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
