# ExecPlan: Stage 268 Post-Stage-267 Narrower-Width Focused Graph Audit

## Summary
- Run the post-implementation narrower-width audit after Stage 267.
- Confirm whether the bundled focused `Graph` `Node detail` lane deflation resolves the remaining focused `Graph` mismatch at `820x980` without regressing neighboring focused surfaces.

## Audit Targets
- focused overview at the narrower breakpoint
- focused `Notes` drawer-open empty top state
- focused `Graph`
- focused `Study`
- `Reader`

## Questions To Answer
- Does the bundled focused `Graph` `Node detail` lane now read like one calmer utility flow instead of separate stacked mini-zones beside Reader?
- Do focused `Graph` confirm/reject controls, selected-node context, grounded mentions/relations, and Reader handoffs remain clear after the bundled lane pass?
- Do focused overview, focused `Notes`, focused `Study`, and `Reader` remain visually stable after the localized focused `Graph` follow-up?
- Is focused `Graph` still the leading narrow mismatch after Stage 267, or did another surface become the clearer next blocker?

## Validation
- Run the Stage 267 targeted frontend validation:
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- Run the repo-owned Windows Edge harness for Stage 268 and compare the fresh artifacts against Stage 266 plus the benchmark matrix.

## Exit Criteria
- Fresh narrower-width artifacts exist for focused overview, focused `Notes` drawer-open empty, focused `Graph`, focused `Study`, and `Reader`.
- The audit records whether Stage 267 succeeded overall and identifies the next highest-leverage follow-up slice.
