# ExecPlan: Stage 168 Post-Stage-167 Benchmark Audit

## Summary
- Audit the fresh post-Stage-167 Home, Graph, Study, and focused-Study captures against the Recall benchmark direction.
- Verify whether extending the visible continuation and filling more of the lower Home canvas was enough to stop Home from leading the mismatch list.
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
- Stage 167 materially calmed Home by extending the visible continuation before the reveal row and by carrying the landing farther down the page.
- The next step should be a benchmark audit, not another immediate implementation pass, because the remaining top-level blocker may now have narrowed again within Home or shifted back to another surface.
- The audit should preserve the calmer Graph, Study, and focused-study baselines unless the fresh captures show a different top-level mismatch.

## Goals
- Review fresh Stage 167 Home, Graph, Study, and focused-Study artifacts side by side with the benchmark direction.
- Confirm whether Home still leads the mismatch list after the visible-continuation-extension and lower-canvas-fill pass.
- Open the next bounded stage using screenshot evidence and keep the roadmap/docs aligned with that decision.

## Non-Goals
- Do not widen into backend, storage, or non-UI work.
- Do not assume another Home follow-up before reviewing the fresh artifacts.
- Do not start the next implementation slice inside this audit plan.

## Inputs
- `scripts/playwright/stage167_home_visible_continuation_extension_edge.mjs`
- `scripts/playwright/stage168_post_stage167_benchmark_audit_edge.mjs`
- `output/playwright/stage167-home-landing-desktop.png`
- `output/playwright/stage167-graph-browse-desktop.png`
- `output/playwright/stage167-study-browse-desktop.png`
- `output/playwright/stage167-focused-study-desktop.png`
- `output/playwright/stage167-home-visible-continuation-extension-validation.json`

## Implementation Targets
- `docs/exec_plans/completed/2026-03-16_stage167_recall_home_visible_continuation_extension_and_lower_canvas_fill.md`
- `docs/exec_plans/active/2026-03-16_stage168_post_stage167_benchmark_audit.md`
- `docs/ROADMAP.md`
- `docs/ROADMAP_ANCHOR.md`
- `docs/assistant/APP_KNOWLEDGE.md`
- `docs/assistant/INDEX.md`
- `docs/assistant/manifest.json`
- `docs/ux/recall_benchmark_matrix.md`
- `agent.md`
- `scripts/playwright/stage168_post_stage167_benchmark_audit_edge.mjs`

## Validation
- `node scripts/playwright/stage168_post_stage167_benchmark_audit_edge.mjs`
- screenshot-led manual review of the fresh Home, Graph, Study, and focused-Study captures
- `wsl.exe bash -lc "command -v npx && echo npx:ok"`
- `Get-Content .\docs\assistant\manifest.json -Raw | ConvertFrom-Json | Out-Null`

## Exit Criteria
- Fresh post-Stage-167 captures are reviewed and the clearest remaining blocker is identified.
- The roadmap, benchmark matrix, and assistant handoff docs point at the correct next bounded slice.
- The audit stays benchmark-led and does not widen scope beyond the next slice selection.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.

## Outcome
- The Stage 168 audit reran the fresh Home, Graph, Study, and focused-Study captures and matched the validated Stage 167 artifacts without drift.
- Home still leads the remaining mismatch list, but more narrowly, because the reveal row still arrives too early and the landing still leaves too much empty lower canvas after the visible continuation.
- Graph, Study, and focused Study stayed visually stable and lower-priority, so the next bounded slice remains a Home-only follow-up rather than a renewed multi-surface pass.
