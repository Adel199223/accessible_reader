# ExecPlan: Stage 120 Post-Stage-119 Benchmark Audit

## Summary
- Audited the fresh post-Stage-119 Home, Graph, Study, and focused-Study captures against the benchmark matrix.
- Confirmed that Stage 119 materially improved Study enough that Study is no longer the clearest remaining blocker.
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
- `scripts/playwright/stage120_post_stage119_benchmark_audit_edge.mjs`
- `output/playwright/stage119-home-landing-desktop.png`
- `output/playwright/stage119-graph-browse-desktop.png`
- `output/playwright/stage119-study-browse-desktop.png`
- `output/playwright/stage119-focused-study-desktop.png`
- `output/playwright/stage119-study-support-strip-minimization-validation.json`
- `output/playwright/stage120-home-landing-desktop.png`
- `output/playwright/stage120-graph-browse-desktop.png`
- `output/playwright/stage120-study-browse-desktop.png`
- `output/playwright/stage120-focused-study-desktop.png`
- `output/playwright/stage120-post-stage119-benchmark-audit-validation.json`

## Findings
- Study:
  - Stage 119 materially improved Study.
  - The collapsed `Session` support now reads as in-card utility rather than a lingering sidebar-like framing surface.
  - The review card lands higher and the browse-mode canvas feels more task-first.
  - Study is no longer the clearest remaining blocker in the fresh Stage 120 captures.
- Home:
  - Home stayed stable, but now leads the remaining mismatch list again.
  - The opening still feels slightly too staged because the `Start here` spotlight remains oversized relative to the calmer continuation rows underneath it.
  - The nearby handoff still reads more like a secondary card band than one continuous reopen flow.
- Graph:
  - Graph stayed stable and remains a lower-mismatch surface.
- Focused regression:
  - Focused Study preserved the reader-led split and stayed stable during the audit.

## Decision
- Stage 120 is complete.
- Stage 121 should be `Recall Home Opening Spotlight Compaction And Nearby Flow Flattening`.
- Stage 121 should stay tightly bounded to Home: reduce the remaining oversized opening spotlight and flatten the nearby handoff so the landing reads more like one selective reopen flow, while keeping Study, Graph, focused Study, and the deferred responsive-shell issue stable.

## Validation
- `node scripts/playwright/stage120_post_stage119_benchmark_audit_edge.mjs`
- screenshot-led manual review against `docs/ux/recall_benchmark_matrix.md` and the user-provided Recall benchmark screenshots
- manifest JSON parse check

## Execution Note
- On this machine, the repo-owned Edge screenshot harness should continue to run through Windows `node` rather than WSL `node`, because WSL Playwright attempts to launch Linux `msedge`, which is not installed.
