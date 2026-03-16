# ExecPlan: Stage 68 Post-Stage-67 Benchmark Audit

## Summary
- Audited the fresh post-Stage-67 Home, Graph, Study, and focused-Study captures against the benchmark matrix and locked Recall references.
- Confirmed that the Stage 67 Study pass materially reduced the remaining benchmark gap without regressing the preserved surfaces.
- Identified Study as the clearest remaining mismatch again and selected one narrower Study follow-up from fresh evidence.

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
- Compare the refreshed Study browse surface against the benchmark after the Stage 67 dock/header demotion pass.
- Confirm that Home, Graph, and focused Study remained stable during the Stage 67 Study work.
- Use fresh benchmark evidence to choose the next highest-value bounded follow-up instead of carrying forward assumptions from the Stage 66 audit.

## Scope
- `docs/ROADMAP.md`
- `docs/ROADMAP_ANCHOR.md`
- `docs/assistant/APP_KNOWLEDGE.md`
- `docs/assistant/manifest.json`
- `docs/ux/recall_benchmark_matrix.md`
- one repo-owned Edge benchmark-audit harness plus fresh localhost artifacts

## Fresh Artifacts
- `output/playwright/stage68-home-landing-desktop.png`
- `output/playwright/stage68-graph-browse-desktop.png`
- `output/playwright/stage68-study-browse-desktop.png`
- `output/playwright/stage68-focused-study-desktop.png`
- `output/playwright/stage68-benchmark-audit-validation.json`

## Findings
- Home:
  - Home remains stable and materially calmer after Stage 65.
  - The utility dock and grouped recent-source list still feel directionally right enough that Home does not need the next slice.
- Graph:
  - Graph remains stable and low-mismatch.
  - The graph canvas still dominates the browse surface enough that Graph does not need the next slice.
- Study:
  - Stage 67 materially improved the browse surface.
  - The session dock is narrower and the pre-answer header is quieter, so the review card owns the page sooner than it did in Stage 66.
  - Study is still the clearest remaining mismatch, but the remaining gap is now narrower:
    - the collapsed session dock still carries more summary text and count chrome than the benchmark direction wants for a secondary support rail
    - the pre-reveal `Grounding ready` strip still reads broader and more button-heavy than the benchmark's lighter pre-answer support treatment
  - Inference from the user-provided benchmark screenshots plus Recall's review-focused framing: the next pass should trim remaining support summaries rather than reopen another larger Study hierarchy rewrite.
- Focused regression:
  - Focused Study still preserves the reader-led split and stayed stable during the audit.

## Decision
- Stage 68 is complete.
- Stage 69 should be `Recall Study Session Dock Summary Reduction And Grounding Ready Compression`.
- Stage 69 should trim the collapsed Study dock summary and further compress the pre-reveal `Grounding ready` strip while preserving source grounding, Reader reopen, local FSRS state, and focused reader-led Study behavior.

## Validation
- `node scripts/playwright/stage68_post_stage67_benchmark_audit_edge.mjs`
- screenshot-led manual review against `docs/ux/recall_benchmark_matrix.md`, the user-provided Recall benchmark screenshots, and the official Recall docs/changelog sources above

## Execution Note
- On this machine, the repo-owned Edge screenshot harness should continue to run through Windows `node` rather than WSL `node`, because WSL Playwright attempts to launch Linux `msedge`, which is not installed.
