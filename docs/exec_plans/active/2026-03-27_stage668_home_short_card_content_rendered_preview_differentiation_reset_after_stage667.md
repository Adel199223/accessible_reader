# ExecPlan: Stage 668 Home Short-Card Content-Rendered Preview Differentiation Reset After Stage 667

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Improve the remaining visual mismatch inside very short `content-rendered-preview` cards so sparse note-like cards no longer read like miniature generic document sheets.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- Keep preview precedence unchanged: attachment-image -> saved HTML candidate-image -> saved HTML rendered-snapshot -> content-rendered-preview -> final fallback.
- Keep the same `960x540` cached preview asset contract and the same `content-rendered-preview` source.
- Add internal content-rendered layout variants only:
  - `sheet` stays the default for richer structured previews
  - `note` is selected for very short one-block or sparse-selector-driven content
- Keep shell, rail, toolbar, add-tile, board cadence, lower-card hierarchy, list mode, and generated-content `Reader` work unchanged.

## Acceptance
- The representative sparse paste card still resolves to `image` / `content-rendered-preview`, but now reads like a deliberate note preview rather than a shrunken document sheet.
- Stage 664 promoted paste, weak Web, and `.txt` cards keep their richer preview sources while preserving a stronger document/article feel where appropriate.
- The final fallback path remains reserved for truly tiny text-only imports.
- Representative cards stay inside the current Stage 615 width cadence and compact height band, while the Stage 617 earlier board start, `4` visible toolbar controls, and `0` visible day-group count nodes remain intact.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k preview -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/api.test.ts src/components/RecallWorkspace.stage37.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/home_rendered_preview_quality_shared.mjs scripts/playwright/stage668_home_short_card_content_rendered_preview_differentiation_reset_after_stage667.mjs scripts/playwright/stage669_post_stage668_home_short_card_content_rendered_preview_differentiation_audit.mjs"`
- real Windows Edge implementation check against a fresh temporary backend path
- targeted `git diff --check -- ...` over the Stage 668/669 touched set
