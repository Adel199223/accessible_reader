# ExecPlan: Stage 150 Post-Stage-149 Benchmark Audit

## Summary
- Audit the fresh post-Stage-149 Home, Graph, Study, and focused-Study captures against the Recall benchmark direction.
- Verify whether compacting the Home opening cluster and extending the lower continuation was enough to stop Home from leading the mismatch list.
- Select the next bounded implementation slice from fresh screenshot evidence instead of assuming Home still needs another immediate pass.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Graph
  - Spaced repetition / review
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Knowledge Graph overview](https://docs.getrecall.ai/docs/features/knowledge-graph/overview)
  - [Quiz & Spaced Repetition](https://docs.getrecall.ai/docs/features/quiz-and-spaced-repetition)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Problem Statement
- Stage 149 materially calmed Home by shrinking the no-resume opening cluster to one nearby support row and letting the continuation carry farther downward before the reveal card.
- The next step should be a benchmark audit, not another immediate implementation pass, because the remaining top-level blocker may now have narrowed within Home or shifted back to another surface.
- The audit should preserve the calmer Graph, Study, and focused-study baselines unless the fresh captures show a different top-level mismatch.

## Goals
- Review fresh Stage 149 Home, Graph, Study, and focused-Study artifacts side by side with the benchmark direction.
- Confirm whether Home still leads the mismatch list after the opening-cluster-compaction and lower-canvas-fill pass.
- Open the next bounded stage using screenshot evidence and keep the roadmap/docs aligned with that decision.

## Non-Goals
- Do not widen into backend, storage, or non-UI work.
- Do not assume another Home follow-up before reviewing the fresh artifacts.
- Do not start the next implementation slice inside this audit plan.

## Inputs
- `scripts/playwright/stage149_home_opening_cluster_compaction_edge.mjs`
- `scripts/playwright/stage150_post_stage149_benchmark_audit_edge.mjs`
- `output/playwright/stage149-home-landing-desktop.png`
- `output/playwright/stage149-graph-browse-desktop.png`
- `output/playwright/stage149-study-browse-desktop.png`
- `output/playwright/stage149-focused-study-desktop.png`
- `output/playwright/stage149-home-opening-cluster-compaction-validation.json`

## Implementation Targets
- `docs/exec_plans/completed/2026-03-16_stage150_post_stage149_benchmark_audit.md`
- `docs/ROADMAP.md`
- `docs/ROADMAP_ANCHOR.md`
- `docs/assistant/APP_KNOWLEDGE.md`
- `docs/assistant/manifest.json`
- `docs/ux/recall_benchmark_matrix.md`
- `agent.md`
- `scripts/playwright/stage150_post_stage149_benchmark_audit_edge.mjs`

## Validation
- `node scripts/playwright/stage150_post_stage149_benchmark_audit_edge.mjs`
- screenshot-led manual review of the fresh Home, Graph, Study, and focused-Study captures
- `Get-Content .\docs\assistant\manifest.json -Raw | ConvertFrom-Json | Out-Null`

## Exit Criteria
- Fresh post-Stage-149 captures are reviewed and the clearest remaining blocker is identified.
- The roadmap, benchmark matrix, and assistant handoff docs point at the correct next bounded slice.
- The audit stays benchmark-led and does not widen scope beyond the next slice selection.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.

## Findings
- Fresh Stage 150 captures confirm that Stage 149 materially improved Home:
  - the no-resume opening is slimmer and no longer reads like a broad split lead stack
  - the continuation now carries farther before the reveal control, which reduces the abrupt stop directly under the opening band
- Home still remains the clearest remaining mismatch, but more narrowly:
  - the lower continuation still ends too quickly relative to the available canvas
  - the `Show all ...` reveal still reads like a separate boxed endpoint on the right rather than a lighter in-flow continuation control
- Graph remains materially calmer and lower-priority because the canvas still dominates despite the visible left selector strip and right detail dock.
- Study and focused Study remain visually stable and lower-priority in the refreshed artifacts.

## Decision
- Close Stage 150 as complete.
- Open Stage 151 as `Recall Home Continuation Grid Fill And Reveal Card Demotion`.
- Keep the next implementation slice bounded to Home lower-continuation fill and reveal-control demotion; do not reopen Graph, Study, or focused reader-led work unless a direct regression is uncovered.
