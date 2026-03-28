# ExecPlan: Stage 706 Cross-Surface Cleanup, Regression Sweep, And Closeout Baseline After Stage 705

## Summary
- Stage 706/707 is the queued closeout milestone after the completed Stage 704/705 Study parity reset.
- This is a cleanup-and-baseline pass, not a new surface redesign: `Home`, `Graph`, embedded `Notebook`, `Reader`, and `Study` all stay on regression-only footing unless the sweep exposes a direct benchmark mismatch or a real structural leftover.
- The goal is to end the parity ladder with one cleaner code/documentation baseline, one refreshed evidence set, and one explicit closeout checkpoint instead of leaving stale stage-era debris behind.

## Why This Milestone Exists
- The roadmap queue intentionally saved one final consolidation pass after the shell, Home, Notebook, Reader, and Study resets.
- The product is now close enough across all primary surfaces that the highest-leverage work is cleanup, regression confidence, and continuity tightening rather than reopening another surface-specific redesign.
- Several files still carry superseded stage-era wording, obsolete benchmark continuity, and CSS/harness residue that is safe to trim only after every primary surface has been intentionally audited.

## Scope
- Refresh the cross-surface benchmark captures for:
  - `Home`
  - `Graph`
  - embedded `Notebook`
  - original-only `Reader`
  - generated-mode `Reader`
  - wide desktop `Study`
  - focused reader-led split regressions
- Clean up stale or superseded stage-only helper hooks, docs wording, and harness residue that no longer helps the shipped product or roadmap continuity.
- Keep the product behavior stable:
  - no backend schema or API changes
  - no new section reopen
  - no Reader generated-output changes

## Non-Goals
- No new parity redesign for `Home`, `Graph`, `Notebook`, `Reader`, or `Study`.
- No new backend behavior or data migrations.
- No extension reprioritization.
- No new generated-content work in `Reader`.

## Targets
- `/home/fa507/dev/accessible_reader/frontend/src/index.css`
- `/home/fa507/dev/accessible_reader/frontend/src/components/*`
- `/home/fa507/dev/accessible_reader/frontend/src/App.test.tsx`
- `/home/fa507/dev/accessible_reader/frontend/src/components/RecallWorkspace.stage37.test.tsx`
- `/home/fa507/dev/accessible_reader/frontend/src/components/RecallWorkspace.stage34.test.tsx`
- `/home/fa507/dev/accessible_reader/scripts/playwright/*`
- `/home/fa507/dev/accessible_reader/BUILD_BRIEF.md`
- `/home/fa507/dev/accessible_reader/docs/ROADMAP.md`
- `/home/fa507/dev/accessible_reader/docs/ROADMAP_ANCHOR.md`
- `/home/fa507/dev/accessible_reader/agent.md`
- `/home/fa507/dev/accessible_reader/docs/assistant/INDEX.md`
- `/home/fa507/dev/accessible_reader/docs/ux/recall_benchmark_matrix.md`

## Internal Checkpoints

### Checkpoint 1: Cleanup Sweep
- Remove stale stage-era CSS hooks, superseded harness leftovers, and outdated continuity wording that survived the parity ladder.
- Prefer deleting obsolete support code over keeping dead compatibility scaffolding when the shipped behavior is already covered elsewhere.

### Checkpoint 2: Final Regression Sweep
- Re-run the broad regression set across all primary surfaces.
- Confirm the shell, `Home`, `Graph`, embedded `Notebook`, original-only `Reader`, generated-mode `Reader`, and `Study` still match the current benchmark direction after cleanup.

### Checkpoint 3: Closeout Baseline Refresh
- Produce one refreshed evidence set and rotate all continuity docs to a “queued roadmap complete” state.
- Leave future work intentionally parked until the user explicitly reopens a surface.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/components/RecallWorkspace.stage37.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallShellFrame.test.tsx src/components/SourceWorkspaceFrame.test.tsx src/components/ReaderSurface.test.tsx src/lib/appRoute.test.ts src/lib/graphViewFilters.test.ts src/App.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node --check` for any new or touched Stage 706/707 Playwright files
- real Windows Edge Stage 706 implementation run
- full Stage 707 closeout audit run against `http://127.0.0.1:8000`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`

## Exit Criteria
- Cross-surface regressions stay green after cleanup.
- The benchmark matrix points at one refreshed final capture set instead of a mixed ladder of intermediate checkpoints.
- The continuity docs no longer imply another queued surface redesign after closeout.
- The repo ends Stage 706/707 with an explicit stable baseline and a clear instruction that future product work must be intentionally reopened.
