# ExecPlan: Stage 570 Post-Stage-569 Home Utility-Cluster Anchoring And Restrained Poster-Copy Audit

## Summary
- Audit the Stage 569 Home polish pass against the March 25, 2026 Recall homepage screenshot.
- Confirm that the utility cluster is tighter, the organizer trigger is compact at rest, and the poster interiors no longer carry duplicate body copy.
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
- The audit states clearly whether Stage 569 reduced the remaining Home mismatch without reopening structure work.
- The audit records whether the toolbar width now sits below the Stage 568 baseline and whether the organizer trigger now reads as compact continuation chrome.
- The audit records whether preview body-copy nodes are gone while source-aware poster variants remain intact.
- The audit records whether the sort popover still stays narrower than the Stage 568 baseline.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 569/570 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 569/570 files

## Outcome
- Complete.
- The audit confirmed that Stage 569 improved the remaining March 25, 2026 Home mismatch without reopening the Stage 563 structure: the selected-collection rail plus day-grouped canvas stayed intact, the utility cluster now sits narrower than the Stage 568 baseline, the organizer trigger now reads as compact continuation chrome, and the poster interiors no longer duplicate body-copy inside the preview frame.
- Live Stage 570 Edge evidence recorded `Captures collection canvas` as the active canvas aria-label, `4` first-screen toolbar controls split into `2 + 2` rows, `Search...Ctrl+K` as the visible search trigger text, a `215.48px` toolbar width versus the Stage 568 `223.52px` pre-pass baseline, a `33.91px` organizer-trigger width versus the Stage 568 `107.41px` pre-pass baseline, `0` preview body-copy nodes, a `182px` sort-popover width, a `237.59px` add-tile height, a `96.53px` first day-group top offset, `127.0.0.1` plus `Browser source` for the representative `web` poster, and `HTML file` plus `Local document` for the representative file poster.
- `Graph` and original-only `Reader` refreshed without a new blocker, and the original-only Reader regression again reopened successfully from Home with `Stage13 Debug 1773482318378` as the audited source title.
