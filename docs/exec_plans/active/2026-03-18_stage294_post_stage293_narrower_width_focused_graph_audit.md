# ExecPlan: Stage 294 Post-Stage-293 Narrower-Width Focused Graph Audit

## Summary
- Run the post-implementation narrower-width audit after Stage 293.
- Confirm whether the bundled focused `Graph` trailing same-source confidence/action-seam deflation resolves the remaining focused `Graph` mismatch at `820x980` without regressing neighboring focused surfaces.

## Audit Targets
- focused overview at the narrower breakpoint
- focused `Notes` drawer-open empty top state
- focused `Graph`
- focused `Study`
- answer-shown focused `Study`
- `Reader`

## Questions To Answer
- Do the bundled focused `Graph` trailing same-source confidence/action seams now stay clearly secondary beside Reader?
- Do focused `Graph` grounded evidence, confirm/reject actions, and Reader handoffs remain clear after the bundled seam pass?
- Do focused overview, focused `Notes`, focused `Study`, answer-shown focused `Study`, and `Reader` remain visually stable after the localized focused `Graph` follow-up?
- Is focused `Graph` still the leading narrow mismatch after Stage 293, or did another surface become the clearer next blocker?

## Validation
- Run the Stage 293 targeted frontend validation:
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- Run the repo-owned Windows Edge harness for Stage 294 and compare the fresh artifacts against Stage 292 plus the benchmark matrix.

## Exit Criteria
- Fresh narrower-width artifacts exist for focused overview, focused `Notes` drawer-open empty, focused `Graph`, focused `Study`, answer-shown focused `Study`, and `Reader`.
- The audit records whether Stage 293 succeeded overall and identifies the next highest-leverage follow-up slice.
