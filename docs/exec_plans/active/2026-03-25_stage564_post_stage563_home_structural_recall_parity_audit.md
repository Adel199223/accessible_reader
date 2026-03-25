# ExecPlan: Stage 564 Post-Stage-563 Home Structural Recall Parity Audit

## Summary
- Audit the Stage 563 wide-desktop `Home` structural reset against the Recall homepage screenshot shared in this thread.
- Confirm that the default Home hierarchy now follows a selected-collection, recency-first card canvas instead of the grouped-overview source-bucket board.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - left collection rail at rest
  - top-right utility cluster
  - main day-grouped canvas
  - selected-collection state

## Acceptance
- The audit states clearly whether Stage 563 materially reduced the structural Home mismatch against the Recall homepage benchmark.
- The audit records whether Home now defaults to one selected collection instead of the grouped-overview board.
- The audit records whether sources are grouped by day in the main canvas.
- The audit records whether the first visible day group includes an `Add Content` tile.
- The audit records whether the visible first-screen controls are limited to `Search`, `Add`, `List`, and `Sort`.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 563/564 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 563/564 files

## Outcome
- Complete.
- The audit confirmed that Stage 563 materially changed the default wide-desktop `Home` hierarchy toward the user-shared Recall homepage direction: the selected-collection rail owns the current working set, the main canvas is grouped by day, the first visible group leads with an `Add Content` tile, and the visible first-screen controls remain limited to `Search`, `Add`, `List`, and `Sort`.
- Live Stage 564 Edge evidence recorded a `306.98px` `Add Content` tile height, `Sat, Mar 14, 2026` and `Fri, Mar 13, 2026` as the first visible day-group labels, `4` first-screen toolbar controls, and a `320px` visible `Web` card width.
- `Graph` and original-only `Reader` refreshed without a new blocker, and the original-only Reader regression opened successfully from Home into `Original` mode with `Stage13 Debug 1773482318378` as the audited source title.
