# ExecPlan: Stage 819 Post-Stage-818 Home Organizer Shell Reopen And Ownership Correction Audit

## Summary
- Audit the Stage 818 Home organizer shell reopen against the March 25, 2026 Recall homepage benchmark and the newer live issues reported from the current app.
- Confirm that the organizer header now owns its chrome, the collapsed launcher stays top anchored, and the organizer list begins directly under the header.
- Keep `Graph`, embedded `Notebook`, original-only `Reader`, and `Study` as regression captures while `Home` stays the active reopen.

## Audit Result
- The Stage 819 live Edge audit passed with `runtimeBrowser: msedge`.
- The open organizer now records `homeOrganizerHeaderOverlapDetected: false`, `homeOrganizerHeaderSafeInsetLeft: 8.671875`, `homeOrganizerHeaderSafeInsetTop: 13.859375`, and `homeOrganizerHeaderActionGap: 102.796875`, clearing the title/chrome ownership issue.
- The collapsed organizer now records `homeOrganizerLauncherTopAnchored: true` with `homeOrganizerLauncherTopOffset: 2.546875`.
- The organizer list now records `homeOrganizerListTopAnchored: true` with `homeOrganizerListTopGap: 4.46875`.
- The calmer Stage 696/697 seam and clipping outcomes stayed intact: `homeOrganizerSeamQuietAtRest: true`, `homeResizeGripOpacityAtRest: 0.14`, `homeResizeGripHoverOpacity: 0.82`, and `homeVisibleClippingCount: 0`.
- Regression captures remained stable for `Graph`, embedded `Notebook`, original-only `Reader`, and `Study`, with `notebookOpenWorkbenchVisible: true` and `simplifiedViewAvailable: false`.

## Validation
- `wsl.exe -d Ubuntu bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- --run src/App.test.tsx"`
- `wsl.exe -d Ubuntu bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe -d Ubuntu bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k graph -q"`
- `node --check scripts/playwright/home_organizer_ergonomics_shared.mjs`
- `node --check scripts/playwright/stage818_home_organizer_shell_reopen_and_ownership_correction_after_stage817.mjs`
- `node --check scripts/playwright/stage819_post_stage818_home_organizer_shell_reopen_and_ownership_correction_audit.mjs`
- `node scripts/playwright/stage818_home_organizer_shell_reopen_and_ownership_correction_after_stage817.mjs`
- `node scripts/playwright/stage819_post_stage818_home_organizer_shell_reopen_and_ownership_correction_audit.mjs`
- `git diff --check`
