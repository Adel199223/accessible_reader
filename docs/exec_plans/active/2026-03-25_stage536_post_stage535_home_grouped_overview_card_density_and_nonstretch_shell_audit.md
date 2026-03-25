# ExecPlan: Stage 536 Post-Stage-535 Home Grouped-Overview Card Density And Nonstretch Shell Audit

## Summary
- Audit the Stage 535 wide-desktop `Home` grouped-overview card-density and nonstretch-shell reset against Recall’s current organizer-owned overview direction.
- Confirm that the grouped-overview board now reads denser and less panel-like at rest.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - grouped-overview board at rest
  - shorter grouped-overview columns beside the taller column
  - grouped-overview footer/action treatment

## Acceptance
- The audit states clearly whether Stage 535 materially reduced the remaining grouped-overview mismatch against the current Recall benchmark direction.
- The audit records whether shorter grouped-overview columns now avoid the old stretched empty lower areas.
- The audit records whether the grouped-overview footer/action treatment now reads like lighter continuation instead of a detached button block.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 535/536 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 535/536 files

## Outcome
- Complete.
- The Stage 536 audit confirmed that Stage 535 materially reduced the remaining default-state `Home` grouped-overview mismatch: the shorter `Web` and `Documents` columns now size to their own content, the board keeps visible height contrast, and the footer/action treatment reads lighter and more attached to the card body.
- `Graph` and original-only `Reader` refreshed cleanly in the same Edge audit, so the checkpoint returns to refreshed-baseline hold again instead of auto-opening another product slice.
- If another bounded slice is later reopened, `Home` remains the likeliest next target; generated-content `Reader` work stays locked.

## Evidence
- Real Windows Edge Stage 536 audit against `http://127.0.0.1:8000` refreshed:
  - `output/playwright/stage536-home-wide-top.png`
  - `output/playwright/stage536-home-overview-board-wide-top.png`
  - `output/playwright/stage536-home-overview-columns-wide-top.png`
  - `output/playwright/stage536-home-overview-footer-wide-top.png`
  - `output/playwright/stage536-graph-wide-top.png`
  - `output/playwright/stage536-reader-original-wide-top.png`
- Supporting audit state in `output/playwright/stage536-post-stage535-home-grouped-overview-card-density-and-nonstretch-shell-audit-validation.json` recorded:
  - runtime browser `msedge` with `headless: true`
  - three visible grouped-overview cards with a measured `257.47px` height spread between `Captures` (`474.33px`) and the shorter `Web` / `Documents` cards (`216.86px`)
  - the grouped-overview footer button class `recall-home-library-section-footer-button-stage535-reset`
  - an original-only `Reader` regression capture reopened against `Web fallback 1773393553435` without widening into generated-content work
- Validation remained green:
  - targeted Vitest for `frontend/src/components/RecallWorkspace.stage37.test.tsx` and `frontend/src/App.test.tsx`
  - `npm run lint`
  - `npm run build`
  - `node --check` for the Stage 535/536 harness pair
  - real Windows Edge Stage 535 and Stage 536 runs
  - live localhost `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
  - targeted `git diff --check -- ...` over the touched files, with repo-wide `git diff --check` still blocked by pre-existing trailing whitespace in `docs/assistant/runtime/BOOTSTRAP_STATE.json`

## Next Recommendation
- Return `Home`, `Graph`, and original-only `Reader` to refreshed-baseline hold from the Stage 536 checkpoint.
- If the user explicitly opens another bounded parity slice, `Home` remains the likeliest next target.
- Keep `Notes` and `Study` parked as regression baselines, and keep generated-content `Reader` work explicitly locked.
