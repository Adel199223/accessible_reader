# ExecPlan: Stage 566 Post-Stage-565 Home Card-Media And Top-Chrome Parity Audit

## Summary
- Audit the Stage 565 wide-desktop `Home` polish pass against the March 25, 2026 Recall homepage screenshot.
- Confirm that the Home chrome now reads as a compact utility cluster and that the board cards now carry source-aware poster treatment instead of generic placeholder art.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - top-right toolbar
  - left collection rail at rest
  - representative `web` card
  - representative file/document card

## Acceptance
- The audit states clearly whether Stage 565 reduced the remaining visual Home mismatch without reopening structure work.
- The audit records whether the Home canvas no longer exposes a visible heading block in the first-screen toolbar.
- The audit records whether the first-screen toolbar still stays limited to `Search`, `Add`, `List`, and `Sort`.
- The audit records whether the `web` and file/document cards now use source-aware poster treatment.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 565/566 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 565/566 files

## Outcome
- Complete.
- The audit confirmed that Stage 565 improved the remaining high-leverage Home mismatch without reopening the Stage 563 structure: the selected-collection rail and day-grouped canvas stayed intact, the first-screen toolbar now reads as the compact utility cluster alone, and the cards now use source-aware poster treatment instead of the old decorative placeholder frame.
- Live Stage 566 Edge evidence recorded `Captures collection canvas` as the active canvas aria-label, `0` visible toolbar heading nodes, `4` first-screen toolbar controls, `Sat, Mar 14, 2026` and `Fri, Mar 13, 2026` as the first visible day-group labels, a `320px` visible `Web` card width, a `127.0.0.1` web poster detail line, and `at_tariq_86_pronoun_research_v3.html` as the representative file-poster detail.
- `Graph` and original-only `Reader` refreshed without a new blocker, and the original-only Reader regression again opened successfully from Home into `Original` mode with `Local capture` as the audited source title.
