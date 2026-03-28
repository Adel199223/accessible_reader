# ExecPlan: Stage 701 Post-Stage-700 Reader Workspace IA And Shell Reset Audit

## Summary
- Audit the Stage 700 Reader IA and shell reset against the March 18, 2026 Reader benchmark direction and the repo’s frozen generated-content constraints.
- Confirm that the Reader route now feels calmer and more document-first without changing generated outputs or breaking source/Notebook continuity.
- Keep `Home`, `Graph`, embedded `Notebook`, and `Study` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - Reader route in `Original`
  - Reader route in one generated mode
  - Reader source-workspace strip crop
  - Reader header/controls crop
  - Reader source dock crop
  - Reader Notebook dock crop
  - `Home`
  - `Graph`
  - embedded `Notebook`
- Regression checks:
  - source-workspace tab continuity from Reader into Notebook / Graph / Study
  - anchored note reopen in Reader
  - original-only Reader baseline still stable

## Acceptance
- The audit states clearly whether Stage 700 materially improved Reader IA and shell hierarchy without altering generated content behavior.
- The audit records whether the Reader route now clears into the document faster and whether the source-workspace strip is slimmer than the Stage 699 baseline.
- The audit records whether the source/Notebook dock now feels like a clearer contextual workbench instead of a cramped sidecar.
- The audit repeats the generation lock explicitly: no `Original`, `Reflowed`, `Simplified`, or `Summary` content-output changes are allowed.

## Validation
- `node --check` for the Stage 700/701 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
