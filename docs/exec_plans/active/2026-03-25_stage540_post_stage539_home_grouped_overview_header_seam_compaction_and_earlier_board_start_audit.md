# ExecPlan: Stage 540 Post-Stage-539 Home Grouped-Overview Header Seam Compaction And Earlier Board Start Audit

## Summary
- Audit the Stage 539 wide-desktop `Home` grouped-overview header-seam compaction against Recall’s current organizer-owned overview direction.
- Confirm that the grouped-overview board now starts earlier and carries less padded shell banding before the cards while preserving the Stage 537/538 lane composition.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - grouped-overview board at rest
  - grouped-overview title/helper seam above the cards
  - primary-lane plus secondary-stack composition after the shell compaction

## Acceptance
- The audit states clearly whether Stage 539 materially reduced the remaining grouped-overview shell mismatch against the current Recall benchmark direction.
- The audit records whether the grouped-overview cards now start earlier with a tighter title/helper seam while the Stage 537/538 lane composition still holds.
- The audit records whether the shell compaction improves the working-board read without regressing the organizer-owned overview workflow.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 539/540 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 539/540 files

## Outcome
- Complete.
- The Stage 540 audit confirmed that Stage 539 materially reduced the remaining default-state `Home` grouped-overview shell mismatch: the grouped board now starts earlier with a tighter title/helper seam while preserving the Stage 537 primary-lane plus secondary-stack composition.
- `Graph` and original-only `Reader` refreshed cleanly in the same Edge audit, so the checkpoint returns to refreshed-baseline hold again instead of auto-opening another product slice.
- If another bounded slice is later reopened, `Home` remains the likeliest next target; generated-content `Reader` work stays locked.

## Evidence
- Real Windows Edge Stage 540 audit against `http://127.0.0.1:8000` refreshed:
  - `output/playwright/stage540-home-wide-top.png`
  - `output/playwright/stage540-home-overview-board-wide-top.png`
  - `output/playwright/stage540-home-overview-header-seam-wide-top.png`
  - `output/playwright/stage540-home-overview-lane-composition-wide-top.png`
  - `output/playwright/stage540-home-overview-secondary-stack-wide-top.png`
  - `output/playwright/stage540-graph-wide-top.png`
  - `output/playwright/stage540-reader-original-wide-top.png`
- Supporting audit state in `output/playwright/stage540-post-stage539-home-grouped-overview-header-seam-compaction-and-earlier-board-start-audit-validation.json` recorded:
  - runtime browser `msedge` with `headless: true`
  - an `80.97px` grouped-overview grid offset from the shell top, a `77.73px` overview header height, and a `2.23px` seam between the header and the cards
  - the Stage 537 lane composition still intact with a `247.44px` primary-width delta, `0px` secondary-column x spread, and `238.75px` secondary row-top offset
  - an original-only `Reader` regression capture reopened against `Web fallback 1773393553435` without widening into generated-content work
- Validation remained green:
  - targeted Vitest for `frontend/src/components/RecallWorkspace.stage37.test.tsx` and `frontend/src/App.test.tsx`
  - `npm run lint`
  - `npm run build`
  - `node --check` for the Stage 539/540 harness pair
  - real Windows Edge Stage 539 and Stage 540 runs
  - live localhost `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
  - targeted `git diff --check -- ...` over the touched files, with repo-wide `git diff --check` still blocked by pre-existing trailing whitespace in `docs/assistant/runtime/BOOTSTRAP_STATE.json`

## Next Recommendation
- Return `Home`, `Graph`, and original-only `Reader` to refreshed-baseline hold from the Stage 540 checkpoint.
- If the user explicitly opens another bounded parity slice, `Home` remains the likeliest next target.
- Keep `Notes` and `Study` parked as regression baselines, and keep generated-content `Reader` work explicitly locked.
