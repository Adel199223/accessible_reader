# ExecPlan: Stage 206 Post-Stage-205 Benchmark Audit

Status: active current audit after the Stage 205 Graph implementation pass.

## Summary
- Audit the fresh post-Stage-205 Home, Graph, Study, and focused-Study captures against the Recall benchmark direction.
- Verify whether the Graph selector-strip collapse and detail-peek deflation pass was enough to stop Graph from leading the mismatch list.
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
- Stage 205 is intentionally bounded inside Graph browse mode because Stage 204 confirmed that Graph still leads after the Stage 203 pass.
- The next step after that Graph pass should be a benchmark audit, not another immediate implementation slice, so the roadmap stays evidence-led and only keeps iterating on Graph if the fresh artifacts prove it still leads.
- The audit should preserve the calmer Home landing, Study browse, and focused-study baselines unless the fresh captures show a different top-level mismatch.

## Goals
- Review fresh Stage 205 Home, Graph, Study, and focused-Study artifacts side by side with the benchmark direction.
- Confirm whether Graph still leads the mismatch list after the selector-strip collapse and detail-peek deflation pass.
- Decide whether the next bounded slice should remain Graph-only or shift back to another surface.
- Keep the roadmap and handoff docs aligned with that evidence-driven decision.

## Non-Goals
- Do not widen into backend, storage, or non-UI work.
- Do not assume another Graph follow-up before reviewing the fresh artifacts.
- Do not start the next implementation slice inside this audit plan.

## Inputs
- `scripts/playwright/stage205_graph_selector_strip_collapse_edge.mjs`
- `scripts/playwright/stage206_post_stage205_benchmark_audit_edge.mjs`
- `output/playwright/stage205-home-landing-desktop.png`
- `output/playwright/stage205-graph-browse-desktop.png`
- `output/playwright/stage205-study-browse-desktop.png`
- `output/playwright/stage205-focused-study-desktop.png`

## Implementation Targets
- `docs/exec_plans/completed/2026-03-17_stage205_recall_graph_selector_strip_collapse_and_detail_peek_deflation.md`
- `docs/exec_plans/completed/2026-03-17_stage206_post_stage205_benchmark_audit.md`
- `docs/ROADMAP.md`
- `docs/ROADMAP_ANCHOR.md`
- `docs/assistant/APP_KNOWLEDGE.md`
- `docs/assistant/INDEX.md`
- `docs/assistant/manifest.json`
- `docs/ux/recall_benchmark_matrix.md`
- `agent.md`
- `scripts/playwright/stage206_post_stage205_benchmark_audit_edge.mjs`

## Validation
- `node scripts/playwright/stage206_post_stage205_benchmark_audit_edge.mjs`
- screenshot-led manual review of the fresh Home, Graph, Study, and focused-Study captures
- `wsl.exe bash -lc "command -v npx && echo npx:ok"`
- `Get-Content .\docs\assistant\manifest.json -Raw | ConvertFrom-Json | Out-Null`

## Exit Criteria
- Fresh post-Stage-205 captures are reviewed and the clearest remaining blocker is identified.
- The roadmap, benchmark matrix, and assistant handoff docs point at the correct next bounded slice.
- The audit stays benchmark-led and does not widen scope beyond the next slice selection.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.

## Outcome
- Stage 206 is complete.
- Home, Study, and focused Study matched the Stage 205 artifacts exactly, so those surfaces remain stable and lower-priority in the rerun.
- Graph rerendered in the fresh Stage 206 capture without material visual drift on manual review.
- Graph still leads more narrowly after Stage 205 because the selector strip still reads like a standing utility column and the default selected-node dock still opens with more header/meta framing than the benchmark direction wants.
