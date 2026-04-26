# ExecPlan: Stage 827 Post-Stage-826 Home Hidden Reopen Shelf Strip Compaction Audit

## Summary
- Audit the Stage 826 follow-through against the remaining hidden `Home` reopen-shelf parity gap after Stage 825.
- Confirm that collapsed Home no longer lets the tall `Next source / Nearby` reopen shelf take over the top of the canvas in overview, hidden `Captures`, or hidden `Matches`.
- Keep `Graph`, embedded `Notebook`, original-only `Reader`, and `Study` as regression captures while `Home` stays the active reopen.

## Audit Result
- The Stage 827 live Edge audit passed with `runtimeBrowser: msedge`.
- Collapsed hidden `Home` overview now keeps a compact attached reopen strip rather than the older tall shelf, recording `homeHiddenReopenStripCompact: true`, `homeHiddenReopenLeadCardVisible: false`, `homeHiddenReopenNearbyGridVisible: false`, and `homeHiddenReopenDisclosureInline: true`.
- The hidden `Captures` path follows that same compact strip model, recording `homeHiddenSelectedReopenStripCompact: true`, `homeHiddenSelectedReopenLeadCardVisible: false`, and `homeHiddenSelectedReopenNearbyGridVisible: false`.
- On the current live dataset, hidden `Matches` no longer revives the old shelf and reserves no extra reopen slab when the filtered results offer no continuation surface, recording `homeHiddenMatchesReopenStripCompact: false`, `homeHiddenMatchesReopenLeadCardVisible: false`, and `homeHiddenMatchesReopenNearbyGridVisible: false`.
- The earlier hidden-state ownership fixes stayed intact with `homeHiddenControlDeckVisible: false`, `homeHiddenControlSeamVisible: false`, `homeHiddenBoardToolbarVisible: true`, `homeHiddenBoardToolbarButtonLabels: Search saved sources / Add / New note / List / Sort`, `homeHiddenOrganizerControlsInlineVisible: false`, `homeHiddenCompanionTrackVisible: false`, `homeHiddenBoardStartsAfterLauncher: true`, `homeHiddenSelectedCompanionTrackVisible: false`, `homeHiddenSelectedBoardStartsAfterLauncher: true`, `homeHiddenMatchesCompanionTrackVisible: false`, `homeHiddenMatchesBoardStartsAfterLauncher: true`, `homeOrganizerLauncherTopAnchored: true`, and `homeVisibleClippingCount: 0`.
- Regression captures remained stable for `Graph`, embedded `Notebook`, original-only `Reader`, and `Study`, with `notebookOpenWorkbenchVisible: true` and `simplifiedViewAvailable: false`.

## Validation
- `wsl.exe -d Ubuntu bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- --run src/App.test.tsx"`
- `wsl.exe -d Ubuntu bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe -d Ubuntu bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k graph -q"`
- `node --check scripts/playwright/home_rendered_preview_quality_shared.mjs`
- `node --check scripts/playwright/home_organizer_ergonomics_shared.mjs`
- `node --check scripts/playwright/stage826_home_hidden_reopen_shelf_strip_compaction_after_stage825.mjs`
- `node --check scripts/playwright/stage827_post_stage826_home_hidden_reopen_shelf_strip_compaction_audit.mjs`
- `node scripts/playwright/stage826_home_hidden_reopen_shelf_strip_compaction_after_stage825.mjs`
- `node scripts/playwright/stage827_post_stage826_home_hidden_reopen_shelf_strip_compaction_audit.mjs`
- `git diff --check`
