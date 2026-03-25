# ExecPlan: Bootstrap Harness Adoption Sync

## Summary
- Adopt the vendored `bootstrap_harness_kit/` into this existing repo by following the kit README and the existing-repo quickstart path.
- Preserve repo-specific harness truths, roadmap continuity, and product behavior while refreshing reusable harness source and any missing repo-local outputs.
- Keep this as a harness/documentation/tooling pass only; do not change product logic.

## Scope
- Audit the current repo-local harness against the kit-managed reusable source.
- Seed or refresh reusable harness files from `bootstrap_harness_kit/` into the repo where appropriate.
- Validate and update `docs/assistant/HARNESS_PROFILE.json`.
- Write or refresh `docs/assistant/runtime/BOOTSTRAP_STATE.json`.
- Add `docs/assistant/HARNESS_OUTPUT_MAP.json` if the repo already relies on established local equivalents for generic harness outputs.
- Sync repo-local harness docs and manifest entries needed to satisfy the resolved output set.

## Acceptance
- The repo follows the existing-repo adoption path from `bootstrap_harness_kit/QUICKSTART_EXISTING_REPO.md`.
- Kit-managed reusable files are present in the repo without editing `docs/assistant/templates/*` by hand beyond the adoption flow.
- The harness profile validates against the registry.
- The preview/state flow completes and the resolved sync targets are satisfied.
- Repo-local harness files continue to reflect this project's browser-first, local-first, Edge-targeted, WSL-based operating truths.

## Validation
- `python3 tooling/check_harness_profile.py --profile docs/assistant/HARNESS_PROFILE.json --registry docs/assistant/templates/BOOTSTRAP_ARCHETYPE_REGISTRY.json`
- `python3 tooling/preview_harness_sync.py --profile docs/assistant/HARNESS_PROFILE.json --registry docs/assistant/templates/BOOTSTRAP_ARCHETYPE_REGISTRY.json --write-state docs/assistant/runtime/BOOTSTRAP_STATE.json`
- `python3 tooling/preview_harness_sync.py --profile docs/assistant/HARNESS_PROFILE.json --registry docs/assistant/templates/BOOTSTRAP_ARCHETYPE_REGISTRY.json --json`
- confirm manifest-referenced harness paths exist
- `git diff --check`

## Outcome
- Complete.
- The existing-repo adoption path was followed from `bootstrap_harness_kit/QUICKSTART_EXISTING_REPO.md`.
- The seeded kit-managed source was already aligned with the vendored kit, so the seed pass skipped all existing reusable files and did not require template refreshes or a `HARNESS_OUTPUT_MAP.json`.
- The repo-local harness had one real continuity drift: `docs/assistant/manifest.json` still described Stage 521/522 as the current checkpoint pair, so the manifest contract was updated to the current Stage 532 post-audit hold state.
- `docs/assistant/runtime/BOOTSTRAP_STATE.json` was refreshed from the resolved preview, and the preview re-confirmed `missing_sync_targets: []`.
- Validation passed for profile resolution, bootstrap-state preview, manifest path existence, and `git diff --check` stayed free of whitespace errors.
