# ExecPlan: Stage 664 Home Content-Rendered Preview Promotion Reset After Stage 663

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Promote the remaining fallback-heavy Home cards from synthetic/content-derived poster treatments to cached image previews by rendering compact local preview images from stored document-view content.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- Extend the Recall preview service with a new `content-rendered-preview` source that runs after attachment-image, saved HTML candidate-image, and saved HTML rendered-snapshot acquisition, but before the final poster fallback.
- Build the content-rendered preview from stored `DocumentView` blocks, preferring `reflowed/default` and falling back to `original/default`.
- Render the new preview locally with Pillow into the existing cached `960x540` asset flow under `files/previews/`, keyed by document `content_hash`, with no storage-schema or route changes.
- Keep paste/text sources, the remaining `.txt` document, and weak HTML/web cases that still miss the richer preview paths inside this promotion scope.
- Keep shell, rail, toolbar, add-tile, board cadence, lower-card hierarchy, list mode, and generated-content `Reader` work unchanged.

## Acceptance
- Representative fallback-heavy paste and text-backed Home cards now expose cached image previews sourced from `content-rendered-preview` rather than the Stage 655 poster path alone.
- Weak HTML/web cases that miss the Stage 661 quality gate no longer stop at final fallback if stored content can support the new content-rendered image path.
- The Stage 655 poster path remains intact as the final safety path when no viable stored content or meaningful preview composition exists.
- Representative cards stay inside the current Stage 615 width cadence and compact height band, while the Stage 617 earlier board start, `4` visible toolbar controls, and `0` visible day-group count nodes remain intact.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k preview -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/api.test.ts src/components/RecallWorkspace.stage37.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/home_rendered_preview_quality_shared.mjs scripts/playwright/stage664_home_content_rendered_preview_promotion_reset_after_stage663.mjs scripts/playwright/stage665_post_stage664_home_content_rendered_preview_promotion_audit.mjs"`
- real Windows Edge implementation check against the fresh temporary backend path `http://127.0.0.1:8010`
- targeted `git diff --check -- docs/exec_plans/active/2026-03-27_stage664_home_content_rendered_preview_promotion_reset_after_stage663.md docs/exec_plans/active/2026-03-27_stage665_post_stage664_home_content_rendered_preview_promotion_audit.md backend/app/previews.py backend/app/models.py backend/tests/test_api.py frontend/src/types.ts frontend/src/components/RecallWorkspace.stage37.test.tsx scripts/playwright/home_rendered_preview_quality_shared.mjs scripts/playwright/stage664_home_content_rendered_preview_promotion_reset_after_stage663.mjs scripts/playwright/stage665_post_stage664_home_content_rendered_preview_promotion_audit.mjs`
