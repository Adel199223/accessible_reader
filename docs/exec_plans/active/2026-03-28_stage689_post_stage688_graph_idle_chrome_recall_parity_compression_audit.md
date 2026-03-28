# ExecPlan: Stage 689 Post-Stage-688 Graph Idle-Chrome Recall-Parity Compression Audit

## Summary
- Audit the Stage 688 idle-chrome Graph pass in real Windows Edge against the March 26, 2026 Recall Graph screenshots.
- Confirm that the lighter settings rail, icon-first top-right controls, and corrected count-pill positioning improve Recall parity without reopening canvas/layout scope or regressing `Home` and original-only `Reader`.

## Audit Focus
- The Graph settings rail remains open by default with visible `Presets`, `Filters`, and `Groups`.
- No status row is visible under the `Graph Settings` header.
- The preset draft input stays hidden at rest, while `Saved views`, `Advanced filters`, and `Advanced layout` remain collapsed by default.
- The top-right control corner keeps `Search by title` dominant while `Fit to view` and `Lock graph` render as icon-first controls with accessible labels.
- No idle zoom or lock readout is visible at rest, and search stepping still appears only for multi-match queries.
- The bottom-left count chip is fully visible to the right of the docked settings rail, and the bottom-right help controls stay compact.
- Selected-node and path workflows still surface the contextual focus tray plus detail dock without layout regressions.
- `Home` and original-only `Reader` remain stable regression baselines.

## Evidence
- Capture:
  - settings-open default Graph
  - post-tour idle Graph
  - left-panel crop
  - top-right utility-corner crop
  - bottom utility-corner crop
  - selected-node state
  - path-result state
  - `Home`
  - original-only `Reader`
- Record metrics for:
  - settings-open-by-default
  - visible top-level section order
  - settings status-row absence
  - preset draft input hidden by default
  - saved-views disclosure collapsed by default
  - fit/lock accessible labels with icon-only rendering
  - search-step controls hidden for one-match states and visible for multi-match states
  - bottom-left count-chip clearance past the settings rail
  - selected focus tray and detail dock visibility

## Validation
- rerun the targeted Graph/frontend suites from Stage 688
- rerun `backend/tests/test_api.py -k graph -q`
- rerun `npm run build`
- run the new Stage 688/689 Playwright pair with real Windows Edge against `http://127.0.0.1:8000`
- finish with targeted `git diff --check -- ...` on the touched Graph/docs/harness files

## Exit Criteria
- The Stage 688 idle-chrome changes are visibly closer to Recall’s March 26 Graph screenshots and all targeted validation remains green.
- Only reopen another Graph pair if a broad remaining mismatch still appears after this bounded idle-chrome compression pass.
