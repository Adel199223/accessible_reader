# ExecPlan: Stage 98 Post-Stage-97 Benchmark Audit

## Summary
- Audited the fresh post-Stage-97 Home, Graph, Study, and focused-Study captures against the benchmark matrix.
- Confirmed that Stage 97 materially improved Home, but not enough to remove Home as the clearest remaining blocker.
- Selected one more bounded Home implementation pass from fresh visual evidence instead of returning to Study prematurely.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Add Content
  - Knowledge Graph
  - Spaced repetition / review
- Official supporting Recall sources, as tracked in `docs/ux/recall_benchmark_matrix.md`

## Fresh Artifacts
- `scripts/playwright/stage98_post_stage97_benchmark_audit_edge.mjs`
- `output/playwright/stage98-home-landing-desktop.png`
- `output/playwright/stage98-graph-browse-desktop.png`
- `output/playwright/stage98-study-browse-desktop.png`
- `output/playwright/stage98-focused-study-desktop.png`
- `output/playwright/stage98-post-stage97-benchmark-audit-validation.json`

## Findings
- Home:
  - Stage 97 materially improved Home.
  - The left support now reads more like compact utility, but it still behaves visually like a standing secondary dock rather than a lighter in-flow support strip.
  - The merged `Saved sources` heading and copy are calmer than before, but they still keep the `Start here` reopen card lower and more staged than the benchmark direction wants.
  - Inference from the user-provided Home benchmark screenshots plus the benchmark matrix: the next bounded pass should further collapse the support dock and reduce the remaining saved-sources preamble so the featured reopen flow begins even sooner.
- Study:
  - Study stayed stable after the Home pass and remains materially calmer than it was before the Stage 87 to 93 sequence.
  - Study is not the clearest remaining blocker after the Stage 98 audit.
- Graph:
  - Graph stayed stable and remains a lower-mismatch surface.
  - It still carries support chrome, but not enough to outrank Home in the next bounded pass.
- Focused regression:
  - Focused Study preserved the reader-led split and stayed stable during the audit.

## Decision
- Stage 98 is complete.
- Stage 99 should be `Recall Home Support Dock Collapse And Saved Sources Preamble Reduction`.
- Stage 99 should stay tightly bounded to Home: further collapse the remaining support-dock feel and reduce the saved-sources preamble while keeping Study, Graph, and focused reader-led work stable.

## Validation
- `node scripts/playwright/stage98_post_stage97_benchmark_audit_edge.mjs`
- screenshot-led manual review against `docs/ux/recall_benchmark_matrix.md` and the user-provided Recall benchmark screenshots
- manifest JSON parse check

## Execution Note
- On this machine, the repo-owned Edge screenshot harness should continue to run through Windows `node` rather than WSL `node`, because WSL Playwright attempts to launch Linux `msedge`, which is not installed.
