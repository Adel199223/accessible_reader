# ExecPlan: Stage 35 Collection-First Recall Shell Reset Before Further UI Work

## Summary
- After Stage 34 landed, the remaining UX gap was no longer evidence adjacency. It was that the default Recall shell still felt stacked, dashboard-heavy, and far from the user's benchmark screenshot.
- This user-directed slice reset Recall around a collection-first shell with one clear navigation rail, one primary content canvas, and one lighter utility dock.
- The Stage 34 reader-led focused work stayed intact while the old hero/support/context scaffolding was removed from the default landing.

## Goals
- Make default `/recall` feel collection-first instead of source-first.
- Replace the old stacked shell chrome with a slimmer left-rail and top-bar structure.
- Keep focused source work compact and calm while preserving the reader-led split behavior from Stage 34.
- Preserve local-first behavior, routes, anchors, deep links, and browser-companion handoff.

## Implementation
- Reworked the shared Recall shell into:
  - a left workspace rail for `Library`, `Graph`, `Study`, `Notes`, and `Reader`
  - a slim top utility bar with `Search` and `New`
  - one primary content region with a lighter secondary utility dock only when it materially helps
- Collapsed the source-focused workspace into a compact source strip instead of the old large standalone source-workspace card.
- Removed the old default stacked shell composition:
  - large Recall header card
  - large hero card
  - support strip and support-toggle reopen model
  - heavyweight always-on current-context and recent-work panels above the main canvas
- Kept focused `Notes`, `Graph`, and `Study` as reader-led split work beside live content, not as a separate Stage 34 regression.
- Tightened the default Library landing language and supporting chrome so the collection-first shell reads more like a browse dashboard than a dashboard of dashboards.

## Test Plan
- Validation completed in this slice:
  - `frontend npm run lint`
  - `frontend npm run build`
  - `frontend vitest run src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx`
  - `frontend vitest run src/App.test.tsx -t 'source-focused mode swaps the utility dock for the compact source strip'`
  - refreshed repo-owned real Edge smoke via `scripts/playwright/stage34_reader_led_source_split_edge.mjs`
- Live smoke coverage confirmed:
  - the refreshed shell still supports note, graph, and study work beside live Reader content
  - manual browse-first section entry still works after the shell reset
  - smoke cleanup still leaves `remainingDocuments: 0`

## Notes
- This slice is a structural shell correction, not a backend or feature-expansion milestone.
- The broad `frontend/src/App.test.tsx` suite still stalls as a whole-file pass, so targeted assertions plus the real Edge smoke remain the trustworthy validation path for this shell area.
- Stage 35 was intentionally inserted immediately after Stage 34 by user direction instead of waiting for the usual post-slice audit interstitial.
