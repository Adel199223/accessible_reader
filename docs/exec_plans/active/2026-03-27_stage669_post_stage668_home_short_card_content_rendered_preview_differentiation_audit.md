# ExecPlan: Stage 669 Post-Stage-668 Home Short-Card Content-Rendered Preview Differentiation Audit

## Summary
- Audit the Stage 668 short-card content-rendered preview differentiation pass against the March 25, 2026 Recall homepage benchmark and the latest user screenshots.
- Confirm that wide-desktop `Home` keeps the Stage 563 structure and the settled Stage 615-667 layout baseline while short note-like previews now read more deliberately.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - representative sparse paste card
  - representative Stage 664 promoted paste card
  - representative weak Web card
  - representative local `.txt` document card
  - full Home wide-desktop view

## Acceptance
- The audit states clearly whether Stage 668 materially improves short-card preview differentiation without reopening shell, rail, toolbar, add-tile, width cadence, or lower-card hierarchy work.
- The representative sparse paste card still resolves to `image` / `content-rendered-preview` and now reads more like a deliberate note preview than a miniature document sheet.
- The representative Stage 664 promoted paste, weak Web, and `.txt` cards keep their current richer preview sources while preserving stronger structured-preview composition.
- The audit preserves Stage 615 width cadence, Stage 617 earlier board start, `4` visible toolbar controls, `0` visible day-group count nodes, plus stable `Graph` and original-only `Reader` regression captures.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k preview -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/api.test.ts src/components/RecallWorkspace.stage37.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/home_rendered_preview_quality_shared.mjs scripts/playwright/stage668_home_short_card_content_rendered_preview_differentiation_reset_after_stage667.mjs scripts/playwright/stage669_post_stage668_home_short_card_content_rendered_preview_differentiation_audit.mjs"`
- real Windows Edge audit run against a fresh temporary backend path
- targeted `git diff --check -- ...` over the Stage 668/669 touched set
