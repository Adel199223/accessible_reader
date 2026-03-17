# ExecPlan: Stage 194 Post-Stage-193 Benchmark Audit

## Summary
- Audit the fresh post-Stage-193 Home, Graph, Study, and focused-Study captures against the Recall benchmark direction.
- Verify whether carrying the visible Home continuation farther and delaying the reveal footer was enough to stop Home from leading the mismatch list.
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
- Stage 193 materially calmed Home again by carrying the visible continuation farther through the landing tail and by delaying the reveal footer.
- The next step should be a benchmark audit, not another immediate implementation pass, because the remaining top-level blocker may now have narrowed again within Home or shifted back to another surface.
- The audit should preserve the calmer Graph, Study, and focused-study baselines unless the fresh captures show a different top-level mismatch.

## Goals
- Review fresh Stage 193 Home, Graph, Study, and focused-Study artifacts side by side with the benchmark direction.
- Confirm whether Home still leads the mismatch list after the tail-carry-extension and reveal-footer-delay pass.
- Open the next bounded stage using screenshot evidence and keep the roadmap/docs aligned with that decision.

## Non-Goals
- Do not widen into backend, storage, or non-UI work.
- Do not assume another Home follow-up before reviewing the fresh artifacts.
- Do not start the next implementation slice inside this audit plan.

## Inputs
- `scripts/playwright/stage193_home_tail_carry_extension_edge.mjs`
- `scripts/playwright/stage194_post_stage193_benchmark_audit_edge.mjs`
- `output/playwright/stage193-home-landing-desktop.png`
- `output/playwright/stage193-graph-browse-desktop.png`
- `output/playwright/stage193-study-browse-desktop.png`
- `output/playwright/stage193-focused-study-desktop.png`
- `output/playwright/stage193-home-tail-carry-extension-validation.json`

## Implementation Targets
- `docs/exec_plans/completed/2026-03-17_stage193_recall_home_tail_carry_extension_and_reveal_footer_delay.md`
- `docs/exec_plans/completed/2026-03-17_stage194_post_stage193_benchmark_audit.md`
- `docs/ROADMAP.md`
- `docs/ROADMAP_ANCHOR.md`
- `docs/assistant/APP_KNOWLEDGE.md`
- `docs/assistant/INDEX.md`
- `docs/assistant/manifest.json`
- `docs/ux/recall_benchmark_matrix.md`
- `agent.md`
- `scripts/playwright/stage194_post_stage193_benchmark_audit_edge.mjs`

## Validation
- `node scripts/playwright/stage194_post_stage193_benchmark_audit_edge.mjs`
- screenshot-led manual review of the fresh Home, Graph, Study, and focused-Study captures
- `wsl.exe bash -lc "command -v npx && echo npx:ok"`
- `Get-Content .\docs\assistant\manifest.json -Raw | ConvertFrom-Json | Out-Null`

## Exit Criteria
- Fresh post-Stage-193 captures are reviewed and the clearest remaining blocker is identified.
- The roadmap, benchmark matrix, and assistant handoff docs point at the correct next bounded slice.
- The audit stays benchmark-led and does not widen scope beyond the next slice selection.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.

## Outcome
- Stage 194 reran the fresh Home, Graph, Study, and focused-Study captures after the Stage 193 tail-carry-extension and reveal-footer-delay pass.
- The rerun matched the validated Stage 193 artifacts without drift, so the remaining mismatch is stable.
- Home still leads more narrowly because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas, while Graph, Study, and focused Study stayed lower-priority.
- The next step is a bounded Home tail-density-lift and reveal-footer-pushdown pass rather than a surface shift or broader rewrite.
