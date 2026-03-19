# ExecPlan: Stage 288 Post-Stage-287 Narrower-Width Focused Study Audit

## Summary
- Run the post-implementation narrower-width audit after Stage 287.
- Confirm whether the bundled answer-shown focused `Study` rating/support seam deflation resolves the remaining focused `Study` mismatch at `820x980` without regressing neighboring focused surfaces.

## Audit Targets
- focused overview at the narrower breakpoint
- focused `Notes` drawer-open empty top state
- focused `Graph`
- focused `Study`
- answer-shown focused `Study`
- `Reader`

## Questions To Answer
- Does the bundled answer-shown focused `Study` rating/support seam now stay clearly secondary beside Reader?
- Do focused `Study` reveal/rating controls, supporting evidence, and Reader handoffs remain clear after the bundled seam pass?
- Do focused overview, focused `Notes`, focused `Graph`, and `Reader` remain visually stable after the localized focused `Study` follow-up?
- Is answer-shown focused `Study` still the leading narrow mismatch after Stage 287, or did another surface become the clearer next blocker?

## Validation
- Run the Stage 287 targeted frontend validation:
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- Run the repo-owned Windows Edge harness for Stage 288 and compare the fresh artifacts against Stage 286 plus the benchmark matrix.

## Exit Criteria
- Fresh narrower-width artifacts exist for focused overview, focused `Notes` drawer-open empty, focused `Graph`, focused `Study`, answer-shown focused `Study`, and `Reader`.
- The audit records whether Stage 287 succeeded overall and identifies the next highest-leverage follow-up slice.
