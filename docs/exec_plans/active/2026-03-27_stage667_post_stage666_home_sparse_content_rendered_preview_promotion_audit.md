# ExecPlan: Stage 667 Post-Stage-666 Home Sparse Content-Rendered Preview Promotion Audit

## Summary
- Audit the Stage 666 sparse-content preview promotion pass against the March 25, 2026 Recall homepage benchmark.
- Confirm that wide-desktop `Home` keeps the Stage 563 structure and the settled Stage 615-665 layout baseline, while the remaining sparse stored-view paste case now promotes to a cached image preview.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - representative sparse paste card that previously resolved to final fallback
  - representative promoted paste card from the Stage 664 lane
  - representative weak Web card
  - representative local `.txt` document card
  - full Home wide-desktop view

## Acceptance
- The audit states clearly whether Stage 666 materially improves the remaining sparse text-backed Home card without reopening shell, rail, toolbar, add-tile, width-cadence, or lower-card hierarchy work.
- The representative sparse stored-view paste card now resolves to `image` / `content-rendered-preview`.
- The representative Stage 664 promoted paste, weak Web, and `.txt` cards keep their current richer preview sources.
- A truly tiny text-only source still remains eligible for final fallback when there is not enough content to build a meaningful image preview.
- The audit preserves Stage 615 width cadence, Stage 617 earlier board start, `4` visible toolbar controls, `0` visible day-group count nodes, plus stable `Graph` and original-only `Reader` regression captures.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k preview -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/api.test.ts src/components/RecallWorkspace.stage37.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/home_rendered_preview_quality_shared.mjs scripts/playwright/stage666_home_sparse_content_rendered_preview_promotion_reset_after_stage665.mjs scripts/playwright/stage667_post_stage666_home_sparse_content_rendered_preview_promotion_audit.mjs"`
- real Windows Edge audit run against a fresh temporary backend path
- targeted `git diff --check -- ...` over the Stage 666/667 touched set
