# ExecPlan: Stage 687 Post-Stage-686 Graph Panel and Utility Chrome Recall-Parity Tightening Audit

## Summary
- Audit the Stage 686 Graph chrome-tightening pass in real Windows Edge against the March 26, 2026 Recall Graph screenshots.
- Confirm that the flatter left settings panel, slimmer top-right corner, and lighter utility corners improve Recall parity without reopening canvas/layout scope or regressing `Home` and original-only `Reader`.

## Audit Focus
- The left settings panel remains open by default, visually flatter, and ordered around visible `Presets`, `Filters`, and `Groups`.
- `Advanced filters` and `Advanced layout` are collapsed at rest while their underlying controls still exist.
- The top-right corner stays compact with `Search by title`, `Fit to view`, and `Lock graph` visible, and search stepping only appears for multi-match queries.
- The bottom-left count utility chip is single-line and no longer duplicates visible text, while the bottom-right help controls stay compact and replay the Graph tour or open the help step directly.
- Selected-node and path workflows still reveal the contextual focus tray plus detail dock, and those overlays read calmer than the Stage 685 baseline.
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
  - advanced disclosures collapsed by default
  - compact view controls present
  - search-step controls hidden for one-match states and visible for multi-match states
  - bottom utility-corner text/labels
  - selected focus tray and detail dock visibility

## Validation
- rerun the targeted Graph/frontend suites from Stage 686
- rerun `backend/tests/test_api.py -k graph -q`
- rerun `npm run build`
- run the new Stage 686/687 Playwright pair with real Windows Edge against `http://127.0.0.1:8000`
- finish with targeted `git diff --check -- ...` on the touched Graph/docs/harness files

## Exit Criteria
- The Stage 686 Graph chrome changes are visibly closer to Recall’s March 26 screenshots and all targeted validation remains green.
- Only reopen another Graph pair if a broad remaining mismatch still appears after this bounded chrome-tightening pass.
