# ExecPlan: Stage 254 Post-Stage-253 Narrower-Width Focused Study Audit

## Summary
- Rerun the Windows Edge audit after the Stage 253 narrower-width focused `Study` queue-utility-row flattening pass.
- Compare refreshed narrower-width focused `Study` captures against the calmer post-Stage-252 baseline and current benchmark direction.

## Audit Goals
- Confirm that focused `Study` no longer gives the left queue utility row and highlighted refresh action more emphasis than the neighboring focused `Notes` and `Graph` rails at the targeted breakpoint.
- Confirm that Reader stays clearly primary while queue access, refresh, active-card work, and source continuity remain intact.
- Confirm that the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 focused split balance, Stage 245 focused `Graph` gains, Stage 247 focused `Study` right-lane gains, Stage 249 focused `Notes` gains, and Stage 251 focused overview gains remain intact while the focused `Study` left-rail correction lands.

## Planned Validation
- `node scripts/playwright/stage254_post_stage253_narrower_width_focused_study_audit_edge.mjs`
- compare fresh captures with the Stage 252 baseline and the benchmark matrix direction
- rerun targeted frontend validation if the audit exposes a structural regression
