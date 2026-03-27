# ExecPlan: Stage 659 Home Rendered HTML Snapshot Preview Promotion Reset After Stage 658

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped `Home` canvas intact.
- Upgrade the remaining HTML-backed fallback cards from synthetic/content-derived poster treatments to real cached media previews by rendering saved HTML snapshots when attachment/meta/preload/inline image acquisition cannot find a usable candidate.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- Extend the Recall preview service so saved HTML sources can promote to real image previews through a rendered local snapshot path rather than staying on the Stage 655 content-derived fallback poster.
- Keep routing, storage schema, board cadence, shell, rail, toolbar, add-tile, and lower-card hierarchy unchanged.
- Keep paste/text/image-less sources on the Stage 655 content-derived fallback path.
- No generated-content `Reader` work.

## Acceptance
- HTML-backed `web` or document cards without a direct candidate image can still expose a cached image preview sourced from a rendered saved HTML snapshot rather than a synthetic-only poster.
- The rendered-snapshot path routes through the existing preview cache keyed by document `content_hash`, stores normalized `960x540` assets, and persists preview metadata inside the existing source-document metadata JSON without a schema migration.
- Cards without a usable HTML snapshot continue to keep the existing Stage 655 content-derived poster path instead of going blank.
- Representative cards stay inside the current Stage 615 width cadence and compact height band, while the Stage 617 earlier board start and Stage 655 fallback fidelity remain intact.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k 'preview'"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/render_saved_html_preview_asset.mjs scripts/playwright/stage659_home_rendered_html_snapshot_preview_promotion_reset_after_stage658.mjs scripts/playwright/stage660_post_stage659_home_rendered_html_snapshot_preview_promotion_audit.mjs"`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 659 run against the repo-owned launcher path `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the Stage 659/660 touched set

## Outcome
- Complete locally after the Stage 659 implementation pass and Stage 660 audit.
- The pass extends the Recall-document preview service with a rendered-snapshot fallback that opens saved local HTML through a repo-owned Playwright helper, captures a bounded top-of-page image, normalizes it into a cached `960x540` preview asset under `files/previews/`, keys cache validity off the source `content_hash`, and persists the new `html-rendered-snapshot` metadata inside the existing source-document metadata JSON without a schema migration.
- `Home` card rendering now preserves the Stage 655 content-derived fallback path for paste/text sources while lazily promoting remaining HTML-backed `Web` and `Documents` cards to real cached image previews when the preview API reports `source: html-rendered-snapshot`.
- Live Edge evidence recorded a rendered-snapshot `Web` preview (`webRenderedPreviewSourceKind: html-rendered-snapshot`, `webRenderedNaturalWidth: 960`, `webRenderedNaturalHeight: 540`), a rendered-snapshot `Documents` preview (`documentRenderedPreviewSourceKind: html-rendered-snapshot`, `documentRenderedNaturalWidth: 960`, `documentRenderedNaturalHeight: 540`), and a preserved paste fallback hero seam (`fallbackHeroText: Debug import sentence one.`).
- The implementation preserved `352px` representative card width, preserved `203.52px` representative card height, preserved the Stage 617 `90.98px` heading top offset plus `115.36px` first-row grid top offset, and preserved `4` visible toolbar controls with `0` visible day-group count nodes.
- `Graph` and original-only `Reader` remain the regression surfaces for the subsequent Stage 660 audit.
