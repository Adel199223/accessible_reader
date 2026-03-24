# ExecPlan: Phase 2B Harness Second Pilot

## Goal

- seed `accessible_reader` with the stabilized reusable harness source
- derive and apply the correct profile-driven harness for this repo's actual structure
- keep the pilot repo-local and product-safe

## Non-goals

- no product/app logic changes
- no changes to unrelated dirty files already present in this repo
- no legalpdf-specific naming assumptions in repo-local outputs unless a truly generic shared fix requires them upstream

## Scope

- In:
  - `docs/assistant/templates/**`
  - `docs/assistant/schemas/HARNESS_PROFILE.schema.json`
  - `tooling/bootstrap_profile_wizard.py`
  - `tooling/check_harness_profile.py`
  - `tooling/preview_harness_sync.py`
  - `tooling/harness_profile_lib.py`
  - `.vscode/mcp.json.example`
  - repo-local harness inputs and synced docs
- Out:
  - frontend/backend/extension product logic
  - unrelated roadmap/product dirty-tree files

## Provenance

- Worktree path: `\\wsl.localhost\Ubuntu\home\fa507\dev\accessible_reader`
- Branch: `main`
- Base branch: `main`
- Base SHA: `c3c1dd8ca43816b97fb5e99ff89e35f9bc2964de`
- Target integration branch: `main`
- Canonical status: current working tree requested by the user for this second pilot

## Contracts affected

- Repo profile contract:
  - archetype `web_app`
  - mode `full`
  - browser-first surfaces with browser companion support
  - no desktop or CLI surface
- Repo-local harness contract:
  - preserve existing Recall/Edge/WSL/AI truths while adding the missing profile-driven docs

## Implementation steps

- Add the active ExecPlan.
- Seed the reusable source from stabilized `legalpdf_translate`.
- Create `docs/assistant/HARNESS_PROFILE.json`.
- Preview and write `docs/assistant/runtime/BOOTSTRAP_STATE.json`.
- Apply the repo-local harness sync to existing surfaces and new generic outputs.
- Validate preview cleanliness and manifest path integrity.

## Tests and acceptance

- `python tooling/check_harness_profile.py --profile docs/assistant/HARNESS_PROFILE.json --registry docs/assistant/templates/BOOTSTRAP_ARCHETYPE_REGISTRY.json`
- `python tooling/preview_harness_sync.py --profile docs/assistant/HARNESS_PROFILE.json --registry docs/assistant/templates/BOOTSTRAP_ARCHETYPE_REGISTRY.json --write-state docs/assistant/runtime/BOOTSTRAP_STATE.json`
- rerun preview with `--json` and require `missing_sync_targets: []`
- parse `docs/assistant/manifest.json` and confirm referenced harness paths exist
- Acceptance:
  - repo resolves without `legalpdf_translate`-specific mappings
  - browser-first + Edge companion + WSL truths remain intact
  - only harness files are staged for the pilot commit

## Risks and mitigations

- Risk: existing dirty `agent.md` and `docs/assistant/INDEX.md` get overwritten.
  - Mitigation: merge into current file state instead of replacing wholesale.
- Risk: generic outputs conflict with old lightweight harness expectations.
  - Mitigation: keep sync additive and prefer new generic outputs where no existing local equivalent exists.

## Assumptions

- The extension is a supported app surface, but it remains context-only.
- The repo does not expose a user-facing CLI surface.

## Executed validations and outcomes

- `python3 tooling/check_harness_profile.py --profile docs/assistant/HARNESS_PROFILE.json --registry docs/assistant/templates/BOOTSTRAP_ARCHETYPE_REGISTRY.json`
  - Passed.
- `python3 tooling/preview_harness_sync.py --profile docs/assistant/HARNESS_PROFILE.json --registry docs/assistant/templates/BOOTSTRAP_ARCHETYPE_REGISTRY.json --write-state docs/assistant/runtime/BOOTSTRAP_STATE.json --json`
  - Passed.
  - `missing_sync_targets: []`.
- manifest parse and referenced-path existence check
  - Passed.
- Outcome:
  - `accessible_reader` resolved cleanly as a second-shape pilot with `web_app` + `full`
  - no repo-local output map was required
  - browser-first, Edge companion, WSL-hosted, and opt-in AI truths were preserved
