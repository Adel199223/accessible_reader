# ExecPlan: Stage 699 Post-Stage-698 Embedded Notebook Follow-Through Inside Home And Source Workspaces Audit

## Summary
- Audit the Stage 698 embedded Notebook follow-through against the current Recall-informed notebook placement benchmark.
- Confirm that `Notebook` now feels native inside `Home` / Library and saved-source workspaces without reviving a visible top-level `Notes` destination or destabilizing `Home`, `Graph`, original-only `Reader`, or `Study`.

## Audit Focus
- Desktop `Home` / Library Notebook workspace
- source-focused Notebook tab inside a saved-source workspace
- global Search note handoff into embedded Notebook
- Reader/source handoff into embedded Notebook
- hidden `/recall?section=notes` compatibility alias
- regression captures for `Home`, `Graph`, original-only `Reader`, and `Study`

## Acceptance
- No visible top-level `Notes` rail entry returns.
- Desktop Notebook shows a flatter native Library workbench with calmer browse/detail hierarchy than Stage 697.
- Source-focused Notebook remains attached to the source workspace and preserves the Reader-first split behavior.
- Search, Reader, source, and alias handoffs still land inside Notebook correctly.
- `Home`, `Graph`, original-only `Reader`, and `Study` remain stable in real Windows Edge on `http://127.0.0.1:8000`.

## Validation
- Stage 698 targeted tests remain green
- Stage 699 live Edge audit artifacts captured and recorded
