# ExecPlan: Stage 352 Post-Stage-351 Narrower-Width Focused Graph Audit

## Summary
- Run the benchmark audit after Stage 351 to verify whether the bundled focused `Graph` `Node detail` rail readability rebalance materially closes the remaining narrow-width mismatch at `820x980`.
- Confirm that the focused `Graph` right lane now reads calmer beside Reader without regressing focused `Study`, focused `Notes`, focused overview, the shared shell, or Reader.

## Audit Targets
- Focused overview at `820x980`
- Focused `Graph` at `820x980`
- Focused `Study` at `820x980`
- Answer-shown focused `Study` at `820x980`
- Focused `Notes` drawer-open empty at `820x980`
- Reader at `820x980`

## Validation
- Run the repo-owned Windows Edge Stage 351 validation harness against the live localhost app.
- Run the repo-owned Windows Edge Stage 352 audit harness against the same live localhost app.
- Save fresh artifacts under `output/playwright/` plus a validation JSON summary.
- Compare the refreshed focused `Graph` captures against the Stage 350 baseline to decide whether the lead blocker stays on focused `Graph` or shifts.

## Exit Criteria
- Audit artifacts exist for the refreshed narrow-width focused surfaces.
- The audit records whether Stage 351 succeeded overall and whether focused `Graph` still materially leads after the bundled readability rebalance.
