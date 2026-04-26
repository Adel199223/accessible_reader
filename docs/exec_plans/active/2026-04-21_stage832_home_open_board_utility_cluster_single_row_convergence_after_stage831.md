# ExecPlan: Stage 832 Home Open Board Utility Cluster Single-Row Convergence After Stage 831

## Summary
- Keep `Home` as the active Recall-parity surface and stay on the organizer-visible open board.
- Remove the remaining dedicated second toolbar row so `List` and `Sort` no longer hang beneath `Search` / `Add` / `New note` at benchmark desktop width.
- Preserve the Stage 829 density lift and the Stage 830 shared top band while extending the same single-row board-toolbar model to organizer-visible open `Matches`.

## Scope
- In organizer-visible open `Home` board mode, converge `Search`, `Add`, `New note`, `List`, and `Sort` into one real utility row instead of a stacked primary-plus-secondary toolbar.
- Keep the first visible day header and the utility cluster in one shared lead band on the selected-collection board.
- Apply the same single-row board-toolbar treatment to organizer-visible open `Matches` in the Stage 563 canvas path.
- Leave hidden `Home`, hidden `Captures`, hidden `Matches`, open list view, `Graph`, embedded `Notebook`, original-only `Reader`, and `Study` as regression surfaces only.

## Acceptance
- Organizer-visible open `Home` board mode keeps the first visible day header and the full utility cluster on one shared lead band.
- `List` and `Sort` no longer occupy a dedicated second toolbar row at the benchmark desktop width.
- Organizer-visible open `Matches` uses the same single-row board-toolbar model.
- The Stage 829 density lift, organizer ownership, hidden-state ownership fixes, and cross-surface regressions stay intact.

## Validation
- targeted `frontend/src/App.test.tsx`
- `frontend/npm run build`
- `backend/tests/test_api.py -k graph -q`
- `node --check` on `scripts/playwright/home_organizer_ergonomics_shared.mjs`
- `node --check` on `scripts/playwright/stage832_home_open_board_utility_cluster_single_row_convergence_after_stage831.mjs`
- `node --check` on `scripts/playwright/stage833_post_stage832_home_open_board_utility_cluster_single_row_convergence_audit.mjs`
- Stage 832 live browser validation
