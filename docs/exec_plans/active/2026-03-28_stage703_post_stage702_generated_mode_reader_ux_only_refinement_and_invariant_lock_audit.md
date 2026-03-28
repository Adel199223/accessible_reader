# ExecPlan: Stage 703 Post-Stage-702 Generated-Mode Reader UX-Only Refinement And Invariant Lock Audit

## Summary
- Audit the Stage 702 generated-mode Reader refinement against the March 18, 2026 Reader benchmark direction and the repo’s frozen generated-output constraints.
- Confirm that `Reflowed`, `Simplified`, and `Summary` now read as clearer derived modes of the current source while the underlying generated text remains unchanged.
- Keep `Home`, `Graph`, embedded `Notebook`, and `Study` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - Reader route in `Original`
  - Reader route in `Reflowed`
  - Reader route in `Summary` or the summary-ready missing state
  - generated-mode context crop
  - Reader Notebook dock crop
  - `Home`
  - `Graph`
  - embedded `Notebook`
- Regression checks:
  - summary-detail control placement
  - generated-mode provenance/source visibility
  - Notebook / Graph / Study branching points from generated-mode Reader
  - generated article text staying isolated from surrounding chrome
  - original-only Reader baseline still stable

## Acceptance
- The audit states clearly whether Stage 702 materially improved generated-mode Reader hierarchy and scan order without altering generated content behavior.
- The audit records whether the generated-mode context now makes source provenance and Notebook / Graph / Study branching obvious.
- The audit records whether summary detail moved into the generated summary flow.
- The audit repeats the invariant lock explicitly: no `Original`, `Reflowed`, `Simplified`, or `Summary` content-output changes are allowed.

## Validation
- `node --check` for the Stage 702/703 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`
