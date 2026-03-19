# ExecPlan: Stage 226 Post-Stage-225 Narrower-Width Reader Audit

## Summary
- Rerun the Windows Edge audit after the Stage 225 narrower-width Reader chrome compression pass.
- Compare refreshed narrower-width Reader captures against the calmer post-Stage-223 shell baseline and current benchmark direction.

## Audit Goals
- Confirm that the narrower-width Reader no longer starts too low beneath a tall support-chrome stack.
- Confirm that source context, note actions, and speech controls remain reachable without overshadowing the text.
- Confirm that the Stage 223 narrower-width shell correction remains intact while Reader compresses further.

## Planned Validation
- `node scripts/playwright/stage226_post_stage225_narrower_width_reader_audit_edge.mjs`
- compare fresh captures with the Stage 224 baseline and the benchmark matrix direction
- rerun targeted frontend validation if the audit exposes a structural regression
