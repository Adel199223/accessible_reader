# ExecPlan: Stage 534 Post-Stage-533 Graph Steering Surfaces Audit

## Summary
- Audit the Stage 533 wide-desktop `Graph` steering-surfaces readability reset against Recall’s current graph-management direction.
- Confirm that the top-right navigation corner, legend, and bottom focus rail now read more like deliberate steering surfaces instead of tiny supporting chrome.
- Keep `Home` and original-only `Reader` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - `Graph`
  - `Home`
  - original-only `Reader`
- Supporting `Graph` crops:
  - default-state top-right navigation corner
  - default-state legend
  - idle focus rail
  - selected-node focus rail
  - path-selection focus rail

## Acceptance
- The audit states clearly whether Stage 533 materially reduced the remaining default-state Graph steering mismatch against the current Recall benchmark direction.
- The audit records whether the legend now behaves like a real steering aid, including active-group clarity and an obvious reset path.
- The audit records whether the focus rail is clearer in idle, node-selected, and path-selection states without reopening heavier drawer chrome.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 533/534 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 533/534 files
- repo-wide `git diff --check` remains blocked by pre-existing trailing whitespace in `docs/assistant/runtime/BOOTSTRAP_STATE.json`

## Outcome
- Complete.
- The Stage 534 audit confirmed that Stage 533 materially reduced the remaining default-state `Graph` steering mismatch: the top-right control corner, live legend, and bottom focus rail now read like deliberate steering surfaces instead of tiny supporting chrome.
- `Home` and original-only `Reader` refreshed cleanly in the same Edge audit, so the checkpoint returns to refreshed-baseline hold again instead of auto-opening another product slice.
- If another bounded slice is later reopened, `Home` is the likeliest next target; generated-content `Reader` work remains locked.

## Evidence
- Real Windows Edge Stage 534 audit against `http://127.0.0.1:8000` refreshed:
  - `output/playwright/stage534-graph-wide-top.png`
  - `output/playwright/stage534-graph-control-corner-wide-top.png`
  - `output/playwright/stage534-graph-legend-wide-top.png`
  - `output/playwright/stage534-graph-legend-filtered-wide-top.png`
  - `output/playwright/stage534-graph-focus-rail-idle-wide-top.png`
  - `output/playwright/stage534-graph-focus-rail-selected-wide-top.png`
  - `output/playwright/stage534-graph-focus-rail-path-wide-top.png`
  - `output/playwright/stage534-home-wide-top.png`
  - `output/playwright/stage534-reader-original-wide-top.png`
- Supporting audit state in `output/playwright/stage534-post-stage533-graph-steering-surfaces-audit-validation.json` recorded:
  - runtime browser `msedge` with `headless: false`
  - the default legend summary `All 3 groups visible`
  - the filtered-state legend reset capture
  - an original-only `Reader` regression capture reopened against `Web fallback 1773393553435` without widening into generated-content work
- Validation remained green:
  - `node --check` for the Stage 533/534 harness pair
  - real Windows Edge Stage 533 and Stage 534 runs
  - live localhost `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
  - the Stage 533 targeted Vitest pass, `npm run lint`, and `npm run build`
  - targeted `git diff --check -- ...` over the touched files, with repo-wide `git diff --check` still blocked by pre-existing trailing whitespace in `docs/assistant/runtime/BOOTSTRAP_STATE.json`

## Next Recommendation
- Return `Home`, `Graph`, and original-only `Reader` to refreshed-baseline hold from the Stage 534 checkpoint.
- If the user explicitly opens another bounded parity slice, `Home` is the likeliest next target.
- Keep `Notes` and `Study` parked as regression baselines, and keep generated-content `Reader` work explicitly locked.
