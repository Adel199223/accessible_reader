# ExecPlan: Stage 324 Post-Stage-323 Narrower-Width Focused Study Audit

## Summary
- Run the post-implementation narrower-width audit after Stage 323.
- Confirm whether the bundled focused `Study` prompt/reveal/support-stack fusion resolves the remaining focused `Study` mismatch at `820x980` without regressing neighboring focused surfaces.

## Audit Targets
- focused overview at the narrower breakpoint
- focused `Notes` drawer-open empty top state
- focused `Graph`
- focused `Study`
- answer-shown focused `Study`
- `Reader`

## Questions To Answer
- Does the focused `Study` right `Active card` prompt/reveal/support stack now read more like one quiet support continuation beside Reader instead of stacked destination panels?
- Do both pre-answer and answer-shown focused `Study` states feel less segmented beside Reader, or does the right lane still compete too strongly?
- Do focused `Study` review actions, evidence, and Reader handoffs remain clear after the bundled stack-fusion pass?
- Do focused overview, focused `Notes`, focused `Graph`, and `Reader` remain visually stable after the localized focused `Study` follow-up?
- Is focused `Study` still the leading narrow mismatch after Stage 323, or did another surface become the clearer next blocker?

## Validation
- Run the Stage 323 targeted frontend validation:
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- Run the repo-owned Windows Edge harness for Stage 324 and compare the fresh artifacts against Stage 322 plus the benchmark matrix.

## Exit Criteria
- Fresh narrower-width artifacts exist for focused overview, focused `Notes` drawer-open empty, focused `Graph`, focused `Study`, answer-shown focused `Study`, and `Reader`.
- The audit records whether Stage 323 succeeded overall and identifies the next highest-leverage follow-up slice.
