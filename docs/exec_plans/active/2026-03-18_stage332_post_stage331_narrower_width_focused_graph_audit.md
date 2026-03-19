# ExecPlan: Stage 332 Post-Stage-331 Narrower-Width Focused Graph Audit

## Summary
- Run the post-implementation narrower-width audit after Stage 331.
- Confirm whether the Stage 331 focused `Graph` hierarchy reset materially changes the `Node detail` rail at `820x980` without regressing neighboring focused surfaces.

## Audit Targets
- focused overview at the narrower breakpoint
- focused `Notes` drawer-open empty top state
- focused `Graph`
- focused `Study`
- answer-shown focused `Study`
- `Reader`

## Questions To Answer
- Does the focused `Graph` `Node detail` lane now read like one compact support rail beside Reader instead of a second destination panel?
- Did Stage 331 make a visibly larger focused `Graph` change than the old micro-stage cadence, or does the result still feel too incremental?
- Are the lane header, selected-node glance, `Mentions`, leading evidence, and `Relations` start now visually fused enough to feel like one hierarchy?
- Do graph evidence, confirm/reject actions, confidence cues, and Reader handoffs remain clear after the hierarchy reset?
- Do focused overview, focused `Notes`, focused `Study`, answer-shown focused `Study`, and `Reader` remain visually stable after the localized focused `Graph` follow-up?
- Is focused `Graph` still the lead narrow-width blocker after Stage 331, or did another surface become the clearer next follow-up?

## Validation
- Run the Stage 331 targeted frontend validation:
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- Run the repo-owned Windows Edge harness for Stage 332 and compare the fresh artifacts against Stage 330 plus the benchmark matrix.
- Treat this as the bundle-boundary checkpoint after a visibly larger focused `Graph` pass, not as confirmation for another tiny seam adjustment.

## Exit Criteria
- Fresh narrower-width artifacts exist for focused overview, focused `Notes` drawer-open empty, focused `Graph`, focused `Study`, answer-shown focused `Study`, and `Reader`.
- The audit records whether Stage 331 succeeded overall and identifies the next highest-leverage follow-up slice.
