# Stage 815 - Post-Stage-814 WSL Reliability Hardening Audit

## Summary

- Validate the new repo-owned WSL preflight and launcher hardening against the healthy local machine state.
- Confirm the preflight succeeds when WSL is healthy, and confirm the launcher now depends on that preflight before backend startup and Edge launch work.
- Keep the post-Stage-813 Reader product baseline unchanged while recording the new Windows-side operational recovery path.

## Checks

- `powershell -ExecutionPolicy Bypass -File .\scripts\ensure_wsl_ready.ps1 -RepoRootWindowsPath "\\wsl.localhost\Ubuntu\home\fa507\dev\accessible_reader"`
- `powershell -ExecutionPolicy Bypass -Command "$env:RECALL_OPEN_APP_HEADLESS='1'; $env:RECALL_OPEN_APP_EXIT_AFTER_LOAD='1'; & '.\scripts\open_recall_app.ps1'"`
- `git diff --check`

## Outcome

- The documented preflight command succeeded and reported: `WSL is ready: distro 'Ubuntu' can reach '/home/fa507/dev/accessible_reader'.`
- The documented headless launcher smoke check also succeeded after the new WSL preflight passed:
  - it reused the already-healthy backend at `http://127.0.0.1:8000/recall`
  - it opened the backend-served app through the repo-owned Edge launcher path
  - on this machine it automatically fell back from the partial temporary harness under `C:\Users\FA507\AppData\Local\Temp\accessible-reader-playwright` to the healthy Codex runtime Playwright install under `C:\Users\FA507\.cache\codex-runtimes\codex-primary-runtime\dependencies\node`
- `git diff --check` passed after implementation.
- The validation pass also surfaced and closed two repo-side script bugs in `scripts/ensure_wsl_ready.ps1`:
  - the Bash single-quote escaping helper needed a valid PowerShell string construction
  - the script `param(...)` block had to precede `$ErrorActionPreference`
- The local Windows machine state is now aligned with the launcher assumptions:
  - `WslService` is back to `Manual` and starts successfully
  - `wsl --status` succeeds
  - Ubuntu can reach `/home/fa507/dev/accessible_reader`
  - the `CCleaner7` service and its `Skip UAC` scheduled task have been disabled so CCleaner no longer needs to run in the background on this machine
- This stage remains an operational overlay only; the post-Stage-813 Reader product baseline is unchanged.
