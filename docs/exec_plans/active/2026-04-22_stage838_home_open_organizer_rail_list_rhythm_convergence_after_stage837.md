# ExecPlan: Stage 838 Home Open Organizer Rail List-Rhythm Convergence After Stage 837

## Summary
- Keep the active high-leverage parity work on organizer-visible `Home`.
- Flatten the remaining panel-heavy selected organizer row so the rail reads like one continuous list instead of a header followed by a stacked mini panel.
- Keep the active preview handoff available, but attach it to the selected row’s own ownership block instead of leaving it as a detached secondary seam.

## Implementation Focus
- Scope the change to organizer-visible open `Home` on the selected-board path, leaving hidden `Home`, hidden `Captures`, hidden `Matches`, and organizer-visible `Matches` as regression surfaces.
- Reduce selected-row padding, border emphasis, count-pill weight, and copy spacing so the active row behaves like a list item with state rather than a card.
- Integrate the active preview handoff into the selected row’s own block, preserve its source handoff behavior, and tighten the organizer header-to-list start without reopening the Stage 820-837 hidden-state or board-surface work.

## Validation
- targeted `frontend/src/App.test.tsx`
- `frontend/npm run build`
- `backend/tests/test_api.py -k graph -q`
- `node --check` on `scripts/playwright/home_organizer_ergonomics_shared.mjs`
- `node --check` on `scripts/playwright/stage838_home_open_organizer_rail_list_rhythm_convergence_after_stage837.mjs`
- `node --check` on `scripts/playwright/stage839_post_stage838_home_open_organizer_rail_list_rhythm_convergence_audit.mjs`
- `node scripts/playwright/stage838_home_open_organizer_rail_list_rhythm_convergence_after_stage837.mjs`
- `node scripts/playwright/stage839_post_stage838_home_open_organizer_rail_list_rhythm_convergence_audit.mjs`
- `git diff --check`
