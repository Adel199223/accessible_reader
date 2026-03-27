# ExecPlan: Stage 569 Home Utility-Cluster Anchoring And Restrained Poster-Copy Reset After Stage 568

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Reduce the remaining March 25, 2026 Recall homepage mismatch by tightening the top-right utility cluster, compressing the organizer overflow trigger, and removing duplicate poster body copy inside cards.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- No backend, storage, routing, or schema changes.
- No generated-content `Reader` work.

## Acceptance
- The visible Home toolbar stays limited to `Search`, `Add`, `List`, and `Sort`.
- The toolbar reads as a smaller anchored utility block than the Stage 568 baseline.
- The at-rest organizer trigger no longer reads like a text pill.
- `web`, `paste`, and file/document posters keep source-aware fallback treatment without duplicated interior headline/supporting copy.
- The Stage 563 structural baseline remains intact: selected collection rail, date-grouped canvas, and first-group `Add Content` tile.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check scripts/playwright/stage569_home_utility_cluster_anchoring_and_restrained_poster_copy_reset_after_stage568.mjs scripts/playwright/stage570_post_stage569_home_utility_cluster_anchoring_and_restrained_poster_copy_audit.mjs`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 569 run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the Stage 569/570 touched set

## Outcome
- Complete.
- The Home utility cluster now reads tighter at rest while keeping the same visible four-control ownership from Stage 568.
- The rail overflow trigger is now a compact `...` continuation control instead of a visibly wordy header pill.
- Poster interiors now keep only the source-type badge, typed detail, monogram, and one restrained note line, so the title plus source row do more of the card-hierarchy work.
- Live Stage 569 Edge evidence recorded `Captures collection canvas` as the active canvas aria-label, `215.48px` toolbar width, `33.91px` organizer-trigger width, `0` preview body-copy nodes, a `182px` sort-popover width, a `237.59px` add-tile height, a `96.53px` first day-group top offset, `127.0.0.1` plus `Browser source` for the representative `web` poster, and `HTML file` plus `Local document` for the representative file poster.
