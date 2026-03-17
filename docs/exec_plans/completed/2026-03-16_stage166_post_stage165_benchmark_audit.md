# ExecPlan: Stage 166 Post-Stage-165 Benchmark Audit

## Summary
- Audit the fresh post-Stage-165 Home, Graph, Study, and focused-Study captures against the Recall benchmark direction.
- Verify whether equalizing the first-row meta and merging the reveal footer utility was enough to stop Home from leading the mismatch list.
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
- Stage 165 materially calmed Home by removing the extra lead cue from the first visible row and by merging the reveal footer utility into one calmer continuation line.
- The next step should be a benchmark audit, not another immediate implementation pass, because the remaining top-level blocker may now have narrowed within Home again or shifted back to another surface.
- The audit should preserve the calmer Graph, Study, and focused-study baselines unless the fresh captures show a different top-level mismatch.

## Goals
- Review fresh Stage 165 Home, Graph, Study, and focused-Study artifacts side by side with the benchmark direction.
- Confirm whether Home still leads the mismatch list after the lead-row-meta-equalization and reveal-footer-utility-merge pass.
- Open the next bounded stage using screenshot evidence and keep the roadmap/docs aligned with that decision.

## Non-Goals
- Do not widen into backend, storage, or non-UI work.
- Do not assume another Home follow-up before reviewing the fresh artifacts.
- Do not start the next implementation slice inside this audit plan.

## Inputs
- `scripts/playwright/stage165_home_lead_row_meta_equalization_edge.mjs`
- `scripts/playwright/stage166_post_stage165_benchmark_audit_edge.mjs`
- `output/playwright/stage165-home-landing-desktop.png`
- `output/playwright/stage165-graph-browse-desktop.png`
- `output/playwright/stage165-study-browse-desktop.png`
- `output/playwright/stage165-focused-study-desktop.png`
- `output/playwright/stage165-home-lead-row-meta-equalization-validation.json`

## Implementation Targets
- `docs/exec_plans/completed/2026-03-16_stage165_recall_home_lead_row_meta_equalization_and_reveal_footer_utility_merge.md`
- `docs/exec_plans/active/2026-03-16_stage166_post_stage165_benchmark_audit.md`
- `docs/ROADMAP.md`
- `docs/ROADMAP_ANCHOR.md`
- `docs/assistant/APP_KNOWLEDGE.md`
- `docs/assistant/INDEX.md`
- `docs/assistant/manifest.json`
- `docs/ux/recall_benchmark_matrix.md`
- `agent.md`
- `scripts/playwright/stage166_post_stage165_benchmark_audit_edge.mjs`

## Validation
- `node scripts/playwright/stage166_post_stage165_benchmark_audit_edge.mjs`
- screenshot-led manual review of the fresh Home, Graph, Study, and focused-Study captures
- `wsl.exe bash -lc "command -v npx && echo npx:ok"`
- `Get-Content .\docs\assistant\manifest.json -Raw | ConvertFrom-Json | Out-Null`

## Exit Criteria
- Fresh post-Stage-165 captures are reviewed and the clearest remaining blocker is identified.
- The roadmap, benchmark matrix, and assistant handoff docs point at the correct next bounded slice.
- The audit stays benchmark-led and does not widen scope beyond the next slice selection.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.

## Outcome
- The Stage 166 audit reran the fresh Home, Graph, Study, and focused-Study captures and matched the validated Stage 165 artifacts without drift.
- Home still leads the remaining mismatch list, but more narrowly, because the landing still ends too soon after the first visible rows and leaves too much empty lower canvas relative to the Recall benchmark direction.
- Graph, Study, and focused Study stayed visually stable and lower-priority, so the next bounded slice remains a Home-only follow-up rather than a renewed multi-surface pass.
