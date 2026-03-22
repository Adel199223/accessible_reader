# ExecPlan: Stage 490 Post-Stage-489 Graph Saved-View Presets Workflow Audit

## Summary
- Audit the Stage 489 `Graph` saved-view preset reset against Recall's current Graph customization direction.
- Judge whether presets now behave like a believable working tool instead of three fixed chips.
- Keep `Home` and original-only `Reader` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - `Graph`
  - `Home`
  - original-only `Reader`
- Supporting `Graph` crops:
  - default wide state
  - settings drawer with preset management visible
  - saved preset created and applied
  - saved preset renamed or updated

## Acceptance
- The audit states clearly whether Stage 489 materially reduced the remaining mismatch between Recall's current Graph benchmark and our local preset workflow.
- The audit records whether saved presets now feel reusable and named rather than decorative.
- The audit records whether preset management stays inside the settings drawer without reviving heavy chrome elsewhere.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no mode-routing or transform changes.

## Validation
- `node --check` for the Stage 489/490 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
