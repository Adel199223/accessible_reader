# ExecPlan: Stage 572 Post-Stage-571 Home Rail-Header Restraint And Board-Card Meta Flattening Audit

## Summary
- Audit the Stage 571 Home polish pass against the March 25, 2026 Recall homepage screenshot.
- Confirm that the rail header now reads calmer, the active child continuation row feels nested instead of carded, and the board cards no longer repeat a visible per-card date seam.
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
  - representative file/document card

## Acceptance
- The audit states clearly whether Stage 571 reduced the remaining Home mismatch without reopening structure work.
- The audit records whether the rail header/meta now reads as restrained continuation chrome and whether the active preview row now behaves like a small nested child row.
- The audit records whether visible board-card date nodes are gone while source-aware poster variants remain intact.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 571/572 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 571/572 files

## Outcome
- Complete.
- The audit confirmed that Stage 571 improved the remaining March 25, 2026 Home mismatch without reopening the Stage 563 structure: the selected-collection rail plus day-grouped canvas stayed intact, the rail header/meta now reads calmer, the active child continuation row now lands as nested continuation instead of a mini card, and board cards no longer repeat the day-group date in each lower seam.
- Live Stage 572 Edge evidence recorded `Captures collection canvas` as the active canvas aria-label, `4` first-screen toolbar controls split into `2 + 2` rows, `3 groups` as the restrained rail heading meta, `34 sources in Captures` as the quieter rail summary line, a `16.61px` active continuation-row height with one visible preview marker, `0` visible board-card date nodes, an `18.88px` chip height, a `225.59px` add-tile height, a `94.28px` first day-group top offset, a preserved `182px` sort-popover width, `Local capture` as the representative `paste` source row, `127.0.0.1` as the representative `web` source row, and `at_tariq_86_pronoun_research_v3.html` as the representative file/document source row.
- `Graph` and original-only `Reader` refreshed without a new blocker, and the original-only Reader regression again reopened successfully from Home with `Stage13 Debug 1773482318378` as the audited source title.
