# ExecPlan: Stage 80 Post-Stage-79 Benchmark Audit

## Summary
- Audited the fresh post-Stage-79 Home, Graph, Study, and focused-Study captures against the benchmark matrix and the locked Recall references.
- Confirmed that Stage 79 materially improved Study enough that Study is no longer the clearest blocker.
- Identified Home as the clearest remaining benchmark mismatch again and selected one bounded Home follow-up from fresh evidence.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Add Content
  - Knowledge Graph
  - Spaced repetition / review
- Official supporting Recall sources:
  - [Recall docs introduction](https://docs.getrecall.ai/docs/introduction)
  - [Release: 22 August 2024 // UI Improvements](https://feedback.getrecall.ai/changelog/release-22-august-2024-ui-improvements)
  - [Release: 29 November 2024 // Recall Review Reminders](https://feedback.getrecall.ai/changelog/release-29-november-2024-recall-review-reminders)
  - [Recall Release Notes: Feb 19, 2026 - Quiz 2.0 with Shared Challenges](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-19-2026-quiz-20-with-shared-challenges)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Fresh Artifacts
- `scripts/playwright/stage80_post_stage79_benchmark_audit_edge.mjs`
- `output/playwright/stage80-home-landing-desktop.png`
- `output/playwright/stage80-graph-browse-desktop.png`
- `output/playwright/stage80-study-browse-desktop.png`
- `output/playwright/stage80-focused-study-desktop.png`
- `output/playwright/stage80-benchmark-audit-validation.json`

## Findings
- Home:
  - Home is once again the clearest remaining benchmark mismatch.
  - The landing is materially calmer than it was before Stages 75-77, but two gaps still dominate:
    - the featured band still splits into a wide spotlight lane plus a tall support column, which keeps the page feeling more staged than selective
    - the top half of the canvas still carries too much empty space around the saved-source intro and support rail before the landing feels brisk and utility-led
  - Inference from the user-provided Home benchmark screenshots plus Recall’s broader UI direction: the next pass should compact the featured band and reduce the empty-canvas feel rather than reopening Study immediately.
- Study:
  - Stage 79 materially improved Study.
  - The session dock now reads more like utility, and the pre-answer review strip no longer competes with the prompt in the same way.
  - Study still has product-specific support chrome, but it is no longer the clearest blocker.
- Graph:
  - Graph stayed stable and remains a lower-mismatch surface.
  - The graph canvas still dominates enough that Graph does not deserve the next bounded slice.
- Focused regression:
  - Focused Study preserved the reader-led split and stayed stable during the audit.

## Decision
- Stage 80 is complete.
- Stage 81 should be `Recall Home Featured Band Compaction And Empty-Canvas Reduction`.
- Stage 81 should compact the Home featured band and reduce the remaining empty-canvas feel while preserving the lighter utility rail, grouped browsing, add-source access, search, Study gains, Graph stability, and focused reader-led work.

## Validation
- `node scripts/playwright/stage80_post_stage79_benchmark_audit_edge.mjs`
- screenshot-led manual review against `docs/ux/recall_benchmark_matrix.md`, the user-provided Recall benchmark screenshots, and the official Recall docs/changelog sources above
- manifest JSON parse check

## Execution Note
- On this machine, the repo-owned Edge screenshot harness should continue to run through Windows `node` rather than WSL `node`, because WSL Playwright attempts to launch Linux `msedge`, which is not installed.
