# ExecPlan: Stage 70 Post-Stage-69 Benchmark Audit

## Summary
- Audited the fresh post-Stage-69 Home, Graph, Study, and focused-Study captures against the benchmark matrix and locked Recall references.
- Confirmed that the Stage 69 Study pass materially reduced the remaining support-chrome mismatch without regressing the preserved surfaces.
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

## Goals
- Compare the refreshed Study browse surface against the benchmark after the Stage 69 dock-summary and grounding-strip compression pass.
- Confirm that Home, Graph, and focused Study remained stable during the Stage 69 Study work and the bounded refresh-persistence detour.
- Use fresh benchmark evidence to choose the next highest-value bounded follow-up instead of carrying forward the Stage 68 assumption unchanged.

## Scope
- `docs/ROADMAP.md`
- `docs/ROADMAP_ANCHOR.md`
- `docs/assistant/APP_KNOWLEDGE.md`
- `docs/assistant/manifest.json`
- `docs/ux/recall_benchmark_matrix.md`
- one repo-owned Edge benchmark-audit harness plus fresh localhost artifacts

## Fresh Artifacts
- `output/playwright/stage70-home-landing-desktop.png`
- `output/playwright/stage70-graph-browse-desktop.png`
- `output/playwright/stage70-study-browse-desktop.png`
- `output/playwright/stage70-focused-study-desktop.png`
- `output/playwright/stage70-benchmark-audit-validation.json`

## Findings
- Home:
  - Home is once again the clearest remaining benchmark mismatch.
  - The current landing still reads too much like a wide archive wall:
    - the canvas opens with more empty title/header space than the benchmark direction needs
    - the main saved-source cards still feel too large and equally weighted, so the landing behaves more like a card catalog than like a selective starting surface
    - the utility rail is calmer than before, but it still contributes more vertical emphasis than the benchmark’s lighter support framing
  - Inference from the user-provided Home benchmark screenshots plus Recall’s broader UI-improvement direction: the next pass should tighten the landing canvas and flatten the card wall rather than reopen Study or Graph first.
- Study:
  - Stage 69 materially improved the Study browse surface.
  - The collapsed dock now reads like quiet next-card support, and the pre-reveal grounding strip no longer behaves like a second footer card.
  - Study still has some product-specific support chrome, but it is no longer the clearest blocker.
- Graph:
  - Graph stayed stable and remains a lower-mismatch surface.
  - The graph canvas still dominates enough that Graph does not deserve the next bounded slice.
- Focused regression:
  - Focused Study preserved the reader-led split and stayed stable during the audit.

## Decision
- Stage 70 is complete.
- Stage 71 should be `Recall Home Landing Canvas Tightening And Card-Wall Flattening`.
- Stage 71 should tighten the Home landing header/canvas spacing and flatten the oversized saved-source card wall while preserving the quieter utility rail, add-source entry, search access, Graph stability, Study gains, and focused reader-led work.

## Validation
- `node scripts/playwright/stage70_post_stage69_benchmark_audit_edge.mjs`
- screenshot-led manual review against `docs/ux/recall_benchmark_matrix.md`, the user-provided Recall benchmark screenshots, and the official Recall docs/changelog sources above

## Execution Note
- On this machine, the repo-owned Edge screenshot harness should continue to run through Windows `node` rather than WSL `node`, because WSL Playwright attempts to launch Linux `msedge`, which is not installed.
