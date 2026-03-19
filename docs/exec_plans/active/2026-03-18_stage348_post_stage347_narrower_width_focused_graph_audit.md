# ExecPlan: Stage 348 Post-Stage-347 Narrower-Width Focused Graph Audit

## Summary
- Run the narrower-width benchmark audit after Stage 347.
- Verify that the focused `Graph` `Node detail` lane now reads as one calmer evidence flow at `820x980` instead of a leading destination card above a separate lower bundle.
- Confirm that focused overview, focused `Study`, focused `Notes`, Reader, and the retained shell/source-strip gains remain stable.

## Audit Targets
- Focused `Graph` top viewport at `820x980`
- Focused `Graph` evidence-flow body crop at `820x980`
- Focused `Study` top viewport at `820x980`
- Focused `Study` answer-shown viewport at `820x980`
- Focused overview top viewport at `820x980`
- Focused `Notes` drawer-open empty viewport at `820x980`
- Reader top viewport at `820x980`

## Validation
- Run the Stage 347 Windows Edge validation harness first.
- Run the Stage 348 Windows Edge audit harness against the same live localhost app.
- If the audit disagrees with the validation read, capture one additional focused `Graph` evidence-flow crop before choosing the next blocker.

## Exit Criteria
- Capture fresh artifacts for the focused `Graph` evidence-flow body plus neighboring focused surfaces.
- Record whether focused `Graph` still leads after the Stage 347 evidence-flow fusion or whether another surface becomes the clearer narrow-width blocker.
- Leave the roadmap ready for the next bounded implementation slice instead of another seam-only detour.
