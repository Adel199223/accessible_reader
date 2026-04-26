# ExecPlan: Stage 834 Home Open Board Continuation Fill And Footer Pushdown After Stage 833

## Summary
- Keep `Home` as the active Recall-parity surface and stay on the organizer-visible default open board.
- Extend the selected open-board continuation carry so more real source cards render before the footer instead of letting `Show all captures` arrive while the first viewport still has room.
- Preserve the Stage 829 density lift plus the Stage 830 and 832 shared top-band and single-row utility-cluster gains while pushing the continuation footer below the first benchmark viewport.

## Scope
- Increase the visible selected-section carry for the organizer-visible open selected-collection board path in `frontend/src/components/RecallWorkspace.tsx`.
- Keep chronology by day, keep `Add content` as the first tile in the first visible day group, and keep the Stage 829 shorter card family intact.
- Preserve hidden `Home`, hidden `Captures`, hidden `Matches`, open `Matches`, open list view, `Graph`, embedded `Notebook`, original-only `Reader`, and `Study` as regression surfaces only.
- Keep the footer action as the continuation control; this pass changes when it arrives, not whether it exists.

## Acceptance
- The organizer-visible open selected board now carries materially more real document tiles before the continuation footer appears.
- `Show all captures` no longer appears above the first benchmark viewport on the Stage 833 desktop baseline and live dataset.
- The shared lead band, single-row utility cluster, four-across first row, and shorter Add plus poster-card heights remain intact.
- No backend, route, schema, Reader, or hidden-state behavior changes are introduced.

## Validation
- targeted `frontend/src/App.test.tsx`
- `frontend/npm run build`
- `backend/tests/test_api.py -k graph -q`
- `node --check` on `scripts/playwright/home_organizer_ergonomics_shared.mjs`
- `node --check` on `scripts/playwright/stage834_home_open_board_continuation_fill_and_footer_pushdown_after_stage833.mjs`
- `node --check` on `scripts/playwright/stage835_post_stage834_home_open_board_continuation_fill_and_footer_pushdown_audit.mjs`
- Stage 834 live browser validation
