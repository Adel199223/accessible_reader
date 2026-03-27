# ExecPlan: Stage 568 Post-Stage-567 Home Rail-Density And Card-Rhythm Parity Audit

## Summary
- Audit the Stage 567 wide-desktop `Home` polish pass against the March 25, 2026 Recall homepage screenshot.
- Confirm that the rail now rests as a lighter tree, that the toolbar reads as a smaller two-row cluster, and that the denser add/card rhythm holds in live Edge.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - closed toolbar cluster
  - open sort popover
  - left collection rail at rest
  - `Add Content` tile
  - representative `paste` card
  - representative `web` card

## Acceptance
- The audit states clearly whether Stage 567 reduced the remaining Home mismatch without reopening structure work.
- The audit records whether the visible at-rest organizer block is gone and replaced by a compact overflow trigger.
- The audit records whether the first-screen toolbar still stays limited to `Search`, `Add`, `List`, and `Sort`.
- The audit records whether the `Add Content` tile and sort popover now stay below the Stage 565/566 baselines.
- The audit records whether `paste` plus `web` cards still preserve source-aware fallback media.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 567/568 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 567/568 files

## Outcome
- Complete.
- The audit confirmed that Stage 567 improved the remaining Home mismatch without reopening the Stage 563 structure: the selected-collection rail and day-grouped canvas stayed intact, the visible at-rest organizer block is gone, the toolbar now reads as a lighter `2 + 2` cluster, and the cards plus add tile now read denser than the Stage 565 pass.
- Live Stage 568 Edge evidence recorded `Captures collection canvas` as the active canvas aria-label, `0` visible at-rest organizer panels, `1` visible `Organizer options` trigger, `4` first-screen toolbar controls split into `2 + 2` rows, `Search...Ctrl+K` as the visible search trigger text, a `249.59px` add-tile height, a `196px` sort-popover width, a `122.39px` first day-group top offset, and `Sat, Mar 14, 2026` plus `Fri, Mar 13, 2026` as the first visible day-group labels.
- `paste` and `web` poster variants stayed intact in live Edge with `paste` as the active first-card preview kind and `127.0.0.1` as the representative `web` poster detail.
- `Graph` and original-only `Reader` refreshed without a new blocker, and the original-only Reader regression again opened successfully from Home into `Original` mode with `Local capture` as the audited source title.
