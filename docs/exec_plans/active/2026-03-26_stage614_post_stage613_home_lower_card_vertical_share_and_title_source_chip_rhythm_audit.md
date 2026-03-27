# ExecPlan: Stage 614 Post-Stage-613 Home Lower-Card Vertical-Share And Title-Source-Chip Rhythm Audit

## Summary
- Audit the Stage 613 Home lower-card vertical-share and rhythm pass against the March 25, 2026 Recall homepage screenshot.
- Confirm that the representative card now gives slightly more visual ownership to the lower title/source/chip seam without reopening structure, rail, or toolbar work.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - representative card
  - full Home wide-desktop view

## Acceptance
- The audit states clearly whether Stage 613 reduced the remaining lower-card vertical-share mismatch without reopening structure work.
- The audit records whether the representative preview ratio dropped below the Stage 612 baseline while the copy ratio rose above it.
- The audit records whether title/source/chip spacing now reads a little more like Recall while preserving the Stage 611 source/chip legibility gains.
- The audit records whether `4` visible toolbar controls and `0` visible day-group count nodes are preserved.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 613/614 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 613/614 files

## Outcome
- Complete locally on 2026-03-26.
- The live Stage 614 audit confirmed that Stage 613 improved the lower card vertical-share and title/source/chip rhythm without reopening the Stage 563 structure or the Stage 610 toolbar/rail restraint pass.
- Supporting live Edge evidence recorded a preserved `203.52px` representative card height, `0.6415` preview ratio, `0.2505` copy ratio, `16.008px` title line-height, `2.55px` title-to-source gap, `2.08px` source-to-chip gap, preserved `10.24px` source text at `rgba(196, 209, 231, 0.64)`, preserved `7.52px` chip text at `rgba(207, 218, 237, 0.48)`, `4` visible toolbar controls, `0` visible day-group count nodes, and stable original-only `Reader` plus `Graph` regression captures.
- Final roadmap and handoff sync is complete for the Stage 614 checkpoint.
