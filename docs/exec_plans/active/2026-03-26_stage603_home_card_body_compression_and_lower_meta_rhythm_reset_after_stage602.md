# ExecPlan: Stage 603 Home Card-Body Compression And Lower-Meta Rhythm Reset After Stage 602

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Reduce the remaining March 25, 2026 Recall homepage mismatch by compressing the lower portion of the cards beneath the poster and calming the lower meta seam.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- No backend, storage, routing, or schema changes.
- No toolbar, grouping, or organizer-behavior changes.
- No generated-content `Reader` work.

## Acceptance
- The visible Home toolbar stays limited to `Search`, `Add`, `List`, and `Sort`.
- The first-row `Add Content` tile lands shorter than the Stage 602 baseline.
- Representative board cards land shorter and denser than the Stage 602 baseline without losing the poster-led hierarchy.
- The title, source row, and collection chip remain visible, but their lower seam reads calmer than the Stage 602 baseline.
- The Stage 563 structural baseline remains intact: selected collection rail, date-grouped canvas, first-group `Add Content` tile, and current source-aware card treatments.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check scripts/playwright/stage603_home_card_body_compression_and_lower_meta_rhythm_reset_after_stage602.mjs scripts/playwright/stage604_post_stage603_home_card_body_compression_and_lower_meta_rhythm_audit.mjs`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 603 run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the Stage 603/604 touched set

## Outcome
- Complete locally on 2026-03-26.
- The Home board kept the Stage 563 selected-collection rail and day-grouped canvas intact, but the live Stage 603 validation reduced the first-row `Add Content` tile and representative board-card height to `203.52px` while preserving the poster-led hierarchy.
- The lower card seam stayed present, but the live Stage 603 validation tightened shell spacing to `7.36px` top/bottom padding with a `4.16px` row gap, reduced the title seam to `13.44px` at `680` weight with `14.5152px` line height, reduced the source seam to `9.76px` at `rgba(190, 205, 229, 0.56)`, and reduced the collection chip to `7.04px` at `rgba(202, 214, 235, 0.38)`.
- Targeted frontend validation, live Windows Edge Stage 603 evidence, and the follow-up Stage 604 audit all passed.
