# Stage 814 - WSL Reliability Hardening After Stage 813

## Summary

- Keep the canonical repo and toolchain in WSL instead of migrating the project to native Windows.
- Harden the repo-owned Windows launcher path so it preflights WSL readiness before any repo-path conversion, backend startup, or Edge launch work.
- Document the exact elevated recovery commands for the local machine when `WslService` is disabled, while keeping the post-Stage-813 Reader product baseline unchanged.

## Why This Stage Exists

- The current blocker is machine-side, not product-side: `WslService` can be flipped to `Disabled`, which makes the canonical UNC repo path disappear entirely.
- The existing repo-owned launcher assumes WSL is already healthy and only reports failures later, after it has already started path conversion and backend checks.
- The project still benefits from keeping the repo canonical in WSL, but the Windows-side launcher needs a deterministic preflight so stopped services auto-recover and disabled services fail fast with the correct elevated repair commands.

## Scope

### In scope

- Add a Windows-side repo-owned preflight script at `scripts/ensure_wsl_ready.ps1`.
- Make `scripts/open_recall_app.ps1` call the new preflight before any WSL path conversion or backend startup logic.
- Ensure the preflight:
  - tries `Start-Service` when `WslService` is stopped but not disabled
  - fails fast with explicit elevated repair commands when `WslService` is disabled
  - verifies `wsl --status`
  - verifies the canonical repo path exists inside the Ubuntu distro before launch proceeds
- Update local runbook docs so they state clearly that:
  - the canonical repo stays in WSL
  - the launcher now preflights WSL
  - the elevated recovery commands are the first response when `WslService` is disabled

### Out of scope

- No Reader UI or generated-content changes.
- No backend API, schema, or storage changes.
- No migration of the repo to native Windows.
- No scheduled self-healing task or external Windows service-management automation.

## Implementation Notes

- Primary files:
  - `scripts/ensure_wsl_ready.ps1`
  - `scripts/open_recall_app.ps1`
- Continuity and runbook docs to update after validation:
  - `BUILD_BRIEF.md`
  - `AGENTS.md`
  - `agent.md`
  - `docs/ROADMAP.md`
  - `docs/ROADMAP_ANCHOR.md`
  - `docs/assistant/INDEX.md`

## Required Checks

- `powershell -ExecutionPolicy Bypass -File .\scripts\ensure_wsl_ready.ps1 -RepoRootWindowsPath "\\wsl.localhost\Ubuntu\home\fa507\dev\accessible_reader"`
- `powershell -ExecutionPolicy Bypass -Command "$env:RECALL_OPEN_APP_HEADLESS='1'; $env:RECALL_OPEN_APP_EXIT_AFTER_LOAD='1'; & '.\scripts\open_recall_app.ps1'"`
- `git diff --check`

## Follow-Through

- Keep the post-Stage-813 Reader product baseline as the active product continuity anchor after this pass.
- Once the launcher hardening is validated, return future product work to intentional Reader or Recall reopens instead of continuing environment-only churn.
