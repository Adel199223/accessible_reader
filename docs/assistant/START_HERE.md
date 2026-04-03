# Start Here

This repo is a browser-first Recall workspace with a supported Microsoft Edge browser companion. Work from WSL for repo commands, but validate the live browser surface in Windows Edge.

## Read Order

1. `BUILD_BRIEF.md`
2. `docs/ROADMAP.md`
3. `docs/ROADMAP_ANCHOR.md`
4. the active ExecPlan named there
5. `agent.md`
6. `docs/assistant/INDEX.md`

## Current Checkpoint

- latest implementation checkpoint: Stage 790 `Reader Document-Open Topbar Compaction After Stage 789`
- latest completed audit: Stage 791 `Post-Stage-790 Reader Document-Open Topbar Compaction Audit`
- no automatic next slice is queued; reopen a surface intentionally from the `post-Stage 791 Reader baseline`

## Harness Inputs

- `docs/assistant/HARNESS_PROFILE.json`
- `docs/assistant/runtime/BOOTSTRAP_STATE.json`
- `docs/assistant/manifest.json`

## Primary App Surfaces

- browser app at `http://127.0.0.1:8000/recall`
- frontend dev shell at `http://127.0.0.1:5173`
- Edge browser companion in `extension/`

## Default Open Path

Use `powershell -ExecutionPolicy Bypass -File .\\scripts\\open_recall_app.ps1` from the repo root when you need the real app on this machine.
