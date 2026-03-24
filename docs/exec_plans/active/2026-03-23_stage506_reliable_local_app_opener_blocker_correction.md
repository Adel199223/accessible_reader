# ExecPlan: Stage 506 Reliable Local App Opener Blocker Correction

## Summary
- A tooling gap blocked the expected `open the app` workflow even though the local app itself was healthy.
- The failure had three concrete causes on this machine:
  - no repo-owned launcher exists for start-or-reuse plus open
  - backend-served `/recall` depends on a built frontend shell
  - direct Windows browser-launch shell commands are blocked in this environment even though Playwright-based Edge launches work
- Add one bounded repo-owned launcher path that starts or reuses the local app and opens a visible Edge window for manual testing.
- Keep this work scoped to tooling and runbook/docs only, then return to the Stage 505 `Home` audit.

## Implementation Scope
- Add a Windows-side launcher at `scripts/open_recall_app.ps1`.
  - resolve repo paths absolutely
  - reuse the backend only when both `/api/health` and `/recall` return `200`
  - build `frontend/dist` before backend startup when the built shell is missing
  - if the backend is already alive but `/recall` is unavailable, treat it as not healthy for app-opening purposes and restart the repo-local backend after the shell build check
  - start the backend through `wsl.exe --cd ... --exec .../.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000`
  - wait for bounded readiness and fail with actionable messages plus a backend log path
- Add a repo-owned Edge opener at `scripts/playwright/open_recall_in_edge.mjs`.
  - launch real Edge with Playwright using `channel: 'msedge'`
  - use a temporary user-data dir
  - open the requested URL and keep the window open for manual testing by default
  - support smoke-only env overrides for URL, headless mode, exit-after-load, and harness path
  - do not fall back silently to Chromium
- Update docs/runbook usage in:
  - `README.md`
  - `agent.md`

## Acceptance
- `powershell -ExecutionPolicy Bypass -File .\scripts\open_recall_app.ps1` becomes the default repo command for opening the app on this machine.
- A missing backend, missing built shell, or blocked browser shell command no longer breaks the workflow.
- Future Codex sessions have a documented launcher path instead of ad hoc browser commands.
- No product UI, route contract, or backend API behavior changes.

## Validation
- `node --check scripts/playwright/open_recall_in_edge.mjs`
- smoke opener run with:
  - `RECALL_OPEN_APP_HEADLESS=1`
  - `RECALL_OPEN_APP_EXIT_AFTER_LOAD=1`
- launcher validation scenarios:
  - backend-down startup path
  - backend-already-up reuse path
  - missing-`frontend/dist` rebuild path
- `git diff --check`

## Assumptions
- Default target remains backend-served `http://127.0.0.1:8000/recall`, not Vite on `5173`.
- Windows `node` plus the existing Playwright harness remain available on this machine.
- This is a blocker correction, not a roadmap reprioritization; return to the Stage 505 `Home` audit after it lands.

## Closeout Notes
- Landed `scripts/open_recall_app.ps1` as the canonical repo command for opening the local app from Windows.
- Landed `scripts/playwright/open_recall_in_edge.mjs` as the repo-owned Microsoft Edge opener so future sessions do not rely on blocked shell browser commands.
- Updated `README.md` and `agent.md` so the launcher path is the default documented workflow.
- Validated healthy-backend reuse, backend-down recovery, missing-`frontend/dist` rebuild, a visible Edge launch with auto-exit after load, and a clear missing-harness failure message.
- After this tooling correction, resume the pre-staged Stage 505 `Home` audit rather than treating Stage 506 as a new product-surface checkpoint.
