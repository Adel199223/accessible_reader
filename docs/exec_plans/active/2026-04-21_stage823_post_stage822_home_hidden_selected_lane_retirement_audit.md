# ExecPlan: Stage 823 Post-Stage-822 Home Hidden Selected-Lane Retirement Audit

## Summary
- Audit the Stage 822 follow-through against the exact hidden `Home` path the user surfaced after Stage 821.
- Confirm that both the default collapsed `Home` state and the hidden `Captures` state stay free of a legacy organizer lane, and that the hidden launcher shell no longer behaves like a tall hover target.
- Keep `Graph`, embedded `Notebook`, original-only `Reader`, and `Study` as regression captures while `Home` stays the active reopen.

## Audit Result
- The Stage 823 live Edge audit passed with `runtimeBrowser: msedge`.
- Collapsed `Home` stayed clean in the default hidden state with `homeHiddenCompanionTrackVisible: false`, `homeHiddenBoardStartsAfterLauncher: true`, and `homeOrganizerLauncherTopAnchored: true`.
- The user-reported hidden `Captures` path is now clean too, recording `homeHiddenSelectedCompanionTrackVisible: false`, `homeHiddenSelectedCompanionTrackWidth: 0`, and `homeHiddenSelectedBoardStartsAfterLauncher: true` instead of leaving a dead organizer lane in the middle of the page.
- The hidden launcher shell now records `homeOrganizerLauncherShellCompact: true`, with `homeOrganizerLauncherShellHeight: 79.34375` against `homeOrganizerLauncherButtonHeight: 76.796875`, confirming the hover target is collapsed to the launcher instead of stretching through the lane.
- Earlier Home shell wins stayed intact with `homeVisibleClippingCount: 0`, and regression captures remained stable for embedded `Notebook`, original-only `Reader`, `Graph`, and `Study`, with `notebookOpenWorkbenchVisible: true` and `simplifiedViewAvailable: false`.

## Validation
- `wsl.exe -d Ubuntu bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- --run src/App.test.tsx"`
- `wsl.exe -d Ubuntu bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe -d Ubuntu bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k graph -q"`
- `node --check scripts/playwright/home_rendered_preview_quality_shared.mjs`
- `node --check scripts/playwright/home_organizer_ergonomics_shared.mjs`
- `node --check scripts/playwright/stage822_home_hidden_selected_lane_retirement_after_stage821.mjs`
- `node --check scripts/playwright/stage823_post_stage822_home_hidden_selected_lane_retirement_audit.mjs`
- `node scripts/playwright/stage822_home_hidden_selected_lane_retirement_after_stage821.mjs`
- `node scripts/playwright/stage823_post_stage822_home_hidden_selected_lane_retirement_audit.mjs`
- `git diff --check`
