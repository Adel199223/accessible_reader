# ExecPlan: Stage 72 Post-Stage-71 Benchmark Audit

## Summary
- Audited the fresh post-Stage-71 Home, Graph, Study, and focused-Study captures against the benchmark matrix and the locked Recall references.
- Confirmed that the Stage 71 Home pass materially reduced the remaining Home mismatch without regressing Graph, Study, or focused reader-led work.
- Identified Study as the clearest remaining benchmark mismatch again and selected one bounded Study follow-up from fresh evidence.

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
- `scripts/playwright/stage72_post_stage71_benchmark_audit_edge.mjs`
- `output/playwright/stage72-home-landing-desktop.png`
- `output/playwright/stage72-graph-browse-desktop.png`
- `output/playwright/stage72-study-browse-desktop.png`
- `output/playwright/stage72-focused-study-desktop.png`
- `output/playwright/stage72-benchmark-audit-validation.json`

## Findings
- Home:
  - Stage 71 materially improved Home.
  - The landing now starts sooner and the featured saved-source surface reads flatter and more selective than the older archive-wall presentation.
  - Home still has product-specific spacing and card-grouping differences from Recall, but it is no longer the clearest remaining blocker.
- Study:
  - Study is now the clearest remaining benchmark mismatch again.
  - The left `Session` dock still reads as a persistent side rail rather than as quiet secondary utility.
  - The pre-answer review frame still spends too much vertical emphasis on chrome before the prompt:
    - the `Review card` title block plus `Review session` label still stage the page more heavily than the benchmark direction wants
    - the quieter `Grounding ready` row still sits as an additional pre-answer support band instead of feeling fully absorbed into the main review flow
  - Inference from the user-provided Study benchmark screenshots plus Recall’s review-oriented product direction: the next bounded pass should refocus Study on the singular review interaction rather than continue on Home.
- Graph:
  - Graph stayed stable and remains a lower-mismatch surface.
  - The graph canvas still dominates enough that Graph does not deserve the next bounded slice.
- Focused regression:
  - Focused Study preserved the reader-led split and stayed stable during the audit.

## Decision
- Stage 72 is complete.
- Stage 73 should be `Recall Study Session Rail Compaction And Review Header Flattening`.
- Stage 73 should compress the browse-mode Study session rail into quieter utility and flatten the pre-answer review chrome so the prompt owns the page sooner while preserving source grounding, Reader reopen, Home gains, Graph stability, and focused reader-led work.

## Validation
- `node scripts/playwright/stage72_post_stage71_benchmark_audit_edge.mjs`
- screenshot-led manual review against `docs/ux/recall_benchmark_matrix.md`, the user-provided Recall benchmark screenshots, and the official Recall docs/changelog sources above
- manifest JSON parse check

## Execution Note
- On this machine, the repo-owned Edge screenshot harness should continue to run through Windows `node` rather than WSL `node`, because WSL Playwright attempts to launch Linux `msedge`, which is not installed.
