# ExecPlan: Stage 100 Post-Stage-99 Benchmark Audit

## Summary
- Audited the fresh post-Stage-99 Home, Graph, Study, and focused-Study captures against the benchmark matrix.
- Confirmed that Stage 99 materially improved Home, but not enough to remove Home as the clearest remaining blocker.
- Selected a stronger bounded Home implementation pass from fresh visual evidence instead of returning to Study prematurely.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Add Content
  - Knowledge Graph
  - Spaced repetition / review
- Official supporting Recall sources, as tracked in `docs/ux/recall_benchmark_matrix.md`

## Fresh Artifacts
- `scripts/playwright/stage100_post_stage99_benchmark_audit_edge.mjs`
- `output/playwright/stage100-home-landing-desktop.png`
- `output/playwright/stage100-graph-browse-desktop.png`
- `output/playwright/stage100-study-browse-desktop.png`
- `output/playwright/stage100-focused-study-desktop.png`
- `output/playwright/stage100-post-stage99-benchmark-audit-validation.json`

## Findings
- Home:
  - Stage 99 materially improved Home.
  - The support/search area is quieter and the merged `Saved sources` preamble is shorter than before.
  - The left support/search area still reads too much like a standing support dock rather than lightweight in-flow utility.
  - The merged `Saved sources` heading and copy still stage the landing before the `Start here` reopen flow more than the benchmark direction wants.
  - Inference from the user-provided Home benchmark screenshots plus the benchmark matrix: the next bounded pass should inline or collapse the support utilities more aggressively and remove the remaining saved-sources preamble so the first reopen point begins almost immediately below the header.
- Study:
  - Study stayed stable after the Home pass and remains materially calmer than it was before the Stage 87 to 93 sequence.
  - Study is not the clearest remaining blocker after the Stage 100 audit.
- Graph:
  - Graph stayed stable and remains a lower-mismatch surface.
  - It still carries support chrome, but not enough to outrank Home in the next bounded pass.
- Focused regression:
  - Focused Study preserved the reader-led split and stayed stable during the audit.

## Decision
- Stage 100 is complete.
- Stage 101 should be `Recall Home Support Utility Inlining And Saved Sources Preamble Removal`.
- Stage 101 should stay tightly bounded to Home: inline or collapse the support utilities more aggressively and remove the remaining saved-sources preamble while keeping Study, Graph, and focused reader-led work stable.

## Validation
- `node scripts/playwright/stage100_post_stage99_benchmark_audit_edge.mjs`
- screenshot-led manual review against `docs/ux/recall_benchmark_matrix.md` and the user-provided Recall benchmark screenshots
- manifest JSON parse check

## Execution Note
- On this machine, the repo-owned Edge screenshot harness should continue to run through Windows `node` rather than WSL `node`, because WSL Playwright attempts to launch Linux `msedge`, which is not installed.
