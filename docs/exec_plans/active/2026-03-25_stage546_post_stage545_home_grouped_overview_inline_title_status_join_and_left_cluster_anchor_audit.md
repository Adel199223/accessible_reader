# ExecPlan: Stage 546 Post-Stage-545 Home Grouped-Overview Inline Title Status Join And Left Cluster Anchor Audit

## Summary
- Audit the Stage 545 wide-desktop `Home` grouped-overview inline title-status join against Recall's current organizer-owned overview direction.
- Confirm that the condensed status note now belongs to the `All collections` heading cluster instead of floating as a separate middle-of-shell seam artifact.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - grouped-overview board at rest
  - grouped-overview title plus inline joined status note
  - primary-lane plus secondary-stack composition after the heading join

## Acceptance
- The audit states clearly whether Stage 545 materially reduced the remaining grouped-overview heading drift against the current Recall benchmark direction.
- The audit records whether the condensed status note now reads as part of the left title cluster rather than a separate seam artifact.
- The audit records whether the title-status join improves the working-board read without regressing the organizer-owned overview workflow.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 545/546 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 545/546 files

## Outcome
- Complete. The Stage 546 audit confirmed that the condensed grouped-overview status note now reads as part of the `All collections` title cluster rather than a separate middle-of-shell seam artifact while the Stage 537/539/541 composition gains and the original-only `Reader` lock remained intact.

## Evidence
- `scripts/playwright/stage546_post_stage545_home_grouped_overview_inline_title_status_join_and_left_cluster_anchor_audit.mjs` passed in real Windows Edge against `http://127.0.0.1:8000`.
- Stage 546 refreshed the live wide desktop `Home`, `Graph`, and original-only `Reader` captures plus dedicated grouped-overview board, title-status, lane-composition, and secondary-stack crops.
- The audit recorded a `63.83px` grouped-overview grid offset, a `60.59px` header height, a `7.67px` title-status inline gap, a `107.03px` status left offset from the overview shell, a `107.48px` status block width, an `8.31px` status block height, a `3.59px` title-status top delta, a preserved `247.44px` primary-width delta, a `0px` secondary-column spread, and a `238.75px` secondary-row offset.
- `Graph` and original-only `Reader` refreshed without surfacing a new blocker, and the Reader regression capture stayed locked to `Original`.

## Next Recommendation
- Return `Home`, `Graph`, and original-only `Reader` to refreshed-baseline hold again rather than auto-opening another slice.
- If the user explicitly reopens another bounded parity pass, `Home` remains the likeliest next target.
- Keep generated-content `Reader` work explicitly locked:
  - no `Reflowed`, `Simplified`, or `Summary` changes
  - no generated-view UX, transform, placeholder, or mode-routing work
