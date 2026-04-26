# ExecPlan: Stage 848 Graph Settings Rail Top-Start Deflation and Presets Ownership Convergence After Stage 847

## Summary
- Reopen `Graph` for one more bounded browse-first pass after the Stage 847 opt-in onboarding baseline.
- Flatten the left `Graph Settings` rail so it starts earlier and reads like a working control rail instead of a stacked intro card.
- Keep the graph canvas, top-right utility corner, bottom utility corners, and all Graph View 2.0 behaviors intact.

## Implementation Focus
- In `frontend/src/components/graph/GraphSettingsPanelShell.tsx`, keep the `Graph Settings` title plus hide action while retiring the verbose helper sentence and tightening the header spacing.
- In `frontend/src/components/RecallWorkspace.tsx`, keep `Presets`, `Filters`, and `Groups` as the visible primary sections while demoting the visible preset summary into inline section-owned metadata and shrinking `Save as preset` into a smaller attached secondary action.
- Keep saved-view CRUD hidden behind the existing disclosures, keep the preset draft input hidden until explicitly opened, and preserve all existing search, fit/lock, selection, path, focus-tray, detail-dock, and help-corner behavior.
- Extend `frontend/src/App.test.tsx` plus `scripts/playwright/graph_recall_style_shared.mjs` so the regressions now assert the flatter settings-rail top start and the non-hero preset action treatment.

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

## Outcome
- `Graph Settings` now starts earlier without the old helper sentence, while the hide action and collapsed-launcher behavior stay unchanged.
- `Presets` now owns the active-view summary inline, and `Save as preset` reads as a smaller attached secondary action instead of a full-width hero control.
- Graph browse behavior stayed intact: search, fit/lock, presets, filters, groups, focus tray, detail dock, path exploration, and help-corner onboarding all remained unchanged.

## Implementation Evidence
- `frontend/src/components/graph/GraphSettingsPanelShell.tsx` retired the verbose header helper copy and tightened header spacing.
- `frontend/src/components/RecallWorkspace.tsx` moved the active preset summary inline and demoted `Save as preset` into the attached secondary-action seam while keeping the draft input hidden until explicitly opened.
- `frontend/src/index.css` tightened the settings-rail top start and added the flatter preset-summary plus secondary-action treatments.
- `frontend/src/App.test.tsx` and `scripts/playwright/graph_recall_style_shared.mjs` now assert the flatter rail start and non-hero preset action treatment.
