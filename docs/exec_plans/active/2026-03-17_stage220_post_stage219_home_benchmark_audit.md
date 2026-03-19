# ExecPlan: Stage 220 Post-Stage-219 Home Benchmark Audit

## Summary
- Rerun the Windows Edge benchmark audit after the Stage 219 `Home` collection-selectivity and reopen-hierarchy pass.
- Compare refreshed `Home` and focused-state captures against the benchmark matrix and the validated Stage 218 baseline.

## Audit Goals
- Confirm that `Home` no longer reads like a long archive wall of nearly equal reopen rows.
- Confirm that the Stage 217 focused `Study` correction and Stage 215 focused-split gains remain intact.
- Confirm that the Stage 213 shell/Home/Reader coherence remains stable after the `Home` reshaping.

## Planned Validation
- `node scripts/playwright/stage220_post_stage219_home_benchmark_audit_edge.mjs`
- compare fresh captures with `docs/ux/recall_benchmark_matrix.md`
- rerun targeted frontend validation if the audit exposes a structural regression
