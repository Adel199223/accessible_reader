# ExecPlan: Stage 240 Post-Stage-239 Narrower-Width Focused Graph Audit

## Summary
- Rerun the Windows Edge audit after the Stage 239 narrower-width focused `Graph` detail-stack flattening pass.
- Compare refreshed narrower-width focused `Graph` captures against the calmer post-Stage-238 baseline and current benchmark direction.

## Audit Goals
- Confirm that focused `Graph` no longer spends too much of the right support lane on selected-node summary chrome before mentions begin at the targeted breakpoint.
- Confirm that Reader remains clearly primary while confirm/reject actions, selected-node continuity, and evidence handoffs remain intact.
- Confirm that the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 focused split balance, Stage 231 focused `Study` rail gains, Stage 233 focused `Graph` gains, Stage 235 focused `Study` gains, and Stage 237 focused `Notes` gains remain intact while the focused `Graph` detail stack flattens.

## Planned Validation
- `node scripts/playwright/stage240_post_stage239_narrower_width_focused_graph_audit_edge.mjs`
- compare fresh captures with the Stage 238 baseline and the benchmark matrix direction
- rerun targeted frontend validation if the audit exposes a structural regression
