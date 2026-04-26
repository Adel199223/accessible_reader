# ExecPlan: Stage 847 Post-Stage-846 Graph Default-Open Tour Retirement and Help-Corner Opt-In Audit

## Summary
- Audit the Stage 846 Graph onboarding correction against the remaining Recall-parity mismatch in the default open Graph experience.
- Confirm that Graph now opens directly into its working state with visible help controls instead of a blocking welcome modal.
- Keep `Home`, embedded `Notebook`, original-only `Reader`, and `Study` as regression captures beneath the refreshed Graph baseline.

## Audit Result
- Passed.
- Graph now opens unobscured, with the left settings sidebar, top-right control seam, bottom-left count pill, and bottom-right help controls visible at rest before the user starts the tour.
- The existing multi-step `Graph View tour` remains available as an explicit opt-in flow: first-run `Take Graph tour`, then `Replay Graph tour` after close or completion.
- `Home`, embedded `Notebook`, original-only `Reader`, and `Study` stayed stable in the same live validation run.

## Validation
- targeted `frontend/src/App.test.tsx`
- targeted `frontend/src/components/RecallWorkspace.stage37.test.tsx`
- targeted `frontend/src/lib/appRoute.test.ts`
- `frontend/npm run build`
- `backend/tests/test_api.py -k graph -q`
- `node --check` on `scripts/playwright/graph_recall_style_shared.mjs`
- `node --check` on `scripts/playwright/stage846_graph_default_open_tour_retirement_and_help_corner_opt_in_after_stage845.mjs`
- `node --check` on `scripts/playwright/stage847_post_stage846_graph_default_open_tour_retirement_and_help_corner_opt_in_audit.mjs`
- `node scripts/playwright/stage846_graph_default_open_tour_retirement_and_help_corner_opt_in_after_stage845.mjs`
- `node scripts/playwright/stage847_post_stage846_graph_default_open_tour_retirement_and_help_corner_opt_in_audit.mjs`
- `git diff --check`

## Audit Evidence
- Live browser audit metrics recorded `tourVisibleOnOpen: false`, `graphHelpControlsVisibleAtRest: true`, `graphTourEntryLabel: Take Graph tour`, and `graphCanvasObscuredByTourOnOpen: false`.
- The same run confirmed that the explicit tour path still works with `helpControlsVisibleAfterDismiss: true`, `graphTourEntryLabelAfterDismiss: Replay Graph tour`, and the full `tourSequence` intact.
- Cross-surface stability stayed green with `homeVisibleClippingCount: 0`, `notebookOpenWorkbenchVisible: true`, `simplifiedViewAvailable: false`, and `runtimeBrowser: msedge`.
