# ExecPlan: Stage 266 Post-Stage-265 Narrower-Width Focused Graph Audit

## Summary
- Run the post-implementation narrower-width audit after Stage 265.
- Confirm whether the focused `Graph` `Node detail` pre-`Mentions` shell deflation resolved the remaining focused `Graph` mismatch at `820x980` without regressing neighboring focused surfaces.

## Audit Targets
- focused overview at the narrower breakpoint
- focused `Notes` drawer-open empty top state
- focused `Graph`
- focused `Study`
- `Reader`

## Questions To Answer
- Does the focused `Graph` `Node detail` lane now feel lighter and quicker to evidence than the pre-Stage-265 version?
- Do focused `Graph` confirm/reject controls, selected-node context, mentions, relations, and Reader handoffs remain clear?
- Do focused overview, `Notes`, `Study`, and `Reader` remain visually stable after the localized `Graph` follow-up?
- Is focused `Graph` still the leading narrow mismatch after Stage 265, or does another surface now lead?

## Validation
- Run the Stage 265 targeted frontend validation:
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- Run the repo-owned Windows Edge harness for Stage 266 and compare the fresh artifacts against Stage 264 and the benchmark matrix.

## Exit Criteria
- Fresh narrower-width artifacts exist for focused overview, focused `Notes` drawer-open empty, focused `Graph`, focused `Study`, and `Reader`.
- The audit records whether Stage 265 succeeded overall and identifies the next highest-leverage follow-up slice.
