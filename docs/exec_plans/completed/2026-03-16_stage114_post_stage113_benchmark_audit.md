# ExecPlan: Stage 114 Post-Stage-113 Benchmark Audit

## Summary
- Audited the fresh post-Stage-113 Home, Graph, Study, and focused-Study captures against the benchmark matrix.
- Confirmed that Stage 113 materially improved Study enough that Study is no longer the clearest remaining blocker.
- Selected a bounded Home follow-up from fresh screenshot evidence instead of assumption.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Add Content
  - Knowledge Graph
  - Spaced repetition / review
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Quiz & Spaced Repetition](https://docs.getrecall.ai/docs/features/quiz-and-spaced-repetition)
  - [Release: 22 August 2024 // UI Improvements](https://feedback.getrecall.ai/changelog/release-22-august-2024-ui-improvements)
  - [Release: 29 November 2024 // Recall Review Reminders](https://feedback.getrecall.ai/changelog/release-29-november-2024-recall-review-reminders)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Fresh Artifacts
- `scripts/playwright/stage114_post_stage113_benchmark_audit_edge.mjs`
- `output/playwright/stage113-home-landing-desktop.png`
- `output/playwright/stage113-graph-browse-desktop.png`
- `output/playwright/stage113-study-browse-desktop.png`
- `output/playwright/stage113-focused-study-desktop.png`
- `output/playwright/stage113-study-support-strip-demotion-validation.json`
- `output/playwright/stage114-home-landing-desktop.png`
- `output/playwright/stage114-graph-browse-desktop.png`
- `output/playwright/stage114-study-browse-desktop.png`
- `output/playwright/stage114-focused-study-desktop.png`
- `output/playwright/stage114-post-stage113-benchmark-audit-validation.json`

## Findings
- Study:
  - Stage 113 materially improved Study.
  - The in-flow support strip now reads as lighter utility instead of a standing dashboard header, and the review card owns the page sooner.
  - Study is no longer the clearest remaining mismatch in the fresh Stage 114 captures.
- Home:
  - Home stayed stable after the Study pass, but it now leads the remaining mismatch list again.
  - The landing still hands off too abruptly from the `Start here` spotlight into a lower stack of boxed reopen cards.
  - The lower continuation rows still read more archive-like and disconnected than the benchmark direction wants.
- Graph:
  - Graph stayed stable and remains a lower-mismatch surface.
- Focused regression:
  - Focused Study preserved the reader-led split and stayed stable during the audit.

## Decision
- Stage 114 is complete.
- Stage 115 should be `Recall Home Continuation Handoff Tightening And Lower Reopen Row Compaction`.
- Stage 115 should stay tightly bounded to Home: tighten the handoff from the opening spotlight into the lower continuation rows, reduce the remaining boxed/archive feel in those follow-on reopen cards, and keep Study, Graph, focused Study, and the deferred responsive-shell issue stable.

## Validation
- `node scripts/playwright/stage114_post_stage113_benchmark_audit_edge.mjs`
- screenshot-led manual review against `docs/ux/recall_benchmark_matrix.md` and the user-provided Recall benchmark screenshots
- manifest JSON parse check

## Execution Note
- On this machine, the repo-owned Edge screenshot harness should continue to run through Windows `node` rather than WSL `node`, because WSL Playwright attempts to launch Linux `msedge`, which is not installed.
