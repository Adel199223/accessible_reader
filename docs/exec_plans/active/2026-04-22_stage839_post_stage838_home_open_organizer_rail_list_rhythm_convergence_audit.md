# ExecPlan: Stage 839 Post-Stage-838 Home Open Organizer Rail List-Rhythm Convergence Audit

## Summary
- Audit the Stage 838 organizer-rail convergence against the remaining open-Home parity gap on the organizer-visible default board.
- Confirm that the active selected row now reads as one flatter list-owned item instead of a panel-like button with a detached preview seam.
- Keep open-board density, top-band, utility-cluster, footer, and selected-card metadata deduplication intact while hidden `Home`, open `Matches`, `Graph`, embedded `Notebook`, original-only `Reader`, and `Study` stay regression captures.

## Audit Result
- Passed on April 22, 2026 in live Windows Edge (`runtimeBrowser: msedge`) against `http://127.0.0.1:8000`.
- The active organizer row now reads as one flatter list-owned item: `homeOrganizerActivePreviewDetached: false`, `homeOrganizerActivePreviewHandoffVisible: true`, `homeOrganizerActiveRowHeight: 55.734375`, and `homeOrganizerActiveRowPanelChromeVisible: false`.
- The organizer rail now starts materially earlier without overlap regressions: `homeOrganizerHeaderToFirstRowGap: 2.5625`, `homeOrganizerListTopAnchored: true`, and `homeOrganizerHeaderOverlapDetected: false`.
- The broader Home open-board baseline stayed intact in the same audit: `homeOpenOverviewLeadBandSharedRow: true`, `homeOpenOverviewToolbarSingleRow: true`, `homeOpenOverviewFooterVisibleAboveFold: false`, `homeOpenOverviewCollectionChipVisible: false`, and `homeVisibleClippingCount: 0`.
- Cross-surface regressions stayed green in the same run: `graphVisible: true`, `notebookOpenWorkbenchVisible: true`, `simplifiedViewAvailable: false`, and `studyVisible: true`.

## Validation
- targeted `frontend/src/App.test.tsx`
- `frontend/npm run build`
- `backend/tests/test_api.py -k graph -q`
- `node --check` on `scripts/playwright/home_organizer_ergonomics_shared.mjs`
- `node --check` on `scripts/playwright/stage838_home_open_organizer_rail_list_rhythm_convergence_after_stage837.mjs`
- `node --check` on `scripts/playwright/stage839_post_stage838_home_open_organizer_rail_list_rhythm_convergence_audit.mjs`
- `node scripts/playwright/stage838_home_open_organizer_rail_list_rhythm_convergence_after_stage837.mjs`
- `node scripts/playwright/stage839_post_stage838_home_open_organizer_rail_list_rhythm_convergence_audit.mjs`
- `git diff --check`
