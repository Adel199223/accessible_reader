# ExecPlan: Stage 214 Post-Stage-213 Cross-Surface Benchmark Audit

## Summary
- Run the next benchmark audit after the Stage 213 cross-surface UX correction lands.
- Compare fresh Home, Graph, Study, Notes, Reader, and focused split-view captures against the benchmark matrix and the pre-pass localhost baseline.

## Audit Goals
- Confirm that the shell reads calmer and more coherent across top-level sections.
- Confirm that Home no longer depends on multiple duplicate source-entry treatments.
- Confirm that Graph browse mode no longer feels bracketed by support chrome.
- Confirm that Study and Notes feel clearer at a glance without new workflow regressions.
- Confirm that Reader polish improves layout and readability without changing generated content behavior.

## Planned Validation
- `node scripts/playwright/stage214_post_stage213_cross_surface_benchmark_audit_edge.mjs`
- compare fresh captures with `docs/ux/recall_benchmark_matrix.md`
- rerun targeted frontend validation if the audit exposes a structural regression
