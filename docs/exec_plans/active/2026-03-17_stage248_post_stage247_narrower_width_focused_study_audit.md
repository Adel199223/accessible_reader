# ExecPlan: Stage 248 Post-Stage-247 Narrower-Width Focused Study Audit

## Summary
- Rerun the Windows Edge audit after the Stage 247 bundled narrower-width focused `Study` right-lane pass.
- Compare refreshed narrower-width focused `Study` captures against the calmer post-Stage-246 baseline and current benchmark direction.

## Audit Goals
- Confirm that focused `Study` no longer spends too much of the right support lane on active-card header, prompt/reveal, and supporting-evidence chrome before evidence settles beside Reader at the targeted breakpoint.
- Confirm that Reader remains clearly primary while study continuity, grading, evidence selection, and Reader handoffs remain intact.
- Confirm that the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 focused split balance, Stage 237 focused `Notes` gains, Stage 241 focused `Study` gains, and Stage 245 focused `Graph` gains remain intact while the bundled focused `Study` right-lane pass lands.

## Planned Validation
- `node scripts/playwright/stage248_post_stage247_narrower_width_focused_study_audit_edge.mjs`
- compare fresh captures with the Stage 246 baseline and the benchmark matrix direction
- rerun targeted frontend validation if the audit exposes a structural regression
