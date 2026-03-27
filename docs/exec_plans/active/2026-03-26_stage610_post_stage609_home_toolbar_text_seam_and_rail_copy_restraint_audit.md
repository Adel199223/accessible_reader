# ExecPlan: Stage 610 Post-Stage-609 Home Toolbar-Text Seam And Rail-Copy Restraint Audit

## Summary
- Audit the Stage 609 Home toolbar-text and rail-copy restraint pass against the March 25, 2026 Recall homepage screenshot.
- Confirm that the Search/Ctrl+K seam and remaining rail copy now read calmer without reopening structure, card identity, or layout work.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - toolbar cluster
  - collection rail
  - full Home wide-desktop view

## Acceptance
- The audit states clearly whether Stage 609 reduced the remaining toolbar/rail text-seam mismatch without reopening structure work.
- The audit records whether the Search label, `Ctrl+K` hint, rail heading meta, rail summary line, selected/inactive support copy, and active preview label all land quieter than the Stage 608 baseline.
- The audit records whether `4` visible toolbar controls and `0` visible day-group count nodes are preserved.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 609/610 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 609/610 files

## Outcome
- Complete locally on 2026-03-26.
- The live Stage 610 audit confirmed that Stage 609 reduced the remaining toolbar-text and rail-copy mismatch without reopening the Stage 563 structure or the Stage 608 lower-card identity pass.
- Supporting live Edge evidence recorded softer Search/Ctrl+K copy, softer rail heading/meta/support seams, preserved `4` visible toolbar controls, preserved `0` visible day-group count nodes, and stable original-only `Reader` plus `Graph` regression captures.
- Final roadmap and handoff sync is complete for the Stage 610 checkpoint.
