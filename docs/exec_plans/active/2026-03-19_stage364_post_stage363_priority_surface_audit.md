# ExecPlan: Stage 364 Post-Stage-363 Priority-Surface Audit

## Summary
- Audit the completed Stage 363 priority-surface baseline consolidation after the finished `Graph`, `Home`, `Reader`, and `Notes` milestone sequence.
- Re-center the benchmark on wide desktop captures first, then confirm focused/narrow regressions still hold and `Study` remains frozen.
- Use this audit to decide whether the current baseline set is stable enough to park until the user gives fresh priorities.

## Audit Targets
- Wide desktop `Home`
- Wide desktop `Graph`
- Wide desktop `Study`
- Wide desktop `Notes`
- Wide desktop `Reader`
- Focused overview
- Focused/narrow `Graph`
- Focused `Reader`
- Focused/narrow `Notes`
- Focused/narrow `Study`

## Required Priority-Surface Artifacts
- desktop `Home` full top view
- desktop `Graph` full top view
- desktop `Reader` full top view
- desktop `Notes` full top view
- one additional wide crop for any surface materially changed by Stage 363
- focused/narrow regression captures only for the surfaces touched by Stage 363

## Validation
- run the Stage 363 dedicated wide-desktop comparison harness
- run any Stage 363 focused/narrow regression harnesses if shared changes affected them
- run the Stage 364 Windows Edge full benchmark audit harness
- confirm targeted frontend validation, lint/build, `git diff --check`, and harness syntax checks remain green
- confirm the live app still returns `200` for `?section=home`, `?section=graph`, `?section=notes`, `?section=study`, and `/reader`

## Exit Criteria
- Decide whether the locked priority surfaces actually hold together as the new desktop-first baseline set.
- Record the visible before/after change in plain language and point to the wide-desktop artifact set.
- Keep `Study` frozen unless the user explicitly reprioritizes it.
- If Stage 363 succeeds overall, choose future work only from fresh evidence or explicit user direction instead of reopening the old queue or micro-stage cadence.
