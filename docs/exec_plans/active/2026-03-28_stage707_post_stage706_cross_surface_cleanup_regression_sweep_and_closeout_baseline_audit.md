# ExecPlan: Stage 707 Post-Stage-706 Cross-Surface Cleanup, Regression Sweep, And Closeout Baseline Audit

## Audit Scope
- Audit the completed Stage 706 cleanup sweep as the queued closeout baseline for the current parity roadmap.
- Judge the final refreshed capture set across `Home`, `Graph`, embedded `Notebook`, original-only `Reader`, generated-mode `Reader`, `Study`, and focused reader-led regressions.

## Required Evidence
- wide desktop `Home`
- wide desktop `Graph`
- wide desktop embedded `Notebook`
- wide desktop original-only `Reader`
- wide desktop generated-mode `Reader`
- wide desktop `Study`
- focused reader-led split regression capture
- any cleanup-sensitive crop or seam evidence needed to prove stale chrome was actually removed

## Audit Questions
- Did the cleanup sweep preserve the current Recall-directed product hierarchy instead of accidentally reopening old chrome?
- Are `Home`, `Graph`, embedded `Notebook`, original-only `Reader`, generated-mode `Reader`, and `Study` all still stable in real Windows Edge?
- Do the continuity docs now point to one clear post-roadmap baseline instead of another queued redesign?
- Is the product ready to leave the queued roadmap and move into explicit user-directed reopens only?

## Validation Ladder
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/components/RecallWorkspace.stage37.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallShellFrame.test.tsx src/components/SourceWorkspaceFrame.test.tsx src/components/ReaderSurface.test.tsx src/lib/appRoute.test.ts src/lib/graphViewFilters.test.ts src/App.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node --check` for Stage 706/707 Playwright files
- real Windows Edge Stage 707 audit against `http://127.0.0.1:8000`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`

## Exit Criteria
- Stage 706 is accepted only if the closeout sweep leaves every primary surface stable and materially cleaner than the mixed pre-closeout baseline.
- The roadmap is considered complete only after Stage 707 rotates the repo into a documented stable baseline with no automatic next redesign slice.
