# ExecPlan: Stage 326 Post-Stage-325 Narrower-Width Focused Study Audit

## Summary
- Run the post-implementation narrower-width audit after Stage 325.
- Confirm whether the bundled focused `Study` supporting-evidence and grounding continuation softening resolves the remaining focused `Study` mismatch at `820x980` without regressing neighboring focused surfaces.

## Audit Targets
- focused overview at the narrower breakpoint
- focused `Notes` drawer-open empty top state
- focused `Graph`
- focused `Study`
- answer-shown focused `Study`
- `Reader`

## Questions To Answer
- Does the focused `Study` supporting-evidence excerpt and grounding continuation now read more like one quiet support continuation beside Reader instead of a second destination block?
- Do both pre-answer and answer-shown focused `Study` states feel less segmented beside Reader, or does the excerpt/grounding block still compete too strongly?
- Do focused `Study` review actions, evidence, grounding context, and Reader handoffs remain clear after the bundled supporting-evidence pass?
- Do focused overview, focused `Notes`, focused `Graph`, and `Reader` remain visually stable after the localized focused `Study` follow-up?
- Is focused `Study` still the leading narrow mismatch after Stage 325, or did another surface become the clearer next blocker?

## Validation
- Run the Stage 325 targeted frontend validation:
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- Run the repo-owned Windows Edge harness for Stage 326 and compare the fresh artifacts against Stage 324 plus the benchmark matrix.

## Exit Criteria
- Fresh narrower-width artifacts exist for focused overview, focused `Notes` drawer-open empty, focused `Graph`, focused `Study`, answer-shown focused `Study`, and `Reader`.
- The audit records whether Stage 325 succeeded overall and identifies the next highest-leverage follow-up slice.
