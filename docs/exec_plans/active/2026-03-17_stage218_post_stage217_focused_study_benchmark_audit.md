# ExecPlan: Stage 218 Post-Stage-217 Focused Study Benchmark Audit

## Summary
- Rerun the Windows Edge benchmark audit after the Stage 217 focused `Study` support-column deflation pass.
- Compare refreshed focused-state captures against the benchmark matrix and the validated Stage 216 baseline.

## Audit Goals
- Confirm that focused `Study` no longer reads like a co-equal dashboard beside the Reader.
- Confirm that Stage 215 focused-strip and Reader-dominance gains remain intact across focused `Graph`, `Notes`, and the shared Reader route.
- Confirm that the Stage 213 top-level shell/Home/Reader coherence stays stable.

## Planned Validation
- `node scripts/playwright/stage218_post_stage217_focused_study_benchmark_audit_edge.mjs`
- compare fresh captures with `docs/ux/recall_benchmark_matrix.md`
- rerun targeted frontend validation if the audit exposes a structural regression
