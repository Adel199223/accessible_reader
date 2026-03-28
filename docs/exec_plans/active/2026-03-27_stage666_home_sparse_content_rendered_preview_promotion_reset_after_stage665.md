# ExecPlan: Stage 666 Home Sparse Content-Rendered Preview Promotion Reset After Stage 665

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Promote the remaining sparse text-backed Home cards that still fall through to the Stage 655 fallback poster path even though they already have stored `DocumentView` content.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- Keep the existing preview precedence intact: attachment-image -> saved HTML candidate-image -> saved HTML rendered-snapshot -> content-rendered-preview -> final fallback.
- Refine the `content-rendered-preview` body-line selection so ultra-short sentence fragments can still compose into a viable preview when the underlying stored block is meaningful overall.
- Use stored `DocumentView` content only; do not add a broader no-view source path yet because the current local dataset has no documents that lack stored `reflowed/default` or `original/default` view blocks.
- Keep the final fallback path for truly tiny text where even aggregated stored content still does not produce a meaningful preview.
- Keep shell, rail, toolbar, add-tile, board cadence, lower-card hierarchy, list mode, and generated-content `Reader` work unchanged.

## Acceptance
- The representative sparse paste card that currently resolves to final fallback despite having stored view content now resolves to `image` / `content-rendered-preview`.
- Existing Stage 664 promoted paste, weak Web, and `.txt` cards stay on their current richer preview sources.
- A truly tiny one-sentence text import still resolves to final fallback.
- Representative cards stay inside the current Stage 615 width cadence and compact height band, while the Stage 617 earlier board start, `4` visible toolbar controls, and `0` visible day-group count nodes remain intact.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k preview -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/api.test.ts src/components/RecallWorkspace.stage37.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/home_rendered_preview_quality_shared.mjs scripts/playwright/stage666_home_sparse_content_rendered_preview_promotion_reset_after_stage665.mjs scripts/playwright/stage667_post_stage666_home_sparse_content_rendered_preview_promotion_audit.mjs"`
- real Windows Edge implementation check against a fresh temporary backend path
- targeted `git diff --check -- ...` over the Stage 666/667 touched set
