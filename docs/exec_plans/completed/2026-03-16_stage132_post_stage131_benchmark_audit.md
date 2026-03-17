# ExecPlan: Stage 132 Post-Stage-131 Benchmark Audit

## Summary
- Audit the fresh post-Stage-131 Home, Graph, Study, and focused-Study captures against the Recall benchmark direction.
- Verify whether unboxing the Home collection shell and collapsing the date gutter was enough to stop Home from leading the remaining mismatch list.
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
- Stage 131 materially calmed Home by removing the remaining outer collection shell and collapsing the right-side date gutter into inline row meta.
- The next step should be a benchmark audit, not another immediate implementation pass, because the remaining top-level blocker may now have shifted away from Home or narrowed further within Home.
- The audit should preserve the deferred narrow-width rail/top-grid regression as a later bounded pass unless the fresh captures show it becoming the main blocker.

## Goals
- Review fresh Stage 131 Home, Graph, Study, and focused-Study artifacts side by side with the benchmark direction.
- Confirm whether Home still leads the mismatch list after the collection unboxing and inline date-meta pass.
- Open the next bounded stage using screenshot evidence and keep the roadmap/docs aligned with that decision.

## Non-Goals
- Do not widen into backend, storage, or non-UI work.
- Do not reopen the deferred narrow-width responsive shell regression unless the fresh audit proves it is now the highest-leverage blocker.
- Do not start the next implementation slice inside this audit plan.

## Inputs
- `scripts/playwright/stage131_home_collection_unboxing_edge.mjs`
- `scripts/playwright/stage132_post_stage131_benchmark_audit_edge.mjs`
- `output/playwright/stage131-home-landing-desktop.png`
- `output/playwright/stage131-graph-browse-desktop.png`
- `output/playwright/stage131-study-browse-desktop.png`
- `output/playwright/stage131-focused-study-desktop.png`
- `output/playwright/stage131-home-collection-unboxing-validation.json`

## Implementation Targets
- `docs/exec_plans/active/2026-03-16_stage132_post_stage131_benchmark_audit.md`
- `docs/ROADMAP.md`
- `docs/ROADMAP_ANCHOR.md`
- `docs/assistant/APP_KNOWLEDGE.md`
- `docs/assistant/manifest.json`
- `docs/ux/recall_benchmark_matrix.md`
- `scripts/playwright/stage132_post_stage131_benchmark_audit_edge.mjs`

## Validation
- `node scripts/playwright/stage132_post_stage131_benchmark_audit_edge.mjs`
- screenshot-led manual review of the fresh Home, Graph, Study, and focused-Study captures
- `Get-Content .\docs\assistant\manifest.json -Raw | ConvertFrom-Json | Out-Null`

## Findings
- Home:
  - Home is materially closer after Stage 131 and no longer leads the mismatch list.
  - Removing the outer ledger shell and collapsing the date gutter made the landing read like an open collection zone instead of one boxed archive frame.
  - Some remaining sparsity and wide-row behavior still exist, but they are now secondary compared with Graph.
- Graph:
  - Graph now leads the remaining mismatch list.
  - The canvas itself is calmer than earlier stages, but the left support rail still consumes too much width and attention through stacked metrics, quick picks, and support cards.
  - The selected-node evidence overlay still reads too much like a boxed dashboard panel inside the main frame, which keeps the graph from feeling like the dominant surface the benchmark points toward.
- Study:
  - Study stayed stable and remains lower priority than Graph.
  - The browse-mode review card still reads as one guided task with restrained support chrome.
- Focused regression:
  - Focused Study preserved the reader-led split and stayed stable during the audit.

## Decision
- Stage 132 is complete.
- Stage 133 should be `Recall Graph Support Rail Collapse And Detail Overlay Compaction`.
- Stage 133 should stay tightly bounded to Graph browse mode: collapse the left support rail into a lighter utility layer, let the graph canvas reclaim more width, compact the selected-node overlay so it behaves like secondary evidence support, and preserve the calmer Home, Study, focused Study, and deferred narrow-width shell baseline.

## Exit Criteria
- Fresh post-Stage-131 captures are reviewed and the clearest remaining blocker is identified.
- The roadmap, benchmark matrix, and assistant handoff docs point at the correct next bounded slice.
- The audit stays benchmark-led and does not widen scope beyond the next slice selection.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
