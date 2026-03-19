# ExecPlan: Stage 316 Post-Stage-315 Narrower-Width Focused Graph Audit

## Summary
- Run the post-implementation narrower-width audit after Stage 315.
- Confirm whether the bundled focused `Graph` deepest same-source continuation-tail compaction resolves the remaining focused `Graph` mismatch at `820x980` without regressing neighboring focused surfaces.

## Audit Targets
- focused overview at the narrower breakpoint
- focused `Notes` drawer-open empty top state
- focused `Graph`
- focused `Study`
- answer-shown focused `Study`
- `Reader`

## Questions To Answer
- Do the focused `Graph` deepest same-source continuation rows now read more like one compact inline continuation beneath the calmer ladder instead of a repeated one-line tail?
- Does the `Node detail` lane now feel less segmented beside Reader, or does the deepest same-source continuation still compete too strongly?
- Do focused `Graph` grounded evidence, confirm/reject actions, and Reader handoffs remain clear after the bundled continuation-tail pass?
- Do focused overview, focused `Notes`, focused `Study`, answer-shown focused `Study`, and `Reader` remain visually stable after the localized focused `Graph` follow-up?
- Is focused `Graph` still the leading narrow mismatch after Stage 315, or did another surface become the clearer next blocker?

## Validation
- Run the Stage 315 targeted frontend validation:
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- Run the repo-owned Windows Edge harness for Stage 316 and compare the fresh artifacts against Stage 314 plus the benchmark matrix.

## Exit Criteria
- Fresh narrower-width artifacts exist for focused overview, focused `Notes` drawer-open empty, focused `Graph`, focused `Study`, answer-shown focused `Study`, and `Reader`.
- The audit records whether Stage 315 succeeded overall and identifies the next highest-leverage follow-up slice.
