# ExecPlan: Stage 538 Post-Stage-537 Home Grouped-Overview Primary Lane And Secondary Stack Audit

## Summary
- Audit the Stage 537 wide-desktop `Home` grouped-overview lane rebalance against Recall’s current organizer-owned overview direction.
- Confirm that the grouped-overview board now reads more like one primary lane plus a tighter secondary stack instead of three equal-width columns.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - grouped-overview board at rest
  - primary lane versus secondary stack composition
  - secondary-stack follow-through beside the dominant lane

## Acceptance
- The audit states clearly whether Stage 537 materially reduced the remaining grouped-overview composition mismatch against the current Recall benchmark direction.
- The audit records whether the dominant source group now behaves like the primary working lane while the shorter groups compact into a tighter secondary stack.
- The audit records whether the new composition reduces dead page area without regressing the organizer-owned overview workflow.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 537/538 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 537/538 files

## Outcome
- Complete.
- The Stage 538 audit confirmed that Stage 537 materially reduced the remaining default-state `Home` grouped-overview mismatch: the larger `Captures` section now reads like the primary working lane while the shorter `Web` and `Documents` groups hold as a calmer attached secondary stack instead of three equal-width columns.
- `Graph` and original-only `Reader` refreshed cleanly in the same Edge audit, so the checkpoint returns to refreshed-baseline hold again instead of auto-opening another product slice.
- If another bounded slice is later reopened, `Home` remains the likeliest next target; generated-content `Reader` work stays locked.

## Evidence
- Real Windows Edge Stage 538 audit against `http://127.0.0.1:8000` refreshed:
  - `output/playwright/stage538-home-wide-top.png`
  - `output/playwright/stage538-home-overview-board-wide-top.png`
  - `output/playwright/stage538-home-overview-lane-composition-wide-top.png`
  - `output/playwright/stage538-home-overview-secondary-stack-wide-top.png`
  - `output/playwright/stage538-graph-wide-top.png`
  - `output/playwright/stage538-reader-original-wide-top.png`
- Supporting audit state in `output/playwright/stage538-post-stage537-home-grouped-overview-primary-lane-and-secondary-stack-audit-validation.json` recorded:
  - runtime browser `msedge` with `headless: true`
  - a `247.32px` primary-width delta between `Captures` (`720.48px`) and the two secondary cards (`473.16px`)
  - `0px` secondary-column x spread with a `239.08px` row-top offset, confirming the compact right-hand stack held
  - an original-only `Reader` regression capture reopened against `Web fallback 1773393553435` without widening into generated-content work
- Validation remained green:
  - targeted Vitest for `frontend/src/components/RecallWorkspace.stage37.test.tsx` and `frontend/src/App.test.tsx`
  - `npm run lint`
  - `npm run build`
  - `node --check` for the Stage 537/538 harness pair
  - real Windows Edge Stage 537 and Stage 538 runs
  - live localhost `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
  - targeted `git diff --check -- ...` over the touched files, with repo-wide `git diff --check` still blocked by pre-existing trailing whitespace in `docs/assistant/runtime/BOOTSTRAP_STATE.json`

## Next Recommendation
- Return `Home`, `Graph`, and original-only `Reader` to refreshed-baseline hold from the Stage 538 checkpoint.
- If the user explicitly opens another bounded parity slice, `Home` remains the likeliest next target.
- Keep `Notes` and `Study` parked as regression baselines, and keep generated-content `Reader` work explicitly locked.
