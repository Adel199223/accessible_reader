# Host Integration

This repo is split across two host contexts:

- WSL runs the repo toolchain, backend commands, frontend commands, and extension build/test commands.
- Windows hosts the real Microsoft Edge validation target and the PowerShell launcher.

## Rules

- prefer `wsl.exe bash -lc ...` for repo commands
- use Windows Edge for real browser validation
- treat extension and browser-companion checks as Windows-host-bound
- do not replace the repo-owned launcher with ad hoc browser shell commands
