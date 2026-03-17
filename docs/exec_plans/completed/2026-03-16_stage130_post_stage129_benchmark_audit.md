# ExecPlan: Stage 130 Post-Stage-129 Benchmark Audit

## Summary
- Audit the fresh post-Stage-129 Home, Graph, Study, and focused-Study captures against the Recall benchmark direction.
- Verify whether flattening the Home collection frame and demoting repeated row meta was enough to stop Home from leading the remaining mismatch list.
- Select the next bounded implementation slice from fresh screenshot evidence instead of continuing to iterate on Home by assumption.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / saved-source landing
  - Spaced repetition / review
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Release: 22 August 2024 // UI Improvements](https://feedback.getrecall.ai/changelog/release-22-august-2024-ui-improvements)
  - [Quiz & Spaced Repetition](https://docs.getrecall.ai/docs/features/quiz-and-spaced-repetition)
  - [Release: 29 November 2024 // Recall Review Reminders](https://feedback.getrecall.ai/changelog/release-29-november-2024-recall-review-reminders)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Problem Statement
- Stage 129 materially calmed Home by flattening the browse-mode collection frame and demoting repeated row labels, timestamps, and supporting meta.
- The next step should be a benchmark audit, not another immediate implementation pass, because the remaining top-level blocker may now have shifted back to Study or another surface.
- The audit should preserve the deferred narrow-width rail/top-grid regression as a later bounded pass unless the fresh captures show it becoming the main blocker.

## Goals
- Review fresh Stage 129 Home, Graph, Study, and focused-Study artifacts side by side with the benchmark direction.
- Confirm whether Home still leads the mismatch list after the collection-frame flattening and row-meta demotion pass.
- Open the next bounded stage using screenshot evidence and keep the roadmap/docs aligned with that decision.

## Non-Goals
- Do not widen into backend, storage, or non-UI work.
- Do not reopen the deferred narrow-width responsive shell regression unless the fresh audit proves it is now the highest-leverage blocker.
- Do not start the next implementation slice inside this audit plan.

## Inputs
- `scripts/playwright/stage129_home_collection_frame_flattening_edge.mjs`
- `scripts/playwright/stage130_post_stage129_benchmark_audit_edge.mjs`
- `output/playwright/stage129-home-landing-desktop.png`
- `output/playwright/stage129-graph-browse-desktop.png`
- `output/playwright/stage129-study-browse-desktop.png`
- `output/playwright/stage129-focused-study-desktop.png`
- `output/playwright/stage129-home-collection-frame-flattening-validation.json`

## Implementation Targets
- `docs/exec_plans/active/2026-03-16_stage130_post_stage129_benchmark_audit.md`
- `docs/ROADMAP.md`
- `docs/ROADMAP_ANCHOR.md`
- `docs/assistant/APP_KNOWLEDGE.md`
- `docs/assistant/manifest.json`
- `docs/ux/recall_benchmark_matrix.md`
- `scripts/playwright/stage130_post_stage129_benchmark_audit_edge.mjs`

## Validation
- `node scripts/playwright/stage130_post_stage129_benchmark_audit_edge.mjs`
- screenshot-led manual review of the fresh Home, Graph, Study, and focused-Study captures
- `Get-Content .\docs\assistant\manifest.json -Raw | ConvertFrom-Json | Out-Null`

## Findings
- Home:
  - Home still leads the remaining mismatch list after Stage 129.
  - The calmer row styling helped, but the landing still reads as one full-width boxed ledger rather than a lighter collection zone.
  - The persistent right-side date gutter and long horizontal row runs still pull attention away from titles and previews more than the benchmark direction wants.
- Study:
  - Study stayed stable and remains lower priority than Home.
  - The browse-mode review card still reads as one guided task rather than a dashboard panel.
- Graph:
  - Graph stayed stable and remains a lower-priority mismatch.
- Focused regression:
  - Focused Study preserved the reader-led split and stayed stable during the audit.

## Decision
- Stage 130 is complete.
- Stage 131 should be `Recall Home Collection Unboxing And Date Gutter Collapse`.
- Stage 131 should stay tightly bounded to Home browse mode: reduce the remaining full-width panel feel, collapse the strong right-side date gutter into lighter inline meta, and preserve the calmer Study, Graph, focused Study, and deferred narrow-width shell baseline.

## Exit Criteria
- Fresh post-Stage-129 captures are reviewed and the clearest remaining blocker is identified.
- The roadmap, benchmark matrix, and assistant handoff docs point at the correct next bounded slice.
- The audit stays benchmark-led and does not widen scope beyond the next slice selection.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
