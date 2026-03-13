# ExecPlan: Post-Stage 8 Direction Pending

## Summary
- Stage 8 is complete.
- No new roadmap milestone is scheduled beyond Stage 8 yet.
- This placeholder stays active so future major work still has an explicit handoff file to read before a new milestone is opened.

## Immediate Rules
- Do not start a new multi-file implementation slice until the next roadmap priority is explicitly chosen.
- Preserve Reader, Recall, graph, study, browser companion, portability, integrity/repair, and benchmark behavior as the current baseline.
- If the user schedules a new milestone, replace this placeholder with a concrete ExecPlan before code edits begin.

## Current Validation Baseline
- backend `pytest` is green
- backend app import is green
- frontend `npm test -- --run`, `npm run lint`, and `npm run build` are green
- extension `npm test -- --run` and `npm run build` are green
- Stage 8 benchmark artifact: `output/stage8-benchmarks.json`
- Stage 8 localhost smoke artifact: `output/stage8-smoke-validation.json`
