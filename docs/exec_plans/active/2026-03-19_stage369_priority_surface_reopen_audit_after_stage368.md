# ExecPlan: Stage 369 Priority Surface Reopen Audit After Stage 368

## Summary
- The user clarified that unfreezing `Study` before the original priority set was truly finished was the wrong tradeoff.
- This pass re-parks `Study`, reopens only the user-priority surfaces, and uses fresh wide-desktop evidence to choose the next real redesign target.
- The audit scope is limited to `Home`, `Graph`, `Reader`, and `Notes`, with `Study` treated as parked again unless a direct regression is discovered.

## Goals
- Re-freeze `Study` in the roadmap, anchor, assistant routing docs, and benchmark matrix.
- Refresh wide-desktop evidence for `Home`, `Graph`, `Reader`, and `Notes` at the canonical localhost URL.
- Pick the highest unfinished priority surface from fresh evidence instead of continuing from the old hold-state assumption.
- Stage the next broad desktop-first milestone for that chosen surface without reopening the old micro-stage loop.

## Non-Goals
- No product redesign implementation in this audit pass.
- No backend/API/schema changes.
- No Reader generated-content work.
- No new cross-surface queue hopping.

## Work Plan
1. Add a repo-owned Stage 369 wide-desktop audit harness for `Home`, `Graph`, `Reader`, and `Notes`.
2. Capture fresh wide-desktop artifacts and supporting crops that make the remaining mismatch visible.
3. Review those artifacts against the current benchmark matrix and current desktop-first baselines.
4. Update roadmap/runbook docs so `Study` is parked again and the newly selected priority surface becomes the next active milestone target.
5. Pre-stage the next milestone plan for that one surface only.

## Acceptance
- Fresh Stage 369 artifacts exist for wide-desktop `Home`, `Graph`, `Reader`, and `Notes`.
- `Study` is clearly documented as parked again rather than part of the active priority queue.
- The next active milestone names one of `Home`, `Graph`, `Reader`, or `Notes` based on the fresh audit.
- The final handoff explains why that chosen surface leads and why the other three do not.

## Validation
- `node --check` for the new Stage 369 harness
- real Windows Edge Stage 369 audit run against `http://127.0.0.1:8000`
- `git diff --check`
