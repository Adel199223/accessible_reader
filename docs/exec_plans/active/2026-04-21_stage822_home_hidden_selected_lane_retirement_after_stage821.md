# ExecPlan: Stage 822 Home Hidden Selected-Lane Retirement After Stage 821

## Summary
- Keep `Home` as the active high-leverage surface after Stage 820/821 rather than reopening another Reader polish slice.
- Fix the hidden `Home` path the user still surfaced after Stage 821: hidden `Captures` must not reserve a legacy organizer lane or a tall hover-sensitive slab in the middle of the page.
- Keep `Graph`, embedded `Notebook`, original-only `Reader`, and `Study` as regression surfaces only.

## Scope
- Retire the remaining legacy hidden organizer-track class from the selected hidden `Home` path instead of letting it coexist with the newer Stage 820 single-column layout.
- Keep the hidden launcher shell compact to the launcher button instead of leaving a tall hover target through the lane.
- Extend the live Home organizer audit to measure both the default collapsed state and the hidden `Captures` state that the user actually reported.

## Acceptance
- Hidden `Captures` no longer reserves a dead organizer lane or mid-page hover seam.
- The hidden launcher shell stays compact to the top-owned launcher button.
- The hidden board begins immediately beside the launcher lane in both the default collapsed state and the hidden `Captures` state.
- Stage 819 organizer-shell ownership and Stage 820 hidden reopen-shelf behavior remain intact.

## Validation
- targeted `frontend/src/App.test.tsx`
- `frontend/npm run build`
- `backend/tests/test_api.py -k graph -q`
- `node --check` on `scripts/playwright/home_rendered_preview_quality_shared.mjs`
- `node --check` on `scripts/playwright/home_organizer_ergonomics_shared.mjs`
- `node --check` on `scripts/playwright/stage822_home_hidden_selected_lane_retirement_after_stage821.mjs`
- `node --check` on `scripts/playwright/stage823_post_stage822_home_hidden_selected_lane_retirement_audit.mjs`
- Stage 822 live Edge validation
