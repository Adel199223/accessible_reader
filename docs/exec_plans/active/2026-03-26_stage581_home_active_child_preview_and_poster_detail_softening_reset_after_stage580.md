# ExecPlan: Stage 581 Home Active Child-Preview And Poster Detail Softening Reset After Stage 580

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Reduce the remaining Recall homepage mismatch by calming the active child-preview chrome in the rail and softening the poster detail lines inside card previews.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- No backend, storage, routing, or schema changes.
- No generated-content `Reader` work.

## Acceptance
- The visible Home toolbar stays limited to `Search`, `Add`, `List`, and `Sort`.
- The active child-preview row remains visible and attached to the active collection, but its chrome reads quieter than the Stage 580 baseline.
- Poster detail lines remain visible and source-aware, but both the top-right detail text and lower poster note line read calmer than the Stage 580 baseline.
- The Stage 563 structural baseline remains intact: selected collection rail, date-grouped canvas, and first-group `Add Content` tile.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check scripts/playwright/stage581_home_active_child_preview_and_poster_detail_softening_reset_after_stage580.mjs scripts/playwright/stage582_post_stage581_home_active_child_preview_and_poster_detail_softening_audit.mjs`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 581 run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the Stage 581/582 touched set

## Outcome
- Complete.
- The active child-preview row now reads quieter than the Stage 580 baseline while staying attached to the active collection and preserving the Stage 563 structure.
- Poster detail lines now remain visible and source-aware while reading calmer than the Stage 580 baseline.
- Live Stage 581 Edge evidence recorded `Captures` as the active rail label, `Local captures` as the active selected-row support text, `Captures collection canvas` as the active canvas aria-label, child-preview styling at `9.6px` with `rgba(190, 205, 229, 0.48)`, child-preview mark styling at `3.83px` with `rgba(169, 184, 209, 0.32)`, preview detail styling at `8.96px` with `rgba(219, 227, 240, 0.62)` for `Local capture`, preview note styling at `8.32px` with `rgba(214, 224, 239, 0.54)` for `Saved locally`, and `0` visible day-group count nodes.
