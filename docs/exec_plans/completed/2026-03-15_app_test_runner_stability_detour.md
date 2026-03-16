# ExecPlan: App Test Runner Stability Detour

## Summary
- Diagnose and fix the known whole-file stall when running `frontend/src/App.test.tsx` as a single Vitest file.
- Keep the scope tightly bounded to frontend test-runner reliability so Stage 62 can resume with a more trustworthy validation ladder.
- Preserve the currently green targeted test paths and avoid broad product changes unless the root cause lives in shared app bootstrap behavior.

## Goals
- Reproduce the stall in a controlled way and identify whether it comes from one test, a shared setup leak, a route/state cleanup issue, or Vitest runner configuration.
- Implement the smallest stable fix that makes broad `App.test.tsx` runs complete reliably on this machine.
- Record the real validation status so future stages know whether broad App coverage is now trustworthy or still needs caveats.

## Scope
- `frontend/src/App.test.tsx`
- `frontend/src/test/setup.ts`
- `frontend/vite.config.ts`
- related frontend helpers only if the stall is caused by shared cleanup or app bootstrap behavior
- roadmap and assistant continuity docs if the known caveat changes

## Out Of Scope
- new UX/product slice work for Stage 62 or Stage 63
- backend or storage changes
- replacing the existing targeted Study/Home/Graph validation strategy with broad integration-only testing

## Investigation Questions
- Does the stall reproduce consistently with a single-file Vitest run on `frontend/src/App.test.tsx`?
- If it does, which test or shared setup transition is the first point where progress stops?
- Is the issue caused by leaked timers, unresolved async work, route/history cleanup, mocked browser APIs, or runner configuration?
- Can the file complete reliably after a bounded cleanup/config correction without making the suite significantly slower or weaker?

## Validation
- Reproduce with a direct whole-file run of `frontend/src/App.test.tsx` under explicit worker and timeout settings.
- Use narrower filtered runs if needed to bisect the stall to a single describe/test region.
- After the fix, rerun:
  - the whole `frontend/src/App.test.tsx` file
  - the targeted regression tests touched during the fix
  - `frontend npm run lint` if code/config changes warrant it

## Assumptions
- The failure is local to the frontend test harness and can be solved without reopening backend validation.
- The best outcome is to restore broad-file reliability while keeping the current real Edge harnesses as the final UI truth source.

## Outcome
- The whole-file `frontend/src/App.test.tsx` run is stable again under the WSL Vitest path and now finishes with all 54 tests passing.
- Root cause: `App.tsx` was recreating shell handoff callbacks on every render, and `ReaderWorkspace` effects depended on those callback props, which created a React update loop that surfaced as the apparent whole-file stall.
- Fix:
  - stabilize App-level shell handoff callbacks with `useCallback`
  - refresh stale `App.test.tsx` shell assertions to match the current browse-first Home, focused-source Graph/Notes/Study, and import-mode accessibility labels
  - refresh the related `RecallWorkspace.stage37` assertion drift so targeted coverage and broad App coverage agree on current UX behavior

## Validation Result
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/lib/appRoute.test.ts --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
