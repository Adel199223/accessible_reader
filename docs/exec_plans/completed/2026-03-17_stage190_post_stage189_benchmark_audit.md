# ExecPlan: Stage 190 Post-Stage-189 Benchmark Audit

## Summary
- Audit the fresh post-Stage-189 Home, Graph, Study, and focused-Study captures against the Recall benchmark direction.
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
- Stage 189 materially calmed Home again by carrying the visible continuation farther through the landing tail and by delaying the reveal footer.
- The next step should be a benchmark audit, not another immediate implementation pass, because the remaining top-level blocker may now have narrowed again within Home or shifted back to another surface.
- The audit should preserve the calmer Graph, Study, and focused-study baselines unless the fresh captures show a different top-level mismatch.

## Goals
- Review fresh Stage 189 Home, Graph, Study, and focused-Study artifacts side by side with the benchmark direction.
- Confirm whether Home still leads the mismatch list after the tail-carry-extension and reveal-footer-delay pass.
- Open the next bounded stage using screenshot evidence and keep the roadmap/docs aligned with that decision.

## Non-Goals
- Do not widen into backend, storage, or non-UI work.
- Do not assume another Home follow-up before reviewing the fresh artifacts.
- Do not start the next implementation slice inside this audit plan.

## Inputs
- `scripts/playwright/stage189_home_tail_carry_extension_edge.mjs`
- `scripts/playwright/stage190_post_stage189_benchmark_audit_edge.mjs`
- `output/playwright/stage189-home-landing-desktop.png`
- `output/playwright/stage189-graph-browse-desktop.png`
- `output/playwright/stage189-study-browse-desktop.png`
- `output/playwright/stage189-focused-study-desktop.png`
- `output/playwright/stage189-home-tail-carry-extension-validation.json`

## Implementation Targets
- `docs/exec_plans/completed/2026-03-17_stage189_recall_home_tail_carry_extension_and_reveal_footer_delay.md`
- `docs/exec_plans/completed/2026-03-17_stage190_post_stage189_benchmark_audit.md`
- `docs/ROADMAP.md`
- `docs/ROADMAP_ANCHOR.md`
- `docs/assistant/APP_KNOWLEDGE.md`
- `docs/assistant/INDEX.md`
- `docs/assistant/manifest.json`
- `docs/ux/recall_benchmark_matrix.md`
- `agent.md`
- `scripts/playwright/stage190_post_stage189_benchmark_audit_edge.mjs`

## Validation
- `node scripts/playwright/stage190_post_stage189_benchmark_audit_edge.mjs`
- screenshot-led manual review of the fresh Home, Graph, Study, and focused-Study captures
- `wsl.exe bash -lc "command -v npx && echo npx:ok"`
- `Get-Content .\docs\assistant\manifest.json -Raw | ConvertFrom-Json | Out-Null`

## Exit Criteria
- Fresh post-Stage-189 captures are reviewed and the clearest remaining blocker is identified.
- The roadmap, benchmark matrix, and assistant handoff docs point at the correct next bounded slice.
- The audit stays benchmark-led and does not widen scope beyond the next slice selection.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.

## Outcome
- The Stage 190 audit reran the fresh Home, Graph, Study, and focused-Study captures and matched the validated Stage 189 artifacts without drift.
- Home still leads the remaining mismatch list, but more narrowly, because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas.
- Graph, Study, and focused Study stayed visually stable and lower-priority, so the next bounded slice remains a Home-only follow-up rather than a renewed multi-surface pass.
