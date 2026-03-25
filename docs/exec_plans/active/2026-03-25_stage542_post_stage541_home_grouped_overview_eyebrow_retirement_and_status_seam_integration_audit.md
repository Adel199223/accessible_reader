# ExecPlan: Stage 542 Post-Stage-541 Home Grouped-Overview Eyebrow Retirement And Status Seam Integration Audit

## Summary
- Audit the Stage 541 wide-desktop `Home` grouped-overview eyebrow retirement and status-seam integration against Recall's current organizer-owned overview direction.
- Confirm that the grouped overview no longer reads like a separate eyebrow-plus-chip utility strip before the board while preserving the Stage 537/539 composition gains.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - grouped-overview board at rest
  - grouped-overview title plus attached status seam
  - primary-lane plus secondary-stack composition after the seam integration

## Acceptance
- The audit states clearly whether Stage 541 materially reduced the remaining grouped-overview top-cap mismatch against the current Recall benchmark direction.
- The audit records whether the grouped overview now starts with `All collections` plus attached status metadata instead of a separate eyebrow-plus-chip strip.
- The audit records whether the seam integration improves the working-board read without regressing the organizer-owned overview workflow.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 541/542 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 541/542 files

## Outcome
- Complete.
- The Stage 542 audit confirmed that Stage 541 materially reduced the remaining default-state `Home` grouped-overview top-cap mismatch: the overview now starts with `All collections` plus attached status metadata instead of a separate eyebrow-plus-chip strip while preserving the Stage 537/539 composition gains.
- `Graph` and original-only `Reader` refreshed cleanly in the same Edge audit, so the checkpoint returns to refreshed-baseline hold again instead of auto-opening another product slice.
- If another bounded slice is later reopened, `Home` remains the likeliest next target; generated-content `Reader` work stays locked.

## Evidence
- Real Windows Edge Stage 542 audit against `http://127.0.0.1:8000` refreshed:
  - `output/playwright/stage542-home-wide-top.png`
  - `output/playwright/stage542-home-overview-board-wide-top.png`
  - `output/playwright/stage542-home-overview-status-seam-wide-top.png`
  - `output/playwright/stage542-home-overview-lane-composition-wide-top.png`
  - `output/playwright/stage542-home-overview-secondary-stack-wide-top.png`
  - `output/playwright/stage542-graph-wide-top.png`
  - `output/playwright/stage542-reader-original-wide-top.png`
- Supporting audit state in `output/playwright/stage542-post-stage541-home-grouped-overview-eyebrow-retirement-and-status-seam-integration-audit-validation.json` recorded:
  - runtime browser `msedge` with `headless: true`
  - a `64.14px` grouped-overview grid offset from the shell top, a `60.91px` overview header height, and a `2.23px` seam between the title seam and the cards
  - a `1px` title-row top offset from the shell top, a `0px` title-status top delta, and a `14.05px` status block height after the eyebrow retirement
  - the Stage 537 lane composition still intact with a `247.44px` primary-width delta, `0px` secondary-column x spread, and `238.75px` secondary row-top offset
  - an original-only `Reader` regression capture reopened against `Web fallback 1773393553435` without widening into generated-content work
- Validation remained green:
  - targeted Vitest for `frontend/src/components/RecallWorkspace.stage37.test.tsx` and `frontend/src/App.test.tsx`
  - `npm run lint`
  - `npm run build`
  - `node --check` for the Stage 541/542 harness pair
  - real Windows Edge Stage 541 and Stage 542 runs
  - live localhost `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
  - targeted `git diff --check -- ...` over the touched files, with repo-wide `git diff --check` still blocked by pre-existing trailing whitespace in `docs/assistant/runtime/BOOTSTRAP_STATE.json`

## Next Recommendation
- Return `Home`, `Graph`, and original-only `Reader` to refreshed-baseline hold from the Stage 542 checkpoint.
- If the user explicitly opens another bounded parity slice, `Home` remains the likeliest next target.
- Keep `Notes` and `Study` parked as regression baselines, and keep generated-content `Reader` work explicitly locked.
