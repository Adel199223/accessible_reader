# ExecPlan: Stage 356 Post-Stage-355 Graph Milestone Audit

## Summary
- Audit the full Stage 355 Graph milestone after the desktop-led redesign and focused/narrow adaptation.
- Re-center the benchmark on wide desktop captures, then confirm focused/narrow Graph and neighboring surfaces did not regress.

## Audit Targets
- Wide desktop `Home`
- Wide desktop `Graph`
- Wide desktop `Study`
- Wide desktop `Notes`
- Wide desktop `Reader`
- Focused/narrow `Graph`
- Focused/narrow `Study`
- Focused/narrow `Notes`
- Focused `Reader`

## Required Graph Artifacts
- desktop Graph full top view
- desktop Graph canvas plus utility strip crop
- desktop Graph node-detail dock/tray crop
- focused/narrow Graph full top view
- focused/narrow Graph evidence-flow crop

## Validation
- run the Stage 355 dedicated desktop Graph redesign harness
- run the Stage 355 focused/narrow Graph regression harness if Stage 355 introduced one
- run the Stage 356 Windows Edge full benchmark audit harness
- confirm targeted frontend validation, lint/build, `git diff --check`, and harness syntax checks remain green

## Exit Criteria
- Decide whether the Graph milestone actually solved the user-visible desktop problem.
- Record whether `Graph` still leads, or whether another section becomes the next honest blocker after the new wide-desktop evidence.
- Do not resume alternating Graph and Study micro-stages by default; choose the next section only from the fresh full-audit evidence.
