# ExecPlan: Stage 653 Home Poster Differentiation And Parity Closeout Reset After Stage 652

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Broaden the March 25, 2026 Recall homepage closeout work beyond lower-card micro-trims by making `Home` posters read less blank and less samey at page scale.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- No backend, storage, routing, schema, or type changes.
- No shell, rail, toolbar, board-width, add-tile, or lower-card structural changes.
- No generated-content `Reader` work.

## Acceptance
- Representative cards stay inside the current Stage 615 width cadence and compact height band.
- The Stage 652 lower title/source/chip seam stays intact while paste, web, and file/document cards gain clearer source-aware poster differentiation.
- Home previews expose visible hero text inside the poster layer for representative paste, web, and file/document cards.
- The first visible day group shows multiple distinct preview accent treatments instead of reading as one repeated poster block.
- The Stage 617 earlier board start, the Stage 619 canvas restraint, and the Stage 563 structural baseline remain intact.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check scripts/playwright/stage653_home_poster_differentiation_and_parity_closeout_reset_after_stage652.mjs scripts/playwright/stage654_post_stage653_home_poster_differentiation_and_parity_closeout_audit.mjs`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 653 run against the repo-owned launcher path `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the Stage 653/654 touched set

## Outcome
- Complete locally after the Stage 653 implementation pass and Stage 654 audit.
- The pass keeps the Stage 563 selected-collection rail plus day-grouped Home canvas intact and broadens the March 25, 2026 Recall homepage closeout work beyond lower-card micro-trims by making paste, web, and file/document posters feel less blank and less samey at wide-desktop scale.
- Live Edge evidence recorded `3` distinct preview accent glows in the first visible day group, a visible representative poster hero text node (`Stage13 Debug 17734823183…`), preserved `352px` representative card width, preserved `203.52px` representative card height, preserved the Stage 617 `90.98px` heading top offset plus `115.36px` first-row grid top offset, and preserved the settled Stage 652 lower-seam band at a `0.5536` preview ratio and `0.3226` copy ratio.
- `Graph` and original-only `Reader` remain the regression surfaces for the subsequent Stage 654 audit.
