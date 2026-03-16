# ExecPlan: Stage 58 Post-Stage-57 Benchmark Audit

## Summary
- Audited fresh post-Stage-57 Home, Graph, Study, and focused-Study captures against the benchmark matrix and the locked Recall references.
- Confirmed that Stage 57 materially improved Study, but that Study is still the clearest remaining benchmark mismatch.
- Confirmed that Home and Graph stayed stable while focused Study preserved the reader-led split.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Add Content
  - Knowledge Graph
  - Spaced repetition / review
- Official supporting Recall sources:
  - [Release: 29 November 2024 // Recall Review Reminders](https://feedback.getrecall.ai/changelog/release-29-november-2024-recall-review-reminders)
  - [Release: 22 August 2024 // UI Improvements](https://feedback.getrecall.ai/changelog/release-22-august-2024-ui-improvements)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Fresh Artifacts
- `output/playwright/stage58-home-landing-desktop.png`
- `output/playwright/stage58-graph-browse-desktop.png`
- `output/playwright/stage58-study-browse-desktop.png`
- `output/playwright/stage58-focused-study-desktop.png`
- `output/playwright/stage58-benchmark-audit-validation.json`

## Findings
- Home:
  - the calmer selective landing still holds
  - Home remains a medium-mismatch polish surface rather than the next structural blocker
- Graph:
  - the graph canvas still dominates browse mode appropriately
  - the support rail and detail overlay remain secondary enough that Graph does not need the next slice
- Study:
  - Stage 57 materially improved the first-glance hierarchy; the calmer inline flow and removal of the top-right Reader utility make the main review card feel more central
  - the collapsed queue rail is no longer the main blocker, even though it still reads slightly more boxed than the Recall direction wants
  - the remaining mismatch has moved lower into the review surface: the `Source evidence` block still reads like a second card inside the card, and the large full-width rating row still gives the footer more visual weight than the benchmark direction wants
  - inference from the user-provided review screenshots and Recall's review-reminder and review-page release notes: the review surface should read more like one tight quiz session and less like a stacked dashboard of supporting panels
  - Study is still the highest-value next bounded implementation target
- Focused regression:
  - focused Study still preserves the reader-led split with live Reader content as the primary pane
  - no new regression surfaced during the audit

## Decision
- Stage 58 is complete.
- Stage 59 should be `Recall Study Evidence Stack Compression And Rating Row Tightening`.
- Stage 59 should compress the lower browse-mode support stack so source evidence and rating controls stay close at hand without visually overtaking the recall-first flow.

## Validation
- `node scripts/playwright/stage58_post_stage57_benchmark_audit_edge.mjs`
- screenshot-led manual review against `docs/ux/recall_benchmark_matrix.md`, the user-provided Recall references, and the official Recall release notes above

## Execution Note
- On this machine, the repo-owned Edge screenshot harness should continue to run through Windows `node` rather than WSL `node`, because WSL Playwright attempts to launch Linux `msedge`, which is not installed.
