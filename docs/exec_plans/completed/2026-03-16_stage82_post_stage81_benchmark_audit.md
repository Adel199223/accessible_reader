# ExecPlan: Stage 82 Post-Stage-81 Benchmark Audit

## Summary
- Audited the fresh post-Stage-81 Home, Graph, Study, and focused-Study captures against the benchmark matrix and the locked Recall references.
- Confirmed that Stage 81 materially improved Home enough that Home is no longer the clearest blocker.
- Identified Study as the clearest remaining benchmark mismatch again and selected one bounded Study follow-up from fresh evidence.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Add Content
  - Knowledge Graph
  - Spaced repetition / review
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Release: 22 August 2024 // UI Improvements](https://feedback.getrecall.ai/changelog/release-22-august-2024-ui-improvements)
  - [Release: 29 November 2024 // Recall Review Reminders](https://feedback.getrecall.ai/changelog/release-29-november-2024-recall-review-reminders)
  - [Recall Release Notes: Feb 19, 2026 - Quiz 2.0 with Shared Challenges](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-19-2026-quiz-20-with-shared-challenges)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Fresh Artifacts
- `scripts/playwright/stage82_post_stage81_benchmark_audit_edge.mjs`
- `output/playwright/stage82-home-landing-desktop.png`
- `output/playwright/stage82-graph-browse-desktop.png`
- `output/playwright/stage82-study-browse-desktop.png`
- `output/playwright/stage82-focused-study-desktop.png`
- `output/playwright/stage82-benchmark-audit-validation.json`

## Findings
- Home:
  - Stage 81 materially improved Home.
  - The featured band now reads as one compact reopen flow instead of a spotlight-plus-column split, and the landing no longer feels like the clearest blocker.
  - Home still has product-specific archive and utility structure, but it is no longer the highest-value next surface.
- Study:
  - Study is now the clearest remaining benchmark mismatch again.
  - Two gaps dominate the remaining mismatch:
    - the browse-mode `Session` rail still reads more like a persistent sidebar than like quiet review utility
    - the pre-answer `Grounded` row still frames the review card more heavily than the benchmark direction wants before reveal
  - Inference from the user-provided Study benchmark screenshots plus Recall’s broader review direction: the next pass should stay on Study and keep demoting session chrome rather than reopening Home immediately.
- Graph:
  - Graph stayed stable and remains a lower-mismatch surface.
  - The graph canvas still dominates enough that Graph does not deserve the next bounded slice.
- Focused regression:
  - Focused Study preserved the reader-led split and stayed stable during the audit.

## Decision
- Stage 82 is complete.
- Stage 83 should be `Recall Study Session Rail Utility Compression And Grounding Row Demotion`.
- Stage 83 should narrow the remaining Study mismatch by demoting the browse-mode session rail and compressing the pre-answer grounding row while preserving the calmer Home landing, Graph stability, and focused reader-led work.

## Validation
- `node scripts/playwright/stage82_post_stage81_benchmark_audit_edge.mjs`
- screenshot-led manual review against `docs/ux/recall_benchmark_matrix.md`, the user-provided Recall benchmark screenshots, and the official Recall docs/changelog sources above
- manifest JSON parse check

## Execution Note
- On this machine, the repo-owned Edge screenshot harness should continue to run through Windows `node` rather than WSL `node`, because WSL Playwright attempts to launch Linux `msedge`, which is not installed.
