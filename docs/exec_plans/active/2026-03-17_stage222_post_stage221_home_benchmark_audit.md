# ExecPlan: Stage 222 Post-Stage-221 Home Benchmark Audit

## Summary
- Rerun the Windows Edge benchmark audit after the Stage 221 expanded-`Earlier` Home rebalancing pass.
- Compare refreshed default and expanded `Home` captures plus the focused-state set against the benchmark matrix and the validated Stage 220 baseline.

## Audit Goals
- Confirm that the Stage 219 default `Home` landing gains remain intact.
- Confirm that the expanded `Earlier` state no longer recreates a stretched lead-card plus archive-ledger imbalance.
- Confirm that the Stage 217 focused `Study`, Stage 215 focused split-view, and Stage 213 shell/Reader gains remain stable.

## Planned Validation
- `node scripts/playwright/stage222_post_stage221_home_benchmark_audit_edge.mjs`
- compare fresh captures with `docs/ux/recall_benchmark_matrix.md`
- rerun targeted frontend validation if the audit exposes a structural regression
