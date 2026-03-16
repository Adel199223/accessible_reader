# ExecPlan: Stage 84 Post-Stage-83 Benchmark Audit

## Summary
- Audited the fresh post-Stage-83 Home, Graph, Study, and focused-Study captures against the benchmark matrix and the locked Recall references.
- Confirmed that Stage 83 materially improved Study enough that Study is no longer the clearest blocker.
- Identified Home as the clearest remaining benchmark mismatch again and selected one bounded Home follow-up from fresh evidence.

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
- `scripts/playwright/stage84_post_stage83_benchmark_audit_edge.mjs`
- `output/playwright/stage84-home-landing-desktop.png`
- `output/playwright/stage84-graph-browse-desktop.png`
- `output/playwright/stage84-study-browse-desktop.png`
- `output/playwright/stage84-focused-study-desktop.png`
- `output/playwright/stage84-benchmark-audit-validation.json`

## Findings
- Home:
  - Home is once again the clearest remaining benchmark mismatch.
  - The landing is materially calmer than it was before Stages 81 and 83, but two gaps still dominate:
    - the saved-source flow still ends too early on desktop, so the lower half of the page reads too empty after the featured reopen band
    - the landing still feels too much like one isolated spotlight band instead of a continued selective reopen flow
  - Inference from the user-provided Home benchmark screenshots plus Recall’s broader UI direction: the next pass should stay on Home and backfill the lower canvas with a quieter follow-on reopen continuation rather than reopening Study immediately.
- Study:
  - Stage 83 materially improved Study.
  - The collapsed `Session` rail now reads much more like utility, and the pre-answer `Grounded` row no longer competes with the review task in the same way.
  - Study still has product-specific support chrome, but it is no longer the clearest blocker.
- Graph:
  - Graph stayed stable and remains a lower-mismatch surface.
  - The graph canvas still dominates enough that Graph does not deserve the next bounded slice.
- Focused regression:
  - Focused Study preserved the reader-led split and stayed stable during the audit.

## Decision
- Stage 84 is complete.
- Stage 85 should be `Recall Home Follow-On Reopen Flow And Lower-Canvas Fill`.
- Stage 85 should reduce the remaining empty lower-canvas feel and make the Home landing feel more like one continued selective reopen flow while preserving the calmer Study surface, Graph stability, and focused reader-led work.

## Validation
- `node scripts/playwright/stage84_post_stage83_benchmark_audit_edge.mjs`
- screenshot-led manual review against `docs/ux/recall_benchmark_matrix.md`, the user-provided Recall benchmark screenshots, and the official Recall docs/changelog sources above
- manifest JSON parse check

## Execution Note
- On this machine, the repo-owned Edge screenshot harness should continue to run through Windows `node` rather than WSL `node`, because WSL Playwright attempts to launch Linux `msedge`, which is not installed.
