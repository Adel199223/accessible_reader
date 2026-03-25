# ExecPlan: Stage 548 Post-Stage-547 Home Grouped-Overview Helper Note Retirement And Leaner Title Cluster Audit

## Summary
- Audit the Stage 547 wide-desktop `Home` grouped-overview helper-note retirement against Recall's current organizer-owned overview direction.
- Confirm that the grouped overview no longer carries a separate default-state helper band beneath the `All collections` title cluster.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - grouped-overview board at rest
  - grouped-overview lean title cluster at rest
  - primary-lane plus secondary-stack composition after the header simplification

## Acceptance
- The audit states clearly whether Stage 547 materially reduced the remaining grouped-overview helper-band mismatch against the current Recall benchmark direction.
- The audit records whether the default-state grouped overview now keeps a leaner title cluster without the old helper sentence band.
- The audit records whether the helper-note retirement improves the working-board read without regressing the organizer-owned overview workflow.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 547/548 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 547/548 files

## Outcome
- Completed.
- The Stage 548 audit confirmed that Stage 547 succeeded overall: wide-desktop `Home` now keeps a lean grouped-overview title cluster with no default-state helper sentence beneath `All collections` while preserving the Stage 537 primary-lane composition, the Stage 539 earlier board start, and the Stage 545 inline title-status join.
- `Graph` and original-only `Reader` refreshed in real Windows Edge without surfacing a new blocker, and generated-content `Reader` work stayed explicitly out of scope.

## Evidence
- The Stage 548 live audit passed in real Windows Edge against `http://127.0.0.1:8000`, refreshing `Home`, `Graph`, and original-only `Reader` plus dedicated grouped-overview board, lean-title, lane-composition, and secondary-stack crops.
- Supporting Stage 548 audit metrics recorded `headerParagraphCount: 0`, a `51.06px` grouped-overview grid offset, a `47.83px` overview header height, a `7.67px` title-status inline gap, a `107.03px` status left offset, a `107.48px` status block width, a `3.67px` title-status top delta, and the preserved `247.44px` primary-width delta.
- Supporting validation also passed with:
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- src/components/RecallWorkspace.stage37.test.tsx"`
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
  - `node --check` for the Stage 547/548 harness pair
  - live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- A broad `frontend/src/App.test.tsx` graph-browse spot check was attempted during this checkpoint, but that file's existing graph browse test currently times out at Vitest's default `5000ms` ceiling in this environment, so the audit stayed gated on targeted Home coverage plus the live Edge captures instead of claiming a broad App pass.

## Next Recommendation
- Keep `Home`, `Graph`, and original-only `Reader` in refreshed-baseline hold again from the Stage 548 checkpoint.
- If another bounded slice opens, `Home` remains the likeliest next target.
- Keep generated-content `Reader` work locked unless the user explicitly reprioritizes it.
