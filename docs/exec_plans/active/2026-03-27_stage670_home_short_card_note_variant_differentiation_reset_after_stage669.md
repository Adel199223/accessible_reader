# ExecPlan: Stage 670 Home Short-Card Note-Variant Differentiation Reset After Stage 669

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Improve the remaining uniformity inside very short `content-rendered-preview` note cards so sparse one-block notes and promoted short multi-line notes no longer share the same shell composition.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- Keep preview precedence unchanged: attachment-image -> saved HTML candidate-image -> saved HTML rendered-snapshot -> content-rendered-preview -> final fallback.
- Keep the same `960x540` cached preview asset contract and the same `content-rendered-preview` source.
- Keep the current `sheet` layout for richer structured previews.
- Split the current `note` path into internal note subvariants only:
  - `focus-note` for sparse-selector-driven or one-line note previews
  - `summary-note` for short promoted note previews that still need more shape and hierarchy than the current shared note shell
- Keep shell, rail, toolbar, add-tile, board cadence, lower-card hierarchy, list mode, and generated-content `Reader` work unchanged.

## Acceptance
- The representative sparse Stage11 paste card still resolves to `image` / `content-rendered-preview`, but now keeps a distinct focused-note treatment.
- The promoted short Stage13 paste card still resolves to `image` / `content-rendered-preview`, but now reads like a different summary-note composition instead of reusing the sparse note shell.
- Structured `.txt` and richer `Web` / HTML-backed content-rendered previews keep the denser `sheet` treatment.
- Representative cards stay inside the current Stage 615 width cadence and compact height band, while the Stage 617 earlier board start, `4` visible toolbar controls, and `0` visible day-group count nodes remain intact.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k preview -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/api.test.ts src/components/RecallWorkspace.stage37.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/home_rendered_preview_quality_shared.mjs scripts/playwright/stage670_home_short_card_note_variant_differentiation_reset_after_stage669.mjs scripts/playwright/stage671_post_stage670_home_short_card_note_variant_differentiation_audit.mjs"`
- real Windows Edge implementation check against the repo-owned launcher path
- targeted `git diff --check -- ...` over the Stage 670/671 touched set
