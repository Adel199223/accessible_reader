# ExecPlan: Stage 660 Post-Stage-659 Home Rendered HTML Snapshot Preview Promotion Audit

## Summary
- Audit the Stage 659 rendered HTML snapshot preview-promotion pass against the March 25, 2026 Recall homepage benchmark.
- Confirm that wide-desktop `Home` still keeps the Stage 563 structure and the settled Stage 655 fallback path, but now upgrades the remaining HTML-backed fallback cards to real cached image thumbnails through the new rendered-snapshot source path.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - rendered-snapshot `Web` card
  - rendered-snapshot `Documents` card
  - representative fallback paste/text card
  - full Home wide-desktop view

## Acceptance
- The audit states clearly whether Stage 659 materially improves real preview fidelity for remaining HTML-backed cards without reopening shell, rail, toolbar, add-tile, width-cadence, or lower-card hierarchy work.
- The audit records at least one rendered-snapshot `Web` preview, one rendered-snapshot `Documents` preview, and one fallback poster that still uses the Stage 655 content-derived path.
- The audit records preserved Stage 615 width cadence, preserved Stage 617 earlier first-row start, and preserved `4` visible toolbar controls with `0` visible day-group count nodes while the Stage 659 rendered-snapshot preview-service pass holds.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k 'preview'"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/render_saved_html_preview_asset.mjs scripts/playwright/stage659_home_rendered_html_snapshot_preview_promotion_reset_after_stage658.mjs scripts/playwright/stage660_post_stage659_home_rendered_html_snapshot_preview_promotion_audit.mjs"`
- real Windows Edge audit run against the repo-owned launcher path `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 659/660 files

## Outcome
- Complete locally after the Stage 660 audit and validation ladder.
- The audit confirmed that Stage 659 succeeded overall: wide desktop `Home` keeps the Stage 563 selected-collection rail and day-grouped canvas, keeps the settled Stage 655 content-derived fallback path for paste/text/image-less sources, and now upgrades remaining HTML-backed `Web` plus `Documents` cards to real cached image thumbnails served from the preview API with `source: html-rendered-snapshot`.
- Live Edge evidence recorded a rendered-snapshot `Web` thumbnail (`webRenderedPreviewSourceKind: html-rendered-snapshot`, `webRenderedNaturalWidth: 960`, `webRenderedNaturalHeight: 540`) plus a rendered-snapshot `Documents` thumbnail (`documentRenderedPreviewSourceKind: html-rendered-snapshot`, `documentRenderedNaturalWidth: 960`, `documentRenderedNaturalHeight: 540`) alongside a preserved fallback paste poster with a substantial hero seam (`fallbackHeroSource: content`, `fallbackHeroText: Debug import sentence one.`).
- The audit preserved `352px` representative card width, preserved `203.52px` representative card height, preserved the Stage 617 `90.98px` heading top offset and `115.36px` first-row grid top offset, preserved `4` visible toolbar controls, preserved `0` visible day-group count nodes, and kept stable `Graph` plus original-only `Reader` regression captures green in real Windows Edge.
- The next honest `Home` move shifts away from shell/rail/toolbar/lower-card or HTML-backed preview promotion work toward even richer screenshot-like or otherwise higher-fidelity preview acquisition only if product work reopens again, now for the sources that still fall back.
