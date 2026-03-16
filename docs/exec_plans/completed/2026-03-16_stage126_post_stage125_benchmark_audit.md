# ExecPlan: Stage 126 Post-Stage-125 Benchmark Audit

## Summary
- Audit the fresh post-Stage-125 Home, Graph, Study, and focused-Study captures against the benchmark matrix.
- Verify that Stage 125 reduced the remaining Home mismatch enough that Home no longer leads the list.
- Select the next bounded Study follow-up from screenshot evidence instead of assumption.

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

## Audit Focus
- Home:
  - confirm whether the lower continuation band now feels like a deliberate follow-on sequence instead of a footer strip
  - confirm whether the reveal control now behaves like quieter supporting utility instead of a terminal card
  - check whether the opening spotlight and nearby handoff stayed calm while the lower landing became more continuous
- Study:
  - confirm that the calmer Stage 123 browse-mode review direction stayed stable after the Home pass
- Graph:
  - confirm that Graph remains stable and lower-priority
- Focused regression:
  - confirm that focused Study still preserves the reader-led split

## Fresh Artifacts
- `scripts/playwright/stage125_home_continuation_band_elevation_edge.mjs`
- `scripts/playwright/stage126_post_stage125_benchmark_audit_edge.mjs`
- `output/playwright/stage125-home-landing-desktop.png`
- `output/playwright/stage125-graph-browse-desktop.png`
- `output/playwright/stage125-study-browse-desktop.png`
- `output/playwright/stage125-focused-study-desktop.png`
- `output/playwright/stage125-home-continuation-band-elevation-validation.json`

## Findings
- Home:
  - Stage 125 materially improved Home.
  - The lower continuation band now reads more like part of the same reopen flow, and the final reveal control no longer acts like a separate terminal card.
  - Home is no longer the clearest remaining blocker in the fresh Stage 126 captures.
- Study:
  - Study stayed stable, but now leads the remaining mismatch list again.
  - The browse-mode review card still sits beneath a mostly empty top support strip, and the extra top canvas keeps the task lower than the benchmark direction wants.
  - The remaining weight is now less about queue chrome and more about getting the review task to own the page sooner.
- Graph:
  - Graph stayed stable and remains a lower-priority mismatch.
- Focused regression:
  - Focused Study preserved the reader-led split and stayed stable during the audit.

## Decision
- Stage 126 is complete.
- Stage 127 should be `Recall Study Support Strip Removal And Review Canvas Lift`.
- Stage 127 should stay tightly bounded to Study: remove or materially demote the empty top support-strip framing and lift the review card higher, while keeping Home, Graph, focused Study, and the deferred responsive-shell issue stable.

## Validation
- `node scripts/playwright/stage126_post_stage125_benchmark_audit_edge.mjs`
- screenshot-led manual review against `docs/ux/recall_benchmark_matrix.md` and the user-provided Recall benchmark screenshots
- manifest JSON parse check

## Exit Criteria
- A documented benchmark call on whether Home still leads the remaining mismatch list after Stage 125.
- Stable/no-regression confirmation for Study, Graph, and focused Study.
- A bounded Stage 127 follow-up selected from the fresh screenshot evidence.

## Execution Note
- On this machine, the repo-owned Edge screenshot harness should continue to run through Windows `node` rather than WSL `node`, because WSL Playwright attempts to launch Linux `msedge`, which is not installed.
