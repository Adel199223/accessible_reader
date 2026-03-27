# ExecPlan: Stage 597 Home Search Glyph Chrome And Sort Caret Softening Reset After Stage 596

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Reduce the remaining March 25, 2026 Recall homepage mismatch by calming the Search glyph chrome and softening visible Sort-caret emphasis.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- No backend, storage, routing, or schema changes.
- No generated-content `Reader` work.

## Acceptance
- The visible Home toolbar stays limited to `Search`, `Add`, `List`, and `Sort`.
- The Search trigger stays recognizable and clickable, but the visible magnifier chrome reads quieter than the Stage 596 baseline.
- The Sort trigger stays recognizable and clickable, but the visible caret emphasis reads softer than the Stage 596 baseline.
- The Stage 563 structural baseline remains intact: selected collection rail, date-grouped canvas, and first-group `Add Content` tile.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check scripts/playwright/stage597_home_search_glyph_chrome_and_sort_caret_softening_reset_after_stage596.mjs scripts/playwright/stage598_post_stage597_home_search_glyph_chrome_and_sort_caret_softening_audit.mjs`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 597 run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the Stage 597/598 touched set

## Outcome
- Complete locally on 2026-03-26.
- The Search trigger kept the Stage 563 poster-led Home structure intact, but the live Stage 597 validation reduced the magnifier chrome to `0.64` border alpha plus `0.64` handle alpha at an `11.19px` square with a `4.31px` handle width.
- The Sort trigger remained readable, but the live Stage 597 validation reduced the caret to `10.88px` at `0.64` opacity while preserving the visible `v` cue.
- Targeted frontend validation, live Windows Edge Stage 597 evidence, and the follow-up Stage 598 audit all passed.
