# ExecPlan: Stage 583 Home Collection Header Summary And Poster Badge Softening Reset After Stage 582

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Reduce the remaining March 25, 2026 Recall homepage mismatch by making the rail header summary line quieter and demoting the card-poster badge chrome.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- No backend, storage, routing, or schema changes.
- No generated-content `Reader` work.

## Acceptance
- The visible Home toolbar stays limited to `Search`, `Add`, `List`, and `Sort`.
- The rail header keeps a summary line, but it reads quieter than the Stage 582 baseline and no longer repeats the active collection label.
- Poster badges remain visible and source-aware, but they read subtler than the Stage 582 baseline.
- The Stage 563 structural baseline remains intact: selected collection rail, date-grouped canvas, and first-group `Add Content` tile.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check scripts/playwright/stage583_home_collection_header_summary_and_poster_badge_softening_reset_after_stage582.mjs scripts/playwright/stage584_post_stage583_home_collection_header_summary_and_poster_badge_softening_audit.mjs`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 583 run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the Stage 583/584 touched set

## Outcome
- Complete.
- The rail header summary line now reads quieter than the Stage 582 baseline and no longer repeats the active collection label.
- Poster badges remain source-aware, but they now sit subtler than the Stage 582 baseline without disturbing the poster-led hierarchy.
- Live Stage 583 Edge evidence recorded `Captures` as the active rail label, `34` as the active rail count, `34 sources` as the quiet rail summary line, rail heading-meta styling at `9.76px` with `rgba(196, 207, 226, 0.38)`, rail summary styling at `10.08px` with `rgba(176, 190, 211, 0.46)`, poster badge styling at `8.48px` with `rgba(13, 17, 25, 0.54)` background, `rgba(255, 255, 255, 0.05)` border, `rgba(220, 230, 246, 0.78)` text, and `0` visible day-group count nodes.
