# ExecPlan: Stage 298 Post-Stage-297 Narrower-Width Focused Graph Audit

## Summary
- Run the post-implementation narrower-width audit after Stage 297.
- Confirm whether the bundled focused `Graph` deepest same-source tail row-rhythm deflation resolves the remaining focused `Graph` mismatch at `820x980` without regressing neighboring focused surfaces.

## Audit Targets
- focused overview at the narrower breakpoint
- focused `Notes` drawer-open empty top state
- focused `Graph`
- focused `Study`
- answer-shown focused `Study`
- `Reader`

## Questions To Answer
- Do the deepest same-source focused `Graph` continuation rows now read like one quiet continuation beneath the leading evidence card?
- Does the focused `Graph` right `Node detail` lane now stay clearly secondary beside Reader, or does the surface still read too much like a three-part composition?
- Do focused `Graph` grounded evidence, confirm/reject actions, and Reader handoffs remain clear after the bundled deepest-tail rhythm pass?
- Do focused overview, focused `Notes`, focused `Study`, answer-shown focused `Study`, and `Reader` remain visually stable after the localized focused `Graph` follow-up?
- Is focused `Graph` still the leading narrow mismatch after Stage 297, or did another surface become the clearer next blocker?

## Validation
- Run the Stage 297 targeted frontend validation:
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- Run the repo-owned Windows Edge harness for Stage 298 and compare the fresh artifacts against Stage 296 plus the benchmark matrix.

## Exit Criteria
- Fresh narrower-width artifacts exist for focused overview, focused `Notes` drawer-open empty, focused `Graph`, focused `Study`, answer-shown focused `Study`, and `Reader`.
- The audit records whether Stage 297 succeeded overall and identifies the next highest-leverage follow-up slice.
