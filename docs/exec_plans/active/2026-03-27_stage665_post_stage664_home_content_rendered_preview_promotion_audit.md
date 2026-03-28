# ExecPlan: Stage 665 Post-Stage-664 Home Content-Rendered Preview Promotion Audit

## Summary
- Audit the Stage 664 content-rendered preview promotion pass against the March 25, 2026 Recall homepage benchmark.
- Confirm that wide-desktop `Home` keeps the Stage 563 structure and the settled Stage 615-663 layout baseline, while the remaining fallback-heavy cards now promote to cached image previews when stored content supports them.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - representative Captures paste card
  - weak Web card
  - representative local `.txt` document card
  - full Home wide-desktop view

## Acceptance
- The audit states clearly whether Stage 664 materially improves the remaining fallback-heavy Home cards without reopening shell, rail, toolbar, add-tile, width-cadence, or lower-card hierarchy work.
- The default Captures fallback-heavy representative card now resolves to `image` / `content-rendered-preview`.
- The weak Stage 10 Web case no longer remains final `fallback`; it resolves to either `html-rendered-snapshot` or `content-rendered-preview`, with the content-rendered path accepted when the HTML quality gate still rejects the rendered snapshot.
- The representative local `.txt` document card resolves to `image` / `content-rendered-preview`.
- The audit preserves Stage 615 width cadence, Stage 617 earlier board start, `4` visible toolbar controls, `0` visible day-group count nodes, plus stable `Graph` and original-only `Reader` regression captures.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k preview -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/api.test.ts src/components/RecallWorkspace.stage37.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/home_rendered_preview_quality_shared.mjs scripts/playwright/stage664_home_content_rendered_preview_promotion_reset_after_stage663.mjs scripts/playwright/stage665_post_stage664_home_content_rendered_preview_promotion_audit.mjs"`
- real Windows Edge audit run against the fresh temporary backend path `http://127.0.0.1:8010`
- targeted `git diff --check -- ...` over the Stage 664/665 touched set
