# ExecPlan: Stage 244 Post-Stage-243 Narrower-Width Focused Graph Audit

## Summary
- Rerun the Windows Edge audit after the Stage 243 narrower-width focused `Graph` left-rail deflation pass.
- Compare refreshed narrower-width focused `Graph` captures against the calmer post-Stage-242 baseline and current benchmark direction.

## Audit Goals
- Confirm that focused `Graph` no longer spends too much of the left support lane on intro, browse, and selected-node summary chrome at the targeted breakpoint.
- Confirm that Reader remains clearly primary while Browse access, selected-node continuity, confirm/reject actions, and evidence handoffs remain intact.
- Confirm that the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 focused split balance, Stage 237 focused `Notes` gains, Stage 239 focused `Graph` gains, and Stage 241 focused `Study` gains remain intact while the focused `Graph` rail deflates.

## Planned Validation
- `node scripts/playwright/stage244_post_stage243_narrower_width_focused_graph_audit_edge.mjs`
- compare fresh captures with the Stage 242 baseline and the benchmark matrix direction
- rerun targeted frontend validation if the audit exposes a structural regression
