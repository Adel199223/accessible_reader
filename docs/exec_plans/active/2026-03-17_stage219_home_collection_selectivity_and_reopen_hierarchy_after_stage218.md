# ExecPlan: Stage 219 Home Collection Selectivity And Reopen Hierarchy After Stage 218

## Summary
- Use the March 17, 2026 Stage 218 audit as the handoff point for the next bounded benchmark slice.
- Keep the successful Stage 217 focused `Study` correction and the Stage 215 focused-split gains intact while making `Home` feel less like one flat archive wall.

## Problem Statement
- Stage 217 materially deflated focused `Study`, and Stage 218 confirmed that the reader-led split work now stays calmer across focused `Graph`, `Notes`, and `Study`.
- The remaining benchmark mismatch is now concentrated back on `Home`.
- `Home` still reads as a long list of nearly equal reopen rows instead of a more deliberate Recall-style collection surface with clearer selectivity, grouping, and one more obvious primary reopen path.

## Goals
- Make `Home` feel more selective and intentionally grouped without reintroducing the old spotlight-heavy staging.
- Clarify the primary reopen path while keeping the broader reopen list easy to scan.
- Improve at-a-glance hierarchy and section separation without changing current add/search behavior or focused-source entry behavior.
- Preserve all current navigation, continuity, search/add flows, and source-focused workflow behavior.

## Non-Goals
- Do not change backend APIs, search behavior, persistence, continuity semantics, or Reader generation logic.
- Do not widen this pass into `Graph`, `Notes`, `Study`, `Reader`, or the source-focused split layouts.
- Do not reintroduce a tall hero, a heavy utility dock, or a staged featured-card system that fights the calmer shell.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - tighten `Home` reopen grouping and selective hierarchy
- `frontend/src/index.css`
  - `Home`-only collection spacing, grouping, and hierarchy tuning
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - update `Home` structural assertions if the grouping model changes
- `frontend/src/App.test.tsx`
  - keep shell, continuity, and source-entry expectations aligned if `Home` labels or grouping shift

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- update/check the Stage 219 Windows Edge harness if the `Home` audit targets change materially

## Exit Criteria
- `Home` reads as a selective reopen surface instead of one flat archive wall.
- One primary reopen path is more obvious without turning the top of `Home` back into a heavy staged spotlight.
- Grouping and scan order improve while search/add access and focused-source entry behavior remain intact.
- The next benchmark audit can judge the remaining mismatch primarily on `Home` collection hierarchy rather than focused split-view balance.
