# ExecPlan: Stage 106 Post-Stage-105 Benchmark Audit

## Summary
- Audited the fresh post-Stage-105 Home, Graph, Study, and focused-Study captures against the benchmark matrix.
- Confirmed that Stage 105 reduced the remaining Study mismatch enough that Study is no longer the clearest blocker.
- Selected a bounded Home implementation pass from fresh screenshot evidence instead of assumption.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Add Content
  - Knowledge Graph
  - Spaced repetition / review
- Official supporting Recall sources, as tracked in `docs/ux/recall_benchmark_matrix.md`

## Fresh Artifacts
- `scripts/playwright/stage106_post_stage105_benchmark_audit_edge.mjs`
- `output/playwright/stage105-home-landing-desktop.png`
- `output/playwright/stage105-graph-browse-desktop.png`
- `output/playwright/stage105-study-browse-desktop.png`
- `output/playwright/stage105-focused-study-desktop.png`
- `output/playwright/stage105-study-session-rail-demotion-validation.json`
- `output/playwright/stage106-home-landing-desktop.png`
- `output/playwright/stage106-graph-browse-desktop.png`
- `output/playwright/stage106-study-browse-desktop.png`
- `output/playwright/stage106-focused-study-desktop.png`
- `output/playwright/stage106-post-stage105-benchmark-audit-validation.json`

## Findings
- Home:
  - Home is now the clearest remaining mismatch again.
  - Inference from the fresh Stage 106 Home capture against the user-provided Recall Home benchmark: the landing still reads too much like one staged featured band plus a quiet archive stack below it.
  - The remaining weight is concentrated in the lower canvas, where `Keep going` still hands off into a fairly list-like archive section instead of feeling like one continuous selective reopen flow.
- Study:
  - Stage 105 materially improved Study.
  - The collapsed `Session` rail no longer reads like the main blocker, and the review card now owns the page much sooner.
  - Study is no longer the clearest benchmark mismatch after the lighter support strip and recentered review frame.
- Graph:
  - Graph stayed stable and remains a lower-mismatch surface.
- Focused regression:
  - Focused Study preserved the reader-led split and stayed stable during the audit.

## Decision
- Stage 106 is complete.
- Stage 107 should be `Recall Home Featured Flow Unification And Lower Canvas Compaction`.
- Stage 107 should stay tightly bounded to Home: reduce the staged split between the featured reopen band and the lower reopen list so the landing feels more continuous and selective without reopening Study, Graph, or the deferred responsive-shell issue.

## Validation
- `node scripts/playwright/stage106_post_stage105_benchmark_audit_edge.mjs`
- screenshot-led manual review against `docs/ux/recall_benchmark_matrix.md` and the user-provided Recall benchmark screenshots
- manifest JSON parse check

## Execution Note
- On this machine, the repo-owned Edge screenshot harness should continue to run through Windows `node` rather than WSL `node`, because WSL Playwright attempts to launch Linux `msedge`, which is not installed.
