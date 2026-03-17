# ExecPlan: Stage 208 Post-Stage-207 Benchmark Audit

Status: completed after the Stage 208 benchmark audit closed and the next Graph slice was selected.

## Summary
- Audit the fresh post-Stage-207 Home, Graph, Study, and focused-Study captures against the Recall benchmark direction.
- Verify whether the Graph selector-strip header collapse and detail-dock header demotion pass was enough to stop Graph from leading the mismatch list.
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
- Stage 207 is intentionally bounded inside Graph browse mode because Stage 206 confirmed that Graph still leads after the Stage 205 pass.
- The next step after that Graph pass should be a benchmark audit, not another immediate implementation slice, so the roadmap stays evidence-led and only keeps iterating on Graph if the fresh artifacts prove it still leads.
- The audit should preserve the calmer Home landing, Study browse, and focused-study baselines unless the fresh captures show a different top-level mismatch.

## Goals
- Review fresh Stage 207 Home, Graph, Study, and focused-Study artifacts side by side with the benchmark direction.
- Confirm whether Graph still leads the mismatch list after the selector-strip header collapse and detail-dock header demotion pass.
- Decide whether the next bounded slice should remain Graph-only or shift back to another surface.
- Keep the roadmap and handoff docs aligned with that evidence-driven decision.

## Non-Goals
- Do not widen into backend, storage, or non-UI work.
- Do not assume another Graph follow-up before reviewing the fresh artifacts.
- Do not start the next implementation slice inside this audit plan.

## Inputs
- `scripts/playwright/stage207_graph_selector_strip_header_collapse_edge.mjs`
- `scripts/playwright/stage208_post_stage207_benchmark_audit_edge.mjs`
- `output/playwright/stage207-home-landing-desktop.png`
- `output/playwright/stage207-graph-browse-desktop.png`
- `output/playwright/stage207-study-browse-desktop.png`
- `output/playwright/stage207-focused-study-desktop.png`

## Implementation Targets
- `docs/exec_plans/completed/2026-03-17_stage207_recall_graph_selector_strip_header_collapse_and_detail_dock_header_demotion.md`
- `docs/exec_plans/completed/2026-03-17_stage208_post_stage207_benchmark_audit.md`
- `docs/ROADMAP.md`
- `docs/ROADMAP_ANCHOR.md`
- `docs/assistant/APP_KNOWLEDGE.md`
- `docs/assistant/INDEX.md`
- `docs/assistant/manifest.json`
- `docs/ux/recall_benchmark_matrix.md`
- `agent.md`
- `scripts/playwright/stage208_post_stage207_benchmark_audit_edge.mjs`

## Validation
- `node scripts/playwright/stage208_post_stage207_benchmark_audit_edge.mjs`
- screenshot-led manual review of the fresh Home, Graph, Study, and focused-Study captures
- `wsl.exe bash -lc "command -v npx && echo npx:ok"`
- `Get-Content .\docs\assistant\manifest.json -Raw | ConvertFrom-Json | Out-Null`

## Exit Criteria
- Fresh post-Stage-207 captures are reviewed and the clearest remaining blocker is identified.
- The roadmap, benchmark matrix, and assistant handoff docs point at the correct next bounded slice.
- The audit stays benchmark-led and does not widen scope beyond the next slice selection.

## Outcome
- Stage 208 reran cleanly and matched the full Stage 207 capture set without drift, so the audit finding is stable.
- Graph still leads after Stage 207 because the browse canvas is still visibly bracketed by the open selector strip on the left and the default selected-node peek on the right.
- Home, Study, and focused Study remain lower-priority and stable, so the next bounded slice stays on Graph as Stage 209.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
