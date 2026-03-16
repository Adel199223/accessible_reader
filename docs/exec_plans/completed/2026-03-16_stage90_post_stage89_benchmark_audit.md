# ExecPlan: Stage 90 Post-Stage-89 Benchmark Audit

## Summary
- Audited the fresh post-Stage-89 Home, Graph, Study, and focused-Study captures against the benchmark matrix and the locked Recall references.
- Confirmed that Stage 89 materially improved Home, but that Home still remains the clearest remaining benchmark blocker.
- Selected one more bounded Home follow-up from fresh evidence instead of reopening Study or broad shell work.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Add Content
  - Knowledge Graph
  - Spaced repetition / review
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Release: 22 August 2024 // UI Improvements](https://feedback.getrecall.ai/changelog/release-22-august-2024-ui-improvements)
  - [Release: 29 November 2024 // Recall Review Reminders](https://feedback.getrecall.ai/changelog/release-29-november-2024-recall-review-reminders)
  - [Recall Release Notes: Feb 19, 2026 - Quiz 2.0 with Shared Challenges](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-19-2026-quiz-20-with-shared-challenges)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Fresh Artifacts
- `scripts/playwright/stage89_home_utility_search_rail_demotion_edge.mjs`
- `output/playwright/stage89-home-landing-desktop.png`
- `output/playwright/stage89-graph-browse-desktop.png`
- `output/playwright/stage89-study-browse-desktop.png`
- `output/playwright/stage89-focused-study-desktop.png`
- `output/playwright/stage89-home-utility-search-rail-demotion-validation.json`

## Findings
- Home:
  - Stage 89 materially improved Home.
  - The utility/search rail is no longer the main blocker; it now reads flatter and more like secondary support.
  - Home still remains the clearest remaining mismatch because the top of the landing is still too split and staged:
    - `Home`, `Saved sources`, and the separate `Earlier` intro still read like distinct setup bands instead of one immediate reopen flow
    - the first featured reopen point still begins lower than the benchmark direction wants on desktop
  - Inference from the user-provided Home benchmark screenshots plus Recall’s broader UI direction: the next pass should stay on Home and merge the upper header/section handoff so the first reopen band lifts higher and feels more continuous.
- Study:
  - Study stayed stable after Stage 89 and is no longer the clearest blocker.
  - The centered review card still reads much closer to the benchmark direction than Home now does.
- Graph:
  - Graph stayed stable and remains a lower-mismatch surface.
  - The graph canvas still dominates enough that Graph does not deserve the next bounded slice.
- Focused regression:
  - Focused Study preserved the reader-led split and stayed stable during the audit.

## Decision
- Stage 90 is complete.
- Stage 91 should be `Recall Home Header Merge And First Reopen Lift`.
- Stage 91 should merge the Home landing header and first reopen handoff so the saved-source flow starts sooner, while preserving the calmer utility rail, Study stability, Graph stability, and focused reader-led work.

## Validation
- `node scripts/playwright/stage89_home_utility_search_rail_demotion_edge.mjs`
- screenshot-led manual review against `docs/ux/recall_benchmark_matrix.md`, the user-provided Recall benchmark screenshots, and the official Recall docs/changelog sources above
- manifest JSON parse check

## Execution Note
- On this machine, the repo-owned Edge screenshot harness should continue to run through Windows `node` rather than WSL `node`, because WSL Playwright attempts to launch Linux `msedge`, which is not installed.
