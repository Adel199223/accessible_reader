# ExecPlan: Stage 104 Post-Stage-103 Benchmark Audit

## Summary
- Audited the fresh post-Stage-103 Home, Graph, Study, and focused-Study captures against the benchmark matrix.
- Confirmed that Stage 103 materially improved Home enough that Home is no longer the clearest remaining blocker.
- Selected a bounded Study implementation pass from fresh visual evidence instead of continuing to overwork Home.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Add Content
  - Knowledge Graph
  - Spaced repetition / review
- Official supporting Recall sources, as tracked in `docs/ux/recall_benchmark_matrix.md`

## Fresh Artifacts
- `scripts/playwright/stage104_post_stage103_benchmark_audit_edge.mjs`
- `output/playwright/stage104-home-landing-desktop.png`
- `output/playwright/stage104-graph-browse-desktop.png`
- `output/playwright/stage104-study-browse-desktop.png`
- `output/playwright/stage104-focused-study-desktop.png`
- `output/playwright/stage104-post-stage103-benchmark-audit-validation.json`

## Findings
- Home:
  - Stage 103 materially improved Home.
  - The populated header now reads as one compact heading-and-snapshot row instead of two staged setup zones.
  - `Start here` now begins soon enough that Home no longer feels like the clearest remaining benchmark blocker.
- Study:
  - Study stayed stable after the Home pass, but it now becomes the clearest remaining mismatch.
  - The browse-mode `Session` rail still reads too much like a persistent sidebar instead of lightweight support.
  - The review flow still sits inside too much surrounding empty dashboard canvas relative to the more singular Recall review direction.
  - Inference from the user-provided Study benchmark screenshots plus the benchmark matrix: the next bounded pass should demote the left-side session utility further and recenter the review canvas so the task owns more of the page.
- Graph:
  - Graph stayed visually stable and remains a lower-mismatch surface.
- Focused regression:
  - Focused Study preserved the reader-led split and stayed stable during the audit.

## Decision
- Stage 104 is complete.
- Stage 105 should be `Recall Study Session Rail Demotion And Review Canvas Recentering`.
- Stage 105 should stay tightly bounded to Study: reduce the browse-mode session rail’s sidebar feel, tighten the review canvas around the active task, and keep Home, Graph, focused Study, and the deferred responsive-shell issue stable.

## Validation
- `node scripts/playwright/stage104_post_stage103_benchmark_audit_edge.mjs`
- screenshot-led manual review against `docs/ux/recall_benchmark_matrix.md` and the user-provided Recall benchmark screenshots
- manifest JSON parse check

## Execution Note
- On this machine, the repo-owned Edge screenshot harness should continue to run through Windows `node` rather than WSL `node`, because WSL Playwright attempts to launch Linux `msedge`, which is not installed.
