# ExecPlan: Stage 358 Post-Stage-357 Home Milestone Audit

## Summary
- Audit the full Stage 357 `Home` milestone after the desktop-led redesign and focused/narrow adaptation.
- Re-center the benchmark on wide desktop captures first, then confirm focused overview, focused `Reader`, focused `Notes`, and frozen `Study` did not regress.
- Do not use this audit to reorder the remaining queue; the next milestone stays `Reader` unless Stage 357 failed or introduced a major regression.

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

## Required Home Artifacts
- desktop `Home` full top view
- desktop `Home` primary resume/library crop
- desktop `Home` lower saved-source continuation crop
- focused overview full top view when Stage 357 changes it
- narrower desktop `Home` full top view when Stage 357 changes it

## Validation
- run the Stage 357 dedicated desktop `Home` redesign harness
- run the Stage 357 focused overview / narrower desktop `Home` regression harness if Stage 357 introduced one
- run the Stage 358 Windows Edge full benchmark audit harness
- confirm targeted frontend validation, lint/build, `git diff --check`, and harness syntax checks remain green
- confirm the live app still returns `200` for `http://127.0.0.1:8000/recall`, `?section=graph`, `?section=study`, `?section=notes`, and `/reader`

## Exit Criteria
- Decide whether the `Home` milestone actually solved the user-visible desktop problem.
- Record the visible before/after change in plain language and point to the wide-desktop baseline artifacts.
- Keep `Graph` locked as the regression baseline.
- Keep `Study` frozen except for regression capture.
- If Stage 357 succeeded overall, promote Stage 359 `Reader` as the next milestone by default rather than reopening cross-surface reprioritization.
