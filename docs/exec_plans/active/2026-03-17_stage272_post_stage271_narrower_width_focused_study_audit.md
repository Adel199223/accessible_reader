# ExecPlan: Stage 272 Post-Stage-271 Narrower-Width Focused Study Audit

## Summary
- Run the post-implementation narrower-width audit after Stage 271.
- Confirm whether the focused `Study` answer-shown stack compression resolves the remaining focused `Study` mismatch at `820x980` without regressing neighboring focused surfaces.

## Audit Targets
- focused overview at the narrower breakpoint
- focused `Notes` drawer-open empty top state
- focused `Graph`
- focused `Study`
- answer-shown focused `Study`
- `Reader`

## Questions To Answer
- Does the answer-shown focused `Study` right lane now stay compact enough beside Reader?
- Do focused `Study` reveal, rating, source evidence, grounding, and Reader handoffs remain clear after the answer-shown compression pass?
- Do focused overview, focused `Notes`, focused `Graph`, and `Reader` remain visually stable after the localized focused `Study` follow-up?
- Is focused `Study` still the leading narrow mismatch after Stage 271, or did another surface become the clearer next blocker?

## Validation
- Run the Stage 271 targeted frontend validation:
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- Run the repo-owned Windows Edge harness for Stage 272 and compare the fresh artifacts against Stage 270 plus the benchmark matrix.

## Exit Criteria
- Fresh narrower-width artifacts exist for focused overview, focused `Notes` drawer-open empty, focused `Graph`, focused `Study`, answer-shown focused `Study`, and `Reader`.
- The audit records whether Stage 271 succeeded overall and identifies the next highest-leverage follow-up slice.
