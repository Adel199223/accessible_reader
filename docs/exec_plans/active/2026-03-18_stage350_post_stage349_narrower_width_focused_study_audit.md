# ExecPlan: Stage 350 Post-Stage-349 Narrower-Width Focused Study Audit

## Summary
- Run the benchmark audit after Stage 349 to verify whether the bundled focused `Study` body-flow fusion materially closes the remaining narrow-width mismatch at `820x980`.
- Confirm that the focused `Study` right lane now reads calmer beside Reader without regressing focused `Graph`, focused `Notes`, focused overview, the shared shell, or Reader.

## Audit Targets
- Focused overview at `820x980`
- Focused `Graph` at `820x980`
- Focused `Study` at `820x980`
- Answer-shown focused `Study` at `820x980`
- Focused `Notes` drawer-open empty at `820x980`
- Reader at `820x980`

## Validation
- Run the repo-owned Windows Edge Stage 349 validation harness against the live localhost app.
- Run the repo-owned Windows Edge Stage 350 audit harness against the same live localhost app.
- Save fresh artifacts under `output/playwright/` plus a validation JSON summary.
- Compare the refreshed focused `Study` captures against the Stage 348 baseline to decide whether the lead blocker stays on focused `Study` or shifts.

## Exit Criteria
- Audit artifacts exist for the refreshed narrow-width focused surfaces.
- The audit records whether Stage 349 succeeded overall and whether focused `Study` still materially leads after the bundled body-flow fusion.
