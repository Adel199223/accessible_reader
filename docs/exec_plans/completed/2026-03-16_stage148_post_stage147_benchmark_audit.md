# ExecPlan: Stage 148 Post-Stage-147 Benchmark Audit

## Summary
- Audit the fresh post-Stage-147 Home, Graph, Study, and focused-Study captures against the Recall benchmark direction.
- Verify whether narrowing the Graph selector rail and slimming the selected-node detail dock was enough to stop Graph from leading the mismatch list.
- Select the next bounded implementation slice from fresh screenshot evidence instead of assuming Graph still needs another immediate pass.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Graph
  - Home / items
  - Spaced repetition / review
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Knowledge Graph overview](https://docs.getrecall.ai/docs/features/knowledge-graph/overview)
  - [Quiz & Spaced Repetition](https://docs.getrecall.ai/docs/features/quiz-and-spaced-repetition)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Problem Statement
- Stage 147 materially calmed Graph by narrowing the left selector strip, trimming the default quick-pick stack, and slimming the selected-node detail dock.
- The next step should be a benchmark audit, not another immediate implementation pass, because the remaining top-level blocker may now have narrowed further within Graph or shifted back to another surface.
- The audit should preserve the calmer Home, Study, and focused-study baselines unless the fresh captures show a different top-level mismatch.

## Goals
- Review fresh Stage 147 Home, Graph, Study, and focused-Study artifacts side by side with the benchmark direction.
- Confirm whether Graph still leads the mismatch list after the selector-rail-narrowing and detail-dock-slimming pass.
- Open the next bounded stage using screenshot evidence and keep the roadmap/docs aligned with that decision.

## Non-Goals
- Do not widen into backend, storage, or non-UI work.
- Do not assume another Graph follow-up before reviewing the fresh artifacts.
- Do not start the next implementation slice inside this audit plan.

## Inputs
- `scripts/playwright/stage147_graph_selector_rail_narrowing_edge.mjs`
- `scripts/playwright/stage148_post_stage147_benchmark_audit_edge.mjs`
- `output/playwright/stage147-home-landing-desktop.png`
- `output/playwright/stage147-graph-browse-desktop.png`
- `output/playwright/stage147-study-browse-desktop.png`
- `output/playwright/stage147-focused-study-desktop.png`
- `output/playwright/stage147-graph-selector-rail-narrowing-validation.json`

## Implementation Targets
- `docs/exec_plans/completed/2026-03-16_stage148_post_stage147_benchmark_audit.md`
- `docs/ROADMAP.md`
- `docs/ROADMAP_ANCHOR.md`
- `docs/assistant/APP_KNOWLEDGE.md`
- `docs/assistant/manifest.json`
- `docs/ux/recall_benchmark_matrix.md`
- `agent.md`
- `scripts/playwright/stage148_post_stage147_benchmark_audit_edge.mjs`

## Validation
- `node scripts/playwright/stage148_post_stage147_benchmark_audit_edge.mjs`
- screenshot-led manual review of the fresh Home, Graph, Study, and focused-Study captures
- `Get-Content .\docs\assistant\manifest.json -Raw | ConvertFrom-Json | Out-Null`

## Exit Criteria
- Fresh post-Stage-147 captures are reviewed and the clearest remaining blocker is identified.
- The roadmap, benchmark matrix, and assistant handoff docs point at the correct next bounded slice.
- The audit stays benchmark-led and does not widen scope beyond the next slice selection.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.

## Findings
- Fresh Stage 148 captures confirm that Stage 147 materially calmed Graph:
  - the graph canvas now reads as the primary surface
  - the left selector rail is slimmer and no longer leads with stacked support chrome
  - the selected-node detail dock is narrower, so it feels more like edge support than a competing panel
- Graph still carries visible support framing on both sides, but it no longer appears to be the clearest benchmark blocker.
- Home now reads as the strongest remaining mismatch:
  - the split `Start here` plus nearby stack still feels like a staged opening cluster instead of one selective collection zone
  - the lower continuation still leaves too much empty canvas, with the reveal card parked off to the side instead of carrying the page downward
- Study and focused Study remain visually stable and lower-priority in the refreshed artifacts.

## Decision
- Close Stage 148 as complete.
- Open Stage 149 as `Recall Home Opening Cluster Compaction And Lower Canvas Fill`.
- Keep the next implementation slice bounded to Home landing pacing and lower-canvas continuity; do not reopen Graph, Study, or focused reader-led work unless a direct regression is uncovered.
