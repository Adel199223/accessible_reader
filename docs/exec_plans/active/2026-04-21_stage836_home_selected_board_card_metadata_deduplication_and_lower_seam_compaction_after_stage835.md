# ExecPlan: Stage 836 Home Selected-Board Card Metadata Deduplication And Lower-Seam Compaction After Stage 835

## Summary
- Keep `Home` as the active Recall-parity surface and stay on the organizer-visible default open selected board.
- Remove the repeated lower collection chip from selected-board cards because the board already communicates the active collection.
- Keep the source row visible under the title while tightening the lower seam so the card wall reads lighter without reopening hidden-state work or changing `Matches`.

## Scope
- Apply the change only to the organizer-visible selected-board card path in `frontend/src/components/RecallWorkspace.tsx`.
- Preserve poster previews, titles, click behavior, day grouping, chronology, the Stage 829 density lift, the Stage 830 shared top band, the Stage 832 single-row toolbar, and the Stage 834 continuation carry.
- Leave organizer-visible open `Matches`, hidden `Home`, hidden `Captures`, hidden `Matches`, open list view, `Graph`, embedded `Notebook`, original-only `Reader`, and `Study` as regression surfaces only.

## Acceptance
- Organizer-visible selected-board cards no longer render the repeated lower collection chip.
- Organizer-visible selected-board cards still render the quieter source row directly under the title.
- Organizer-visible open `Matches` keeps its chip-based card metadata treatment.
- No backend, route, schema, Reader, or hidden-state behavior changes are introduced.

## Validation
- targeted `frontend/src/App.test.tsx`
- `frontend/npm run build`
- `backend/tests/test_api.py -k graph -q`
- `node --check` on `scripts/playwright/home_organizer_ergonomics_shared.mjs`
- `node --check` on `scripts/playwright/stage836_home_selected_board_card_metadata_deduplication_and_lower_seam_compaction_after_stage835.mjs`
- `node --check` on `scripts/playwright/stage837_post_stage836_home_selected_board_card_metadata_deduplication_and_lower_seam_compaction_audit.mjs`
- Stage 836 live browser validation
