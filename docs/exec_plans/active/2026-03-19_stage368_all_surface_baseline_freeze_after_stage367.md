# ExecPlan: Stage 368 All-Surface Baseline Freeze After Stage 367

## Summary
- The desktop-first milestone sequence is now complete across all five top-level Recall surfaces.
- `Graph`, `Home`, `Reader`, `Notes`, and `Study` are the current locked baselines after the completed Stage 355/356 through Stage 366/367 milestones.
- This plan exists to keep the repo in an honest hold state instead of silently drifting back into another redesign queue.
- There is no automatic next redesign target until the user explicitly unlocks one.

## Why This Plan Exists
- The user asked for visible, section-first redesigns instead of the older micro-stage loop, and that reset is now complete across all top-level surfaces.
- Stage 366/367 gave `Study` the same desktop-first milestone treatment that `Graph`, `Home`, `Reader`, and `Notes` already received.
- Starting another redesign automatically would repeat the exact workflow drift the user asked us to stop.

## Hold Rules
- Do not start a new redesign milestone automatically.
- Keep `Graph`, `Home`, `Reader`, `Notes`, and `Study` regression-only unless the user explicitly asks for more work on one of them.
- Do not reopen the old micro-stage or cross-surface queue-hopping workflow.
- Use the Stage 367 wide-desktop captures as the current baseline set.
- Treat later Reader generated-content work as a separate user-priority phase, not an automatic continuation of surface redesign work.

## Current Locked Baselines
- `output/playwright/stage367-home-wide-top.png`
- `output/playwright/stage367-graph-wide-top.png`
- `output/playwright/stage367-reader-wide-top.png`
- `output/playwright/stage367-notes-wide-top.png`
- `output/playwright/stage367-study-wide-top.png`
- `output/playwright/stage367-study-answer-shown-wide-top.png`

## Next Valid Directions
- Wait for the user to explicitly choose one of:
  - begin the later Reader generated-content phase
  - request another bounded pass on one of the locked top-level surfaces
  - unlock a different product priority outside the current surface-design track
- If the user simply asks to continue without a new priority, explain that the top-level redesign track is complete and ask what should be unlocked next.

## Validation State
- Stage 366 and Stage 367 passed targeted `vitest`, `npm run lint`, `npm run build`, `git diff --check`, `node --check` for both harnesses, and real Windows Edge runs against `http://127.0.0.1:8000`.
- No additional product validation is required to enter this hold state.

## Exit Criteria
- Roadmap docs, assistant routing docs, and the benchmark matrix all point to the Stage 367 locked baseline set.
- The repo no longer advertises an automatic redesign target.
- A future active implementation stage begins only after explicit user reprioritization.
