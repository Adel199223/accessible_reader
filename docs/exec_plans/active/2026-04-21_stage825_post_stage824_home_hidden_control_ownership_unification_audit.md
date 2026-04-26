# ExecPlan: Stage 825 Post-Stage-824 Home Hidden Control Ownership Unification Audit

## Summary
- Audit the Stage 824 follow-through against the remaining hidden `Home` ownership gap after Stage 823.
- Confirm that collapsed Home no longer splits control ownership between a hidden organizer slab and the board toolbar across overview, hidden `Captures`, and hidden `Matches`.
- Keep `Graph`, embedded `Notebook`, original-only `Reader`, and `Study` as regression captures while `Home` stays the active reopen.

## Audit Result
- The Stage 825 live Edge audit passed with `runtimeBrowser: msedge`.
- Collapsed hidden `Home` overview stayed board-first with `homeHiddenControlDeckVisible: false`, `homeHiddenControlSeamVisible: false`, `homeHiddenBoardToolbarVisible: true`, `homeHiddenBoardToolbarButtonLabels: Search saved sources / Add / New note / List / Sort`, and `homeHiddenOrganizerControlsInlineVisible: false`.
- The hidden `Captures` path stayed on that same ownership model, recording `homeHiddenSelectedControlDeckVisible: false`, `homeHiddenSelectedControlSeamVisible: false`, `homeHiddenSelectedBoardToolbarVisible: true`, `homeHiddenSelectedBoardToolbarButtonLabels: Search saved sources / Add / New note / List / Sort`, and `homeHiddenSelectedOrganizerControlsInlineVisible: false`.
- Hidden `Matches` now follows the same board-owned toolbar treatment instead of reviving organizer chrome, recording `homeHiddenMatchesControlDeckVisible: false`, `homeHiddenMatchesControlSeamVisible: false`, `homeHiddenMatchesBoardToolbarVisible: true`, `homeHiddenMatchesBoardToolbarButtonLabels: Search saved sources / Add / New note / List / Sort`, and `homeHiddenMatchesOrganizerControlsInlineVisible: false`.
- Earlier Home shell and hidden-lane wins stayed intact with `homeHiddenCompanionTrackVisible: false`, `homeHiddenSelectedCompanionTrackVisible: false`, `homeHiddenMatchesCompanionTrackVisible: false`, `homeOrganizerLauncherTopAnchored: true`, `homeOrganizerLauncherShellCompact: true`, `homeOrganizerListTopAnchored: true`, and `homeVisibleClippingCount: 0`.
- Regression captures remained stable for `Graph`, embedded `Notebook`, original-only `Reader`, and `Study`, with `notebookOpenWorkbenchVisible: true` and `simplifiedViewAvailable: false`.

## Validation
- `wsl.exe -d Ubuntu bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- --run src/App.test.tsx"`
- `wsl.exe -d Ubuntu bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe -d Ubuntu bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k graph -q"`
- `node --check scripts/playwright/home_rendered_preview_quality_shared.mjs`
- `node --check scripts/playwright/home_organizer_ergonomics_shared.mjs`
- `node --check scripts/playwright/stage824_home_hidden_control_ownership_unification_after_stage823.mjs`
- `node --check scripts/playwright/stage825_post_stage824_home_hidden_control_ownership_unification_audit.mjs`
- `node scripts/playwright/stage824_home_hidden_control_ownership_unification_after_stage823.mjs`
- `node scripts/playwright/stage825_post_stage824_home_hidden_control_ownership_unification_audit.mjs`
- `git diff --check`
