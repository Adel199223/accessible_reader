# ExecPlan: Stage 544 Post-Stage-543 Home Grouped-Overview Status Seam Narrowing And Heading Attachment Audit

## Summary
- Audit the Stage 543 wide-desktop `Home` grouped-overview status-seam narrowing and heading attachment against Recall's current organizer-owned overview direction.
- Confirm that the grouped overview no longer reads like it has a broad top-cap status ribbon while preserving the Stage 537/539/541 composition gains.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - grouped-overview board at rest
  - grouped-overview title plus narrowed attached status seam
  - primary-lane plus secondary-stack composition after the seam rebalance

## Acceptance
- The audit states clearly whether Stage 543 materially reduced the remaining grouped-overview status-cap mismatch against the current Recall benchmark direction.
- The audit records whether the grouped overview now keeps a smaller attached status note rather than a shell-wide top seam.
- The audit records whether the seam narrowing improves the working-board read without regressing the organizer-owned overview workflow.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 543/544 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 543/544 files

## Outcome
- Complete. The Stage 544 audit confirmed that the grouped-overview status seam now reads as a smaller attached heading note rather than a broad shell-wide cap while the Stage 537/539/541 composition gains and the original-only `Reader` lock remained intact.

## Evidence
- `scripts/playwright/stage544_post_stage543_home_grouped_overview_status_seam_narrowing_and_heading_attachment_audit.mjs` passed in real Windows Edge against `http://127.0.0.1:8000`.
- Stage 544 refreshed the live wide desktop `Home`, `Graph`, and original-only `Reader` captures plus dedicated grouped-overview board, status-seam, lane-composition, and secondary-stack crops.
- The audit recorded a `63.98px` grouped-overview grid offset, a `60.75px` header height, a `107.69px` status block width, an `8.8px` status block height, a `38.08px` status top offset, a preserved `247.44px` primary-width delta, a `0px` secondary-column spread, and a `238.75px` secondary-row offset.
- `Graph` and original-only `Reader` refreshed without surfacing a new blocker, and the Reader regression capture stayed locked to `Original`.

## Next Recommendation
- Return `Home`, `Graph`, and original-only `Reader` to refreshed-baseline hold again rather than auto-opening another slice.
- If the user explicitly reopens another bounded parity pass, `Home` remains the likeliest next target.
- Keep generated-content `Reader` work explicitly locked:
  - no `Reflowed`, `Simplified`, or `Summary` changes
  - no generated-view UX, transform, placeholder, or mode-routing work
