# ExecPlan: Stage 256 Post-Stage-255 Narrower-Width Focused Graph Audit

## Summary
- Rerun the Windows Edge audit after the Stage 255 narrower-width focused `Graph` decision-row deflation pass.
- Compare refreshed narrower-width focused `Graph` captures against the calmer post-Stage-254 baseline and current benchmark direction.

## Audit Goals
- Confirm that focused `Graph` no longer gives the `Node detail` decision row and selected-node header stack more emphasis than the neighboring focused rails and panels beside Reader at the targeted breakpoint.
- Confirm that Reader stays clearly primary while graph confirm/reject access, node identity, evidence, and source continuity remain intact.
- Confirm that the Stage 223 shell correction, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 focused split balance, Stage 247 focused `Study` right-lane gains, Stage 249 focused `Notes` gains, Stage 251 focused overview gains, and Stage 253 focused `Study` left-rail gains remain intact while the focused `Graph` correction lands.

## Planned Validation
- `node scripts/playwright/stage256_post_stage255_narrower_width_focused_graph_audit_edge.mjs`
- compare fresh captures with the Stage 254 baseline and the benchmark matrix direction
- rerun targeted frontend validation if the audit exposes a structural regression
