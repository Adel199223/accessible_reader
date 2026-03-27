# ExecPlan: Stage 657 Home Real Media Preview Acquisition From Saved Source Attachments Reset After Stage 656

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped Home canvas intact.
- Upgrade `Home` cards from synthetic/content-derived poster treatments to real cached media previews wherever the saved source attachment or stored HTML snapshot already exposes a usable image candidate.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- Add backend preview acquisition, normalization, cache metadata, and preview-serving endpoints for Recall documents.
- Keep routing, storage schema, board cadence, shell, rail, toolbar, add-tile, and lower-card hierarchy unchanged.
- Keep paste/text/image-less HTML cards on the Stage 655 content-derived fallback path.
- No generated-content `Reader` work.

## Acceptance
- Preview-ready web or HTML-backed documents expose a cached image preview sourced from saved attachments or saved HTML candidates rather than live frontend scraping.
- Attachment-image, HTML meta-image, preload-image, and inline-image acquisition all route through one cache keyed by document `content_hash`.
- Cards without a usable image candidate cleanly keep the existing Stage 655 content-derived poster path instead of going blank.
- Representative cards stay inside the current Stage 615 width cadence and compact height band, while the Stage 617 earlier board start, Stage 619 canvas restraint, and Stage 655 content-derived fallback fidelity remain intact.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k 'preview'"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/stage657_home_real_media_preview_acquisition_from_saved_source_attachments_reset_after_stage656.mjs scripts/playwright/stage658_post_stage657_home_real_media_preview_acquisition_audit.mjs"`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 657 run against the repo-owned launcher path `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the Stage 657/658 touched set

## Outcome
- Complete locally after the Stage 657 implementation pass and Stage 658 audit.
- The pass adds a Recall-document preview service that acquires candidate media from saved source attachments or stored HTML (`og:image` / `twitter:image`, `image_src`, preload-image, then meaningful inline images), normalizes accepted images into cached `960x540` preview assets under `files/previews/`, keys cache validity off the source `content_hash`, and persists preview metadata inside the existing source-document metadata JSON without a schema migration.
- `Home` card rendering now lazily fetches preview metadata for visible cards, renders a real thumbnail image when preview kind is `image`, and keeps the Stage 655 content-derived poster path when preview kind is `fallback`.
- Live Edge evidence recorded one real cached image preview card in the visible `Web` collection (`imagePreviewCardCount: 1`, `imageNaturalWidth: 960`, `imageNaturalHeight: 540`) while representative paste cards still held the Stage 655 content-derived fallback hero seam (`fallbackHeroText: Debug import sentence one.`).
- The implementation preserved `352px` representative card width, preserved `203.52px` representative card height, preserved the Stage 617 `90.98px` heading top offset plus `115.36px` first-row grid top offset, and preserved `4` visible toolbar controls with `0` visible day-group count nodes.
- `Graph` and original-only `Reader` remain the regression surfaces for the subsequent Stage 658 audit.
