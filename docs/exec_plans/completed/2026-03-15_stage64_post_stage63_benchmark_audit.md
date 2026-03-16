# ExecPlan: Stage 64 Post-Stage-63 Benchmark Audit

## Summary
- Audited the fresh post-Stage-63 Home, Graph, Study, and focused-Study captures against the benchmark matrix and locked Recall references.
- Confirmed that Stage 63 materially improved browse-mode Study and that Study no longer leads the remaining mismatch list.
- Identified Home as the clearest remaining benchmark gap and selected the next bounded Home-focused slice from fresh evidence.

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
- Compare the refreshed Study browse surface against the benchmark after the Stage 63 session-first hierarchy pass.
- Confirm that Home, Graph, and focused Study remained stable during the Stage 63 pass.
- Use fresh benchmark evidence to decide whether the next bounded slice should remain on Study or shift back to Home.

## Scope
- `docs/ROADMAP.md`
- `docs/ROADMAP_ANCHOR.md`
- `docs/assistant/APP_KNOWLEDGE.md`
- `docs/assistant/manifest.json`
- `docs/ux/recall_benchmark_matrix.md`
- one repo-owned Edge benchmark-audit harness plus fresh localhost artifacts

## Fresh Artifacts
- `output/playwright/stage64-home-landing-desktop.png`
- `output/playwright/stage64-graph-browse-desktop.png`
- `output/playwright/stage64-study-browse-desktop.png`
- `output/playwright/stage64-focused-study-desktop.png`
- `output/playwright/stage64-benchmark-audit-validation.json`

## Findings
- Home:
  - Home is now the clearest remaining mismatch.
  - The left support rail still reads too tall and boxed relative to the benchmark direction.
  - The `This week` reopen stack still feels more archive-like than selective because repeated metadata and long row repetition dominate the landing.
  - Inference from the user-provided Home screenshots plus Recall's product framing: the landing should feel more like a selective starting point and less like a dense source archive.
- Graph:
  - Graph remains stable and low-mismatch.
  - The canvas still dominates the browse surface enough that Graph does not need the next slice.
- Study:
  - Stage 63 materially improved the browse surface.
  - The queue summary now behaves more like a compact session dock than like a parallel panel, and the review card owns the page faster.
  - The remaining Study delta is now smaller utility chrome rather than a still-dashboard-like core layout, so Study no longer needs the immediate next slice.
- Focused regression:
  - Focused Study still preserves the reader-led split and stayed stable during the audit.

## Decision
- Stage 64 is complete.
- Stage 65 should be `Recall Home Utility Rail Softening And Recent List Compression`.
- Stage 65 should soften the left Home support rail and compress recent-source list density while preserving grouped recency sections, search entry, add-source flow, and the calmer Study and Graph surfaces.

## Validation
- `node scripts/playwright/stage64_post_stage63_benchmark_audit_edge.mjs`
- screenshot-led manual review against `docs/ux/recall_benchmark_matrix.md`, the user-provided Recall benchmark screenshots, and the official Recall docs/changelog sources above

## Execution Note
- On this machine, the repo-owned Edge screenshot harness should continue to run through Windows `node` rather than WSL `node`, because WSL Playwright attempts to launch Linux `msedge`, which is not installed.
