# ExecPlan: Stage 204 Post-Stage-203 Benchmark Audit

Status: active current audit after the Stage 203 Graph implementation pass.

## Summary
- Audit the fresh post-Stage-203 Home, Graph, Study, and focused-Study captures against the Recall benchmark direction.
- Verify whether the Graph canvas-bracketing reduction pass was enough to stop Graph from leading the mismatch list.
- Select the next bounded implementation slice from fresh screenshot evidence instead of assuming the next surface in advance.

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
- Stage 203 is intentionally bounded inside Graph browse mode because Stage 202 confirmed that Home no longer leads after the bundled landing-endpoint convergence pass.
- The next step after that Graph pass should be a benchmark audit, not another immediate implementation slice, so the roadmap stays evidence-led and only keeps iterating on Graph if the fresh artifacts prove it still leads.
- The audit should preserve the calmer Home landing, Study browse, and focused-study baselines unless the fresh captures show a different top-level mismatch.

## Goals
- Review fresh Stage 203 Home, Graph, Study, and focused-Study artifacts side by side with the benchmark direction.
- Confirm whether Graph still leads the mismatch list after the canvas-bracketing reduction pass.
- Decide whether the next bounded slice should remain Graph-only or shift back to another surface.
- Keep the roadmap and handoff docs aligned with that evidence-driven decision.

## Non-Goals
- Do not widen into backend, storage, or non-UI work.
- Do not assume another Graph follow-up before reviewing the fresh artifacts.
- Do not start the next implementation slice inside this audit plan.

## Inputs
- `scripts/playwright/stage203_graph_canvas_bracketing_reduction_edge.mjs`
- `scripts/playwright/stage204_post_stage203_benchmark_audit_edge.mjs`
- `output/playwright/stage203-home-landing-desktop.png`
- `output/playwright/stage203-graph-browse-desktop.png`
- `output/playwright/stage203-study-browse-desktop.png`
- `output/playwright/stage203-focused-study-desktop.png`
- `output/playwright/stage203-graph-canvas-bracketing-reduction-validation.json`

## Implementation Targets
- `docs/exec_plans/completed/2026-03-17_stage203_recall_graph_canvas_bracketing_reduction_and_detail_dock_softening.md`
- `docs/exec_plans/completed/2026-03-17_stage204_post_stage203_benchmark_audit.md`
- `docs/ROADMAP.md`
- `docs/ROADMAP_ANCHOR.md`
- `docs/assistant/APP_KNOWLEDGE.md`
- `docs/assistant/INDEX.md`
- `docs/assistant/manifest.json`
- `docs/ux/recall_benchmark_matrix.md`
- `agent.md`
- `scripts/playwright/stage204_post_stage203_benchmark_audit_edge.mjs`

## Validation
- `node scripts/playwright/stage204_post_stage203_benchmark_audit_edge.mjs`
- screenshot-led manual review of the fresh Home, Graph, Study, and focused-Study captures
- `wsl.exe bash -lc "command -v npx && echo npx:ok"`
- `Get-Content .\docs\assistant\manifest.json -Raw | ConvertFrom-Json | Out-Null`

## Exit Criteria
- Fresh post-Stage-203 captures are reviewed and the clearest remaining blocker is identified.
- The roadmap, benchmark matrix, and assistant handoff docs point at the correct next bounded slice.
- The audit stays benchmark-led and does not widen scope beyond the next slice selection.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.

## Outcome
- Stage 204 is complete.
- The fresh Stage 204 Home, Graph, Study, and focused-Study captures matched the Stage 203 artifacts exactly, so the audit rerun is stable and drift-free.
- Graph still leads more narrowly after Stage 203 because the left selector strip and the right selected-node dock still bracket the canvas like standing support columns.
- Home, Study, and focused Study stayed lower-priority in the fresh Stage 204 audit.
