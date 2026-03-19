# ExecPlan: Stage 360 Post-Stage-359 Reader Milestone Audit

## Summary
- Audit the full Stage 359 `Reader` milestone after the desktop-led redesign and narrow/split adaptation.
- Re-center the benchmark on wide desktop captures first, then confirm `Home`, `Graph`, `Notes`, and frozen `Study` did not regress.
- If Stage 359 succeeds overall, keep the queue moving to `Notes` instead of reopening cross-surface prioritization.

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

## Required Reader Artifacts
- desktop `Reader` full top view
- desktop `Reader` document-first layout crop
- desktop `Reader` support-dock / source-note-context crop
- narrow `Reader` full top view
- reader-led split crop if Stage 359 changes it

## Validation
- run the Stage 359 dedicated desktop `Reader` redesign harness
- run the Stage 359 narrow/split Reader regression harness if Stage 359 introduced one
- run the Stage 360 Windows Edge full benchmark audit harness
- confirm targeted frontend validation, lint/build, `git diff --check`, and harness syntax checks remain green
- confirm the live app still returns `200` for `/reader` plus the top-level Recall routes

## Exit Criteria
- Decide whether the `Reader` milestone actually solved the user-visible desktop problem.
- Record the visible before/after change in plain language and point to the wide-desktop baseline artifacts.
- Keep `Graph` locked as the regression baseline.
- Keep `Study` frozen except for regression capture.
- If Stage 359 succeeded overall, promote Stage 361 `Notes` as the next milestone by default.
