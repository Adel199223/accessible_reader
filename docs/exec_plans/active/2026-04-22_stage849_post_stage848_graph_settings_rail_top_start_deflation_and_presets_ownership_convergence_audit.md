# ExecPlan: Stage 849 Post-Stage-848 Graph Settings Rail Top-Start Deflation and Presets Ownership Convergence Audit

## Summary
- Audit the Stage 848 Graph settings-rail deflation against the remaining Recall-parity mismatch in the default open Graph experience.
- Confirm that the left settings rail now starts earlier, no longer carries the verbose helper copy, and no longer gives the preset save affordance hero-style weight.
- Keep `Home`, embedded `Notebook`, original-only `Reader`, and `Study` as regression captures beneath the refreshed Graph baseline.

## Validation
- targeted `frontend/src/App.test.tsx`
- `frontend/npm run build`
- `backend/tests/test_api.py -k graph -q`
- `node --check` on `scripts/playwright/graph_recall_style_shared.mjs`
- `node --check` on `scripts/playwright/stage848_graph_settings_rail_top_start_deflation_and_presets_ownership_convergence_after_stage847.mjs`
- `node --check` on `scripts/playwright/stage849_post_stage848_graph_settings_rail_top_start_deflation_and_presets_ownership_convergence_audit.mjs`
- `node scripts/playwright/stage848_graph_settings_rail_top_start_deflation_and_presets_ownership_convergence_after_stage847.mjs`
- `node scripts/playwright/stage849_post_stage848_graph_settings_rail_top_start_deflation_and_presets_ownership_convergence_audit.mjs`
- `git diff --check`

## Audit Result
- Passed. The docked Graph settings rail now starts earlier and no longer reads like an intro card while the Stage 847 canvas-first default-open baseline stays intact.
- Key audit metrics:
  - `graphSettingsHeaderHelperVisible: false`
  - `graphSettingsHeaderToFirstSectionGap: 16`
  - `graphSettingsPresetPrimaryActionFullWidth: false`
  - `graphSettingsPresetSummaryInline: true`
  - `graphSettingsRailTopStartCompact: true`
  - `tourVisibleOnOpen: false`
  - `graphHelpControlsVisibleAtRest: true`
  - `graphTourEntryLabel: Take Graph tour`
  - `graphTourEntryLabelAfterDismiss: Replay Graph tour`
  - `graphCanvasObscuredByTourOnOpen: false`
  - `notebookOpenWorkbenchVisible: true`
  - `studyVisible: true`
  - `runtimeBrowser: msedge`

## Regression Note
- The same live audit kept the default open `Home` board, embedded `Notebook`, original-only `Reader`, and `Study` stable while Graph absorbed the rail-deflation pass.
