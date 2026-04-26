# ExecPlan: Stage 828 Home Open Board Above-the-Fold Density Lift After Stage 827

## Summary
- Keep `Home` as the active Recall-parity surface, but shift the focus back to the default organizer-visible board because that is the primary homepage benchmark.
- Densify the open board so the first visible day-group row can fit four tiles across including the `Add content` tile at benchmark desktop width.
- Shorten the `Add content` tile and the source-card family together so more real sources land above the fold without reopening hidden-state or Reader work.

## Scope
- In the default open organizer-visible `Home` overview only, tighten the board grid so the first visible row can render at least four tiles across at the benchmark width.
- Reduce inter-card and inter-group spacing enough that the board reads as a denser working canvas instead of a staged dashboard.
- Demote the `Add content` tile from hero scale to board scale while keeping its action, wording, and supporting copy intact.
- Shorten the open Home poster cards by reducing preview and lower-copy seams together without removing preview fidelity, source labels, or card behavior.
- Preserve the anchored `Search...` / `Add` / `List` / `Sort` toolbar cluster, the Stage 818/819 organizer shell fixes, and the Stage 820-827 hidden-state fixes.

## Acceptance
- The first visible open Home day-group row fits at least four tiles across at benchmark width, counting the `Add content` tile.
- The open `Add content` tile no longer reads as a hero slab relative to the source-card family.
- Open organizer-visible chronology, board/list toggle behavior, collection filtering, and organizer reopen behavior stay unchanged.
- Hidden `Home`, hidden `Captures`, and hidden `Matches` remain green with the Stage 825 and Stage 827 ownership model intact.

## Validation
- targeted `frontend/src/App.test.tsx`
- `frontend/npm run build`
- `backend/tests/test_api.py -k graph -q`
- `node --check` on `scripts/playwright/home_rendered_preview_quality_shared.mjs`
- `node --check` on `scripts/playwright/home_organizer_ergonomics_shared.mjs`
- `node --check` on `scripts/playwright/stage828_home_open_board_above_the_fold_density_lift_after_stage827.mjs`
- `node --check` on `scripts/playwright/stage829_post_stage828_home_open_board_above_the_fold_density_lift_audit.mjs`
- Stage 828 live Edge validation
