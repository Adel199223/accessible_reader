# ExecPlan: Stage 826 Home Hidden Reopen Shelf Strip Compaction After Stage 825

## Summary
- Keep `Home` as the active high-leverage Recall-parity surface after Stage 824/825 instead of reopening another Reader micro-polish slice.
- Replace the tall hidden `Next source / Nearby` shelf with one thin board-owned strip so collapsed Home feels attached to the board instead of front-loaded by a large reopen slab.
- Keep `Graph`, embedded `Notebook`, original-only `Reader`, and `Study` as regression surfaces only.

## Scope
- In hidden `Home` only, replace the existing full pinned reopen shelf with a compact attached strip rendered directly under the board toolbar.
- Apply the same compact strip model across collapsed overview, hidden selected-group, and hidden `Matches`.
- Retire the large lead card and always-visible nearby grid from the hidden at-rest state while keeping nearby sources available through an inline disclosure inside the same strip.
- Preserve the current reopen data model and destinations, keep the top-anchored launcher unchanged, and leave open-organizer `Home` behavior out of scope.
- Extend the live Home audit to assert that hidden reopen ownership is now compact and board-first across the three loaded hidden paths.

## Acceptance
- Hidden overview, hidden `Captures`, and hidden `Matches` all show a compact `Pinned reopen strip` directly under the board toolbar when next-source data exists.
- Hidden at-rest `Home` no longer renders the old lead card or always-visible nearby grid.
- Nearby sources expand inline from the strip instead of reopening a side shelf or side rail.
- Stage 824/825 hidden toolbar ownership, top-anchored launcher, and no-dead-lane behavior remain intact.

## Validation
- targeted `frontend/src/App.test.tsx`
- `frontend/npm run build`
- `backend/tests/test_api.py -k graph -q`
- `node --check` on `scripts/playwright/home_rendered_preview_quality_shared.mjs`
- `node --check` on `scripts/playwright/home_organizer_ergonomics_shared.mjs`
- `node --check` on `scripts/playwright/stage826_home_hidden_reopen_shelf_strip_compaction_after_stage825.mjs`
- `node --check` on `scripts/playwright/stage827_post_stage826_home_hidden_reopen_shelf_strip_compaction_audit.mjs`
- Stage 826 live Edge validation
