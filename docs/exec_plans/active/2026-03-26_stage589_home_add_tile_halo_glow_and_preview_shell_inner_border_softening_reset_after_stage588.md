# ExecPlan: Stage 589 Home Add-Tile Halo Glow And Preview-Shell Inner Border Softening Reset After Stage 588

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Reduce the remaining March 25, 2026 Recall homepage mismatch by calming the `Add Content` tile halo glow and softening the preview shell's inner border.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- No backend, storage, routing, or schema changes.
- No generated-content `Reader` work.

## Acceptance
- The visible Home toolbar stays limited to `Search`, `Add`, `List`, and `Sort`.
- The `Add Content` tile remains visible and first in the leading day group, but the halo glow around the plus-mark reads calmer than the Stage 588 baseline.
- Board cards remain poster-led and source-aware, but the preview shell's inner border reads softer than the Stage 588 baseline.
- The Stage 563 structural baseline remains intact: selected collection rail, date-grouped canvas, and first-group `Add Content` tile.

## Validation
- `npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx`
- `npm run lint`
- `npm run build`
- `node --check scripts/playwright/stage589_home_add_tile_halo_glow_and_preview_shell_inner_border_softening_reset_after_stage588.mjs scripts/playwright/stage590_post_stage589_home_add_tile_halo_glow_and_preview_shell_inner_border_softening_audit.mjs`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 589 run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the Stage 589/590 touched set

## Outcome
- Complete locally on 2026-03-26.
- The `Add Content` tile kept the Stage 563 position and label, but the live Stage 589 validation reduced the halo glow to a maximum `0.11` alpha inside the radial background.
- The preview shell remained poster-led and source-aware, but the live Stage 589 validation reduced the inner border to `rgba(255, 255, 255, 0.035)` while preserving the current `13px` radius.
- Targeted frontend validation, live Windows Edge Stage 589 evidence, and the follow-up Stage 590 audit all passed.
