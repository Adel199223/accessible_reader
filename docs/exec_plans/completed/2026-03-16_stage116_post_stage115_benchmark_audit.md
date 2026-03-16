# ExecPlan: Stage 116 Post-Stage-115 Benchmark Audit

## Summary
- Audited the fresh post-Stage-115 Home, Graph, Study, and focused-Study captures against the benchmark matrix.
- Confirmed that Stage 115 materially improved Home, but that Home still remains the clearest remaining blocker.
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
- `scripts/playwright/stage116_post_stage115_benchmark_audit_edge.mjs`
- `output/playwright/stage115-home-landing-desktop.png`
- `output/playwright/stage115-graph-browse-desktop.png`
- `output/playwright/stage115-study-browse-desktop.png`
- `output/playwright/stage115-focused-study-desktop.png`
- `output/playwright/stage115-home-continuation-handoff-tightening-validation.json`
- `output/playwright/stage116-home-landing-desktop.png`
- `output/playwright/stage116-graph-browse-desktop.png`
- `output/playwright/stage116-study-browse-desktop.png`
- `output/playwright/stage116-focused-study-desktop.png`
- `output/playwright/stage116-post-stage115-benchmark-audit-validation.json`

## Findings
- Home:
  - Stage 115 materially improved Home.
  - The `Keep going` handoff is calmer and the lower reopen rows feel less boxed than before.
  - Home still remains the clearest remaining mismatch, though, because the lower section still ends too abruptly:
    - the `Show all … earlier sources` control still sits too isolated below the continuation rows
    - the lower canvas still leaves too much empty space after the calmer reopen flow
- Study:
  - Study stayed stable and remains calmer after the Stage 113 correction.
  - Study no longer outranks Home in the fresh Stage 116 captures.
- Graph:
  - Graph stayed stable and remains a lower-mismatch surface.
- Focused regression:
  - Focused Study preserved the reader-led split and stayed stable during the audit.

## Decision
- Stage 116 is complete.
- Stage 117 should be `Recall Home Lower Canvas Fill And Reveal Control Integration`.
- Stage 117 should stay tightly bounded to Home: integrate the reveal control into the continuation flow, reduce the isolated empty lower-canvas ending, and keep Study, Graph, focused Study, and the deferred responsive-shell issue stable.

## Validation
- `node scripts/playwright/stage116_post_stage115_benchmark_audit_edge.mjs`
- screenshot-led manual review against `docs/ux/recall_benchmark_matrix.md` and the user-provided Recall benchmark screenshots
- manifest JSON parse check

## Execution Note
- On this machine, the repo-owned Edge screenshot harness should continue to run through Windows `node` rather than WSL `node`, because WSL Playwright attempts to launch Linux `msedge`, which is not installed.
