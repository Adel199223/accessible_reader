# ExecPlan: Stage 66 Post-Stage-65 Benchmark Audit

## Summary
- Audited the fresh post-Stage-65 Home, Graph, Study, and focused-Study captures against the benchmark matrix and locked Recall references.
- Confirmed that the Stage 65 Home pass materially reduced Home's remaining benchmark gap without regressing the preserved surfaces.
- Identified Study as the clearest remaining mismatch again and selected the next bounded Study follow-up from fresh evidence.

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

## Goals
- Compare the refreshed Home landing against the benchmark after the Stage 65 utility-rail and recent-list pass.
- Confirm that Graph, Study, and focused Study remained stable during the Stage 65 Home work.
- Use fresh benchmark evidence to choose the next highest-value bounded follow-up instead of carrying forward assumptions from the Stage 64 audit.

## Scope
- `docs/ROADMAP.md`
- `docs/ROADMAP_ANCHOR.md`
- `docs/assistant/APP_KNOWLEDGE.md`
- `docs/assistant/manifest.json`
- `docs/ux/recall_benchmark_matrix.md`
- one repo-owned Edge benchmark-audit harness plus fresh localhost artifacts

## Fresh Artifacts
- `output/playwright/stage66-home-landing-desktop.png`
- `output/playwright/stage66-graph-browse-desktop.png`
- `output/playwright/stage66-study-browse-desktop.png`
- `output/playwright/stage66-focused-study-desktop.png`
- `output/playwright/stage66-benchmark-audit-validation.json`

## Findings
- Home:
  - Stage 65 materially improved the Home landing.
  - The left rail now reads more like one quiet utility dock, and the grouped recent-source reopen list no longer dominates the page like a dense archive wall.
  - Home still has some remaining benchmark delta, but it is no longer the clearest blocker.
- Graph:
  - Graph remains stable and low-mismatch.
  - The graph canvas still dominates the browse surface enough that Graph does not need the next slice.
- Study:
  - Study is again the clearest remaining mismatch.
  - The browse-mode session dock still takes more width and visual emphasis than the benchmark direction wants for support chrome.
  - The pre-answer review header and its top utility cluster still frame the review card more heavily than the benchmark's more singular quiz/session direction.
  - Inference from the user-provided benchmark screenshots plus Recall's review-focused product framing: the page should feel even more like one card-led review task, with support and status chrome demoted further.
- Focused regression:
  - Focused Study still preserves the reader-led split and stayed stable during the audit.

## Decision
- Stage 66 is complete.
- Stage 67 should be `Recall Study Session Dock Narrowing And Review Header Demotion`.
- Stage 67 should narrow the browse-mode Study support dock and further demote pre-answer review-header chrome while preserving source grounding, Reader reopen, local FSRS state, and focused reader-led Study behavior.

## Validation
- `node scripts/playwright/stage66_post_stage65_benchmark_audit_edge.mjs`
- screenshot-led manual review against `docs/ux/recall_benchmark_matrix.md`, the user-provided Recall benchmark screenshots, and the official Recall docs/changelog sources above

## Execution Note
- On this machine, the repo-owned Edge screenshot harness should continue to run through Windows `node` rather than WSL `node`, because WSL Playwright attempts to launch Linux `msedge`, which is not installed.
