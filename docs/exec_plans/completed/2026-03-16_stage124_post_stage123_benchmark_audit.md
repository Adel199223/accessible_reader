# ExecPlan: Stage 124 Post-Stage-123 Benchmark Audit

## Summary
- Audited the fresh post-Stage-123 Home, Graph, Study, and focused-Study captures against the benchmark matrix.
- Confirmed that Stage 123 materially improved Study enough that Study is no longer the clearest remaining blocker.
- Selected a narrower Home follow-up from fresh screenshot evidence instead of assumption.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Add Content
  - Knowledge Graph
  - Spaced repetition / review
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Release: 22 August 2024 // UI Improvements](https://feedback.getrecall.ai/changelog/release-22-august-2024-ui-improvements)
  - [Quiz & Spaced Repetition](https://docs.getrecall.ai/docs/features/quiz-and-spaced-repetition)
  - [Release: 29 November 2024 // Recall Review Reminders](https://feedback.getrecall.ai/changelog/release-29-november-2024-recall-review-reminders)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Fresh Artifacts
- `scripts/playwright/stage123_study_support_strip_collapse_edge.mjs`
- `scripts/playwright/stage124_post_stage123_benchmark_audit_edge.mjs`
- `output/playwright/stage123-home-landing-desktop.png`
- `output/playwright/stage123-graph-browse-desktop.png`
- `output/playwright/stage123-study-browse-desktop.png`
- `output/playwright/stage123-focused-study-desktop.png`
- `output/playwright/stage123-study-support-strip-collapse-validation.json`

## Findings
- Study:
  - Stage 123 materially improved Study.
  - The old separate support strip no longer reads like dashboard chrome, and the review task lands sooner in the page.
  - Study is no longer the clearest remaining blocker in the fresh Stage 124 captures.
- Home:
  - Home stayed stable, but now leads the remaining mismatch list again.
  - The opening flow is calmer, but the lower continuation band still feels like a terminal footer row rather than the next step in the same selective reopen flow.
  - The reveal card at the end of the band still reads too much like a standalone endpoint, leaving the lower landing more abruptly finished than the benchmark direction wants.
- Graph:
  - Graph stayed stable and remains a lower-mismatch surface.
- Focused regression:
  - Focused Study preserved the reader-led split and stayed stable during the audit.

## Decision
- Stage 124 is complete.
- Stage 125 should be `Recall Home Continuation Band Elevation And Reveal Card Demotion`.
- Stage 125 should stay tightly bounded to Home: elevate the lower continuation flow so it feels like a true follow-on reopen sequence and demote the final reveal card so the landing does not end as abruptly, while keeping Study, Graph, focused Study, and the deferred responsive-shell issue stable.

## Validation
- `node scripts/playwright/stage124_post_stage123_benchmark_audit_edge.mjs`
- screenshot-led manual review against `docs/ux/recall_benchmark_matrix.md` and the user-provided Recall benchmark screenshots
- manifest JSON parse check

## Execution Note
- On this machine, the repo-owned Edge screenshot harness should continue to run through Windows `node` rather than WSL `node`, because WSL Playwright attempts to launch Linux `msedge`, which is not installed.
