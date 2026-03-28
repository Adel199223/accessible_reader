# ExecPlan: Stage 688 Graph Idle-Chrome Recall-Parity Compression After Stage 687

## Summary
- Reopen `Graph` for one bounded idle-state pass after the completed Stage 686/687 chrome tightening.
- Keep this slice `Graph`-only and idle-state focused: preserve the Stage 684 canvas/tour baseline, the Stage 686 selected/path workflows, backend graph contracts, and the current `Home` plus original-only `Reader` regression baselines.
- Use the March 26, 2026 Recall Graph screenshots as the benchmark again, but target the remaining mismatch in the idle settings rail, icon hierarchy, and canvas utility positioning rather than reopening selected-state workflow design.

## Scope
- Update continuity so Stage 688 becomes the active checkpoint and Stage 689 becomes the paired audit.
- Compress the left settings rail:
  - keep it docked open by default with visible `Presets`, `Filters`, and `Groups`
  - remove the visible status row under the `Graph Settings` header
  - shorten the helper copy to one lightweight support line
  - keep built-in preset chips and one visible `Save as preset` action at rest
  - hide the preset-name draft field until the user actively starts the save flow
  - collapse saved-view browsing and management behind a `Saved views` disclosure by default
  - keep `Advanced filters` and `Advanced layout` collapsed by default
- Compress the top-right utility corner:
  - keep `Search by title` dominant
  - convert `Fit to view` and `Lock graph` into compact icon-first buttons with accessible labels/tooltips
  - keep search stepping hidden until a multi-match query is active
  - remove visible zoom and lock readouts at rest, leaving status copy only for exceptional cases such as no matches
- Fix the bottom utility corners:
  - reposition the count chip so it sits fully on the visible canvas to the right of the docked settings rail
  - keep the count chip single-line and lightweight
  - preserve the compact icon-only replay-tour/help controls
- Leave the selected-node focus tray and right detail dock behavior intact except for offset-safe collision avoidance if needed.

## Acceptance
- Wide-desktop browse `Graph` reads closer to the March 26 Recall screenshots because the left rail is lighter, the top-right corner is icon-first, and the bottom-left count chip is no longer clipped beneath the settings rail.
- The visible section order remains `Presets`, `Filters`, and `Groups`.
- `Saved views`, `Advanced filters`, and `Advanced layout` are collapsed by default.
- The preset-name input is hidden at rest and only appears after starting the save flow.
- Search stepping stays hidden for one-match states and appears only for multi-match search states.
- `Home`, focused reader-led `Graph`, and original-only `Reader` remain stable.

## Validation
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
- `frontend/src/App.test.tsx`
- `frontend/src/lib/appRoute.test.ts`
- `frontend/src/lib/graphViewFilters.test.ts`
- `backend/tests/test_api.py -k graph -q`
- `npm run build`
- `node --check` for the Stage 688/689 Playwright pair
- real Windows Edge validation against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Graph/docs/harness set

## Notes
- The user explicitly reopened `Graph` again, so this pass stays benchmark-led on idle chrome instead of deferring to the broader roadmap hold state.
- The Stage 687 count-pill overlap is treated as a real parity bug, not just a cosmetic preference.
