# ExecPlan: Stage 330 Post-Stage-329 Narrower-Width Focused Graph Audit

## Summary
- Run the post-implementation narrower-width audit after Stage 329.
- Confirm whether the widened focused `Graph` bundle around the leading grounded-evidence preview/meta cluster resolves the remaining focused `Graph` mismatch at `820x980` without regressing neighboring focused surfaces.

## Audit Targets
- focused overview at the narrower breakpoint
- focused `Notes` drawer-open empty top state
- focused `Graph`
- focused `Study`
- answer-shown focused `Study`
- `Reader`

## Questions To Answer
- Does the focused `Graph` leading grounded-evidence preview and metadata seam now read more like one quiet support continuation beside Reader instead of a destination block?
- Does the leading `Graph` evidence block feel less stacked above the calmer same-source continuation, or does the first grounded preview still compete too strongly?
- Did Stage 329 absorb the remaining tightly coupled leading-card seams effectively enough to avoid another immediate one-delta Graph rerun?
- Do focused `Graph` evidence, confidence cues, validation actions, and Reader handoffs remain clear after the bundled leading grounded-evidence pass?
- Do focused overview, focused `Notes`, focused `Study`, answer-shown focused `Study`, and `Reader` remain visually stable after the localized focused `Graph` follow-up?
- Is focused `Graph` still the leading narrow mismatch after Stage 329, or did another surface become the clearer next blocker?

## Validation
- Run the Stage 329 targeted frontend validation:
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- Run the repo-owned Windows Edge harness for Stage 330 and compare the fresh artifacts against Stage 328 plus the benchmark matrix.
- Treat this as the next full checkpoint after the widened Stage 329 bundle, not as a confirmation pass for another single-subseam tweak.

## Exit Criteria
- Fresh narrower-width artifacts exist for focused overview, focused `Notes` drawer-open empty, focused `Graph`, focused `Study`, answer-shown focused `Study`, and `Reader`.
- The audit records whether Stage 329 succeeded overall and identifies the next highest-leverage follow-up slice.
