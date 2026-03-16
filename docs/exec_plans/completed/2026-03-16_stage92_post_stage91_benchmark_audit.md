# ExecPlan: Stage 92 Post-Stage-91 Benchmark Audit

## Summary
- Audited the fresh post-Stage-91 Home, Graph, Study, and focused-Study captures against the benchmark matrix and the locked Recall references.
- Confirmed that Stage 91 materially improved Home enough that Home is no longer the clearest remaining blocker.
- Selected Study as the next bounded implementation target from fresh evidence instead of carrying forward the pre-Stage-91 Home-first diagnosis.

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
- `scripts/playwright/stage92_post_stage91_benchmark_audit_edge.mjs`
- `output/playwright/stage92-home-landing-desktop.png`
- `output/playwright/stage92-graph-browse-desktop.png`
- `output/playwright/stage92-study-browse-desktop.png`
- `output/playwright/stage92-focused-study-desktop.png`
- `output/playwright/stage92-post-stage91-benchmark-audit-validation.json`

## Findings
- Home:
  - Stage 91 materially improved Home.
  - The merged `Saved sources` handoff now lets the first featured reopen start immediately instead of below a separate staged intro band.
  - Home is no longer the clearest remaining blocker.
  - Inference from the user-provided Home benchmark screenshots plus Recall’s broader UI direction: Home still has room to improve later, but it is now materially closer than Study.
- Study:
  - Study now leads the remaining mismatch list again.
  - The browse-mode `Session` dock still reads too much like persistent sidebar chrome rather than quiet secondary utility.
  - The pre-answer review header and due-state meta still frame the task more heavily than the benchmark direction wants before the prompt and reveal flow.
  - Inference from the user-provided Study benchmark plus Recall’s review-oriented docs/changelog direction: the next bounded pass should further demote the session dock and compress the review header so the prompt owns the page sooner.
- Graph:
  - Graph stayed stable and remains a lower-mismatch surface.
  - Its current support chrome still exists, but it is not the highest-value next correction.
- Focused regression:
  - Focused Study preserved the reader-led split and stayed stable during the audit.

## Decision
- Stage 92 is complete.
- Stage 93 should be `Recall Study Session Dock Demotion And Review Header Compaction`.
- Stage 93 should stay tightly bounded to Study browse mode: further demote the `Session` dock, compress the pre-answer review header/meta, and keep Home, Graph, and focused reader-led work stable.

## Validation
- `node scripts/playwright/stage92_post_stage91_benchmark_audit_edge.mjs`
- screenshot-led manual review against `docs/ux/recall_benchmark_matrix.md`, the user-provided Recall benchmark screenshots, and the official Recall docs/changelog sources above
- manifest JSON parse check

## Execution Note
- On this machine, the repo-owned Edge screenshot harness should continue to run through Windows `node` rather than WSL `node`, because WSL Playwright attempts to launch Linux `msedge`, which is not installed.
