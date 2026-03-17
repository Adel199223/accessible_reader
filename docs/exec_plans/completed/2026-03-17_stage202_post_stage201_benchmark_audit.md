# ExecPlan: Stage 202 Post-Stage-201 Benchmark Audit

Status: active current audit after the Stage 201 bundled Home implementation pass.

## Summary
- Audit the fresh post-Stage-201 Home, Graph, Study, and focused-Study captures against the Recall benchmark direction.
- Verify whether the bundled Home landing-endpoint convergence pass was enough to stop Home from leading the mismatch list.
- Select the next bounded implementation slice from fresh screenshot evidence instead of reopening cross-surface work prematurely.

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
- Stage 201 is intentionally broader than the recent one-tweak Home passes because Home has remained the dominant blocker across repeated audits and the remaining mismatch is localized to the landing endpoint.
- The next step after that bundle should be a benchmark audit, not another immediate implementation pass, so the roadmap stays evidence-led and only switches surfaces if the lead blocker truly changes.
- The audit should preserve the calmer Graph, Study, and focused-study baselines unless the fresh captures show a different top-level mismatch.

## Goals
- Review fresh Stage 201 Home, Graph, Study, and focused-Study artifacts side by side with the benchmark direction.
- Confirm whether Home still leads the mismatch list after the bundled landing-endpoint convergence pass.
- Decide whether the next bounded slice should remain Home-only or finally shift to another surface.
- Keep the roadmap/docs aligned with that evidence-driven decision.

## Non-Goals
- Do not widen into backend, storage, or non-UI work.
- Do not assume another Home follow-up before reviewing the fresh artifacts.
- Do not start the next implementation slice inside this audit plan.

## Inputs
- `scripts/playwright/stage201_home_landing_endpoint_convergence_bundle_edge.mjs`
- `scripts/playwright/stage202_post_stage201_benchmark_audit_edge.mjs`
- `output/playwright/stage201-home-landing-desktop.png`
- `output/playwright/stage201-graph-browse-desktop.png`
- `output/playwright/stage201-study-browse-desktop.png`
- `output/playwright/stage201-focused-study-desktop.png`
- `output/playwright/stage201-home-landing-endpoint-convergence-bundle-validation.json`

## Implementation Targets
- `docs/exec_plans/completed/2026-03-17_stage201_recall_home_landing_endpoint_convergence_bundle.md`
- `docs/exec_plans/completed/2026-03-17_stage202_post_stage201_benchmark_audit.md`
- `docs/ROADMAP.md`
- `docs/ROADMAP_ANCHOR.md`
- `docs/assistant/APP_KNOWLEDGE.md`
- `docs/assistant/INDEX.md`
- `docs/assistant/manifest.json`
- `docs/ux/recall_benchmark_matrix.md`
- `agent.md`
- `scripts/playwright/stage202_post_stage201_benchmark_audit_edge.mjs`

## Validation
- `node scripts/playwright/stage202_post_stage201_benchmark_audit_edge.mjs`
- screenshot-led manual review of the fresh Home, Graph, Study, and focused-Study captures
- `wsl.exe bash -lc "command -v npx && echo npx:ok"`
- `Get-Content .\docs\assistant\manifest.json -Raw | ConvertFrom-Json | Out-Null`

## Exit Criteria
- Fresh post-Stage-201 captures are reviewed and the clearest remaining blocker is identified.
- The roadmap, benchmark matrix, and assistant handoff docs point at the correct next bounded slice.
- The audit stays benchmark-led and does not widen scope beyond the next slice selection.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.

## Outcome
- Stage 202 is complete.
- The fresh Stage 202 audit matched the Stage 201 Home and focused-Study captures exactly.
- Graph and Study rerendered in the Stage 202 capture set, but visual review confirmed no material drift in either surface.
- Home no longer leads after the bundled Stage 201 landing-endpoint convergence pass.
- Graph is now the clearest remaining mismatch because the left selector rail and the right detail dock still bracket the canvas more heavily than the Recall benchmark direction.
- The next bounded implementation slice is Stage 203 `Recall Graph Canvas Bracketing Reduction And Detail Dock Softening`.
