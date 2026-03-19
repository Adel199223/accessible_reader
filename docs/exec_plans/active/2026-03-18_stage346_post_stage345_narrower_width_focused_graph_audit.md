# ExecPlan: Stage 346 Post-Stage-345 Narrower-Width Focused Graph Audit

## Summary
- Run the narrower-width benchmark audit after Stage 345.
- Verify that the focused `Graph` lower continuation plus `Relations` footer now read as one calmer follow-on bundle at `820x980`.
- Confirm that focused overview, focused `Study`, focused `Notes`, Reader, and the retained shell/source-strip gains remain stable.

## Audit Targets
- Focused `Graph` top viewport at `820x980`
- Focused `Graph` lower continuation/footer crop at `820x980`
- Focused `Study` top viewport at `820x980`
- Focused `Study` answer-shown viewport at `820x980`
- Focused overview top viewport at `820x980`
- Focused `Notes` drawer-open empty viewport at `820x980`
- Reader top viewport at `820x980`

## Validation
- Run the Stage 345 Windows Edge validation harness first.
- Run the Stage 346 Windows Edge audit harness against the same live localhost app.
- If the audit disagrees with the validation read, capture one additional focused `Graph` lower-bundle crop before choosing the next blocker.

## Exit Criteria
- Capture fresh artifacts for the focused `Graph` lower bundle plus neighboring focused surfaces.
- Record whether focused `Graph` still leads after the Stage 345 readability reset or whether another surface becomes the clearer narrow-width blocker.
- Leave the roadmap ready for the next bounded implementation slice instead of another seam-only detour.
