# ExecPlan: Stage 821 Post-Stage-820 Home Hidden-State Dead Lane Retirement Audit

## Summary
- Audit the Stage 820 Home hidden-state follow-through against the live issue reported from the current app.
- Confirm that collapsed Home no longer reserves the dead companion lane, that nearby reopen content stays inline above the board, and that the Stage 819 organizer-shell ownership fixes remain intact.
- Keep `Graph`, embedded `Notebook`, original-only `Reader`, and `Study` as regression captures while `Home` stays the active reopen.

## Audit Result
- The Stage 821 live Edge audit passed with `runtimeBrowser: msedge`.
- Collapsed Home now records `homeHiddenCompanionTrackVisible: false`, `homeHiddenCompanionTrackWidth: 16.359375`, `homeHiddenBoardLeadOffset: 16.359375`, and `homeHiddenBoardStartsAfterLauncher: true`, clearing the dead-lane and stray-seam issue in hidden state.
- The hidden reopen cluster now records `homeHiddenReopenClusterInline: true` with `homeHiddenReopenClusterPresent: true`, confirming that nearby `Continue / Next source` support stays inline above the board instead of reading like a side rail.
- The earlier Stage 819 organizer-shell ownership wins stayed intact: `homeOrganizerHeaderOverlapDetected: false`, `homeOrganizerLauncherTopAnchored: true`, `homeOrganizerListTopAnchored: true`, and `homeVisibleClippingCount: 0`.
- Regression captures remained stable for `Graph`, embedded `Notebook`, original-only `Reader`, and `Study`, with `notebookOpenWorkbenchVisible: true` and `simplifiedViewAvailable: false`.

## Validation
- `wsl.exe -d Ubuntu bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- --run src/App.test.tsx"`
- `wsl.exe -d Ubuntu bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe -d Ubuntu bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k graph -q"`
- `node --check scripts/playwright/home_organizer_ergonomics_shared.mjs`
- `node --check scripts/playwright/stage820_home_hidden_state_dead_lane_retirement_after_stage819.mjs`
- `node --check scripts/playwright/stage821_post_stage820_home_hidden_state_dead_lane_retirement_audit.mjs`
- `node scripts/playwright/stage820_home_hidden_state_dead_lane_retirement_after_stage819.mjs`
- `node scripts/playwright/stage821_post_stage820_home_hidden_state_dead_lane_retirement_audit.mjs`
- `git diff --check`
