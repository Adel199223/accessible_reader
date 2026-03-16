# ExecPlan: Stage 128 Post-Stage-127 Benchmark Audit

## Summary
- Audit the fresh post-Stage-127 Home, Graph, Study, and focused-Study captures against the current Recall benchmark direction.
- Verify whether removing the ghost top strip and lifting the browse-mode review card was enough to stop Study from leading the remaining mismatch list.
- Select the next bounded implementation slice from screenshot evidence instead of guessing from stale pre-Stage-127 assumptions.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / saved-source landing
  - Spaced repetition / review
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Quiz & Spaced Repetition](https://docs.getrecall.ai/docs/features/quiz-and-spaced-repetition)
  - [Release: 29 November 2024 // Recall Review Reminders](https://feedback.getrecall.ai/changelog/release-29-november-2024-recall-review-reminders)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Problem Statement
- Stage 127 materially calmed Study by removing the ghost top strip and lifting the review task higher into the browse canvas.
- The next step should be a benchmark audit, not another immediate implementation pass, because the remaining top-level blocker may now have shifted back to Home or another surface.
- The audit should preserve the deferred narrow-width rail/top-grid regression as a later bounded pass unless the fresh captures show it becoming the main blocker.

## Goals
- Review fresh Stage 127 Home, Graph, Study, and focused-Study artifacts side by side with the benchmark direction.
- Confirm whether Study still leads the mismatch list after the top-strip removal.
- Open the next bounded stage using screenshot evidence and keep the roadmap/docs aligned with that decision.

## Non-Goals
- Do not widen into backend, storage, or non-UI work.
- Do not reopen the deferred narrow-width responsive shell regression unless the fresh audit proves it is now the highest-leverage blocker.
- Do not start the next implementation slice inside this audit plan.

## Inputs
- `scripts/playwright/stage127_study_support_strip_removal_edge.mjs`
- `scripts/playwright/stage128_post_stage127_benchmark_audit_edge.mjs`
- `output/playwright/stage127-home-landing-desktop.png`
- `output/playwright/stage127-graph-browse-desktop.png`
- `output/playwright/stage127-study-browse-desktop.png`
- `output/playwright/stage127-focused-study-desktop.png`
- `output/playwright/stage127-study-support-strip-removal-validation.json`

## Implementation Targets
- `docs/exec_plans/active/2026-03-16_stage128_post_stage127_benchmark_audit.md`
- `docs/ROADMAP.md`
- `docs/ROADMAP_ANCHOR.md`
- `docs/assistant/APP_KNOWLEDGE.md`
- `docs/assistant/manifest.json`
- `docs/ux/recall_benchmark_matrix.md`
- `scripts/playwright/stage128_post_stage127_benchmark_audit_edge.mjs`

## Validation
- `node scripts/playwright/stage128_post_stage127_benchmark_audit_edge.mjs`
- screenshot-led manual review of the fresh Home, Graph, Study, and focused-Study captures
- `Get-Content .\docs\assistant\manifest.json -Raw | ConvertFrom-Json | Out-Null`

## Exit Criteria
- Fresh post-Stage-127 captures are reviewed and the clearest remaining blocker is identified.
- The roadmap, benchmark matrix, and assistant handoff docs point at the correct next bounded slice.
- The audit stays benchmark-led and does not widen scope beyond the next slice selection.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
