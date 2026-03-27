# ExecPlan: Stage 658 Post-Stage-657 Home Real Media-Preview Acquisition Audit

## Summary
- Audit the Stage 657 real media-preview acquisition pass against the March 25, 2026 Recall homepage benchmark.
- Confirm that wide-desktop `Home` still keeps the Stage 563 structure and the settled Stage 655 fallback path, but now shows real cached image thumbnails wherever a saved source already exposes a usable media asset.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - preview-ready image-backed card
  - representative fallback paste/text card
  - full Home wide-desktop view

## Acceptance
- The audit states clearly whether Stage 657 materially improves real preview fidelity without reopening shell, rail, toolbar, add-tile, width-cadence, or lower-card hierarchy work.
- The audit records at least one real cached image thumbnail on `Home` plus one fallback poster that still uses the Stage 655 content-derived path.
- The audit records preserved Stage 615 width cadence, preserved Stage 617 earlier first-row start, and preserved `4` visible toolbar controls with `0` visible day-group count nodes while the Stage 657 preview-service pass holds.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k 'preview'"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/stage657_home_real_media_preview_acquisition_from_saved_source_attachments_reset_after_stage656.mjs scripts/playwright/stage658_post_stage657_home_real_media_preview_acquisition_audit.mjs"`
- real Windows Edge audit run against the repo-owned launcher path `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 657/658 files

## Outcome
- Complete locally after the Stage 658 audit and validation ladder.
- The audit confirmed that Stage 657 succeeded overall: wide desktop `Home` keeps the Stage 563 selected-collection rail and day-grouped canvas, keeps the settled Stage 655 content-derived fallback path for paste/text/image-less sources, and now upgrades preview-ready saved sources to real cached image thumbnails served from the new preview API.
- Live Edge evidence recorded one real cached `Web` thumbnail sourced through the preview service (`imagePreviewCardCount: 1`, `imagePreviewSourceKind: web`, `imageNaturalWidth: 960`, `imageNaturalHeight: 540`) alongside a preserved fallback paste poster with a substantial hero seam (`fallbackHeroSource: content`, `fallbackHeroText: Debug import sentence one.`).
- The audit preserved `352px` representative card width, preserved `203.52px` representative card height, preserved the Stage 617 `90.98px` heading top offset and `115.36px` first-row grid top offset, preserved `4` visible toolbar controls, preserved `0` visible day-group count nodes, and kept stable `Graph` plus original-only `Reader` regression captures green in real Windows Edge.
- The next honest `Home` move shifts away from shell/rail/toolbar/lower-card polish toward richer preview fidelity only if product work reopens again, now around screenshot-like or otherwise higher-fidelity preview acquisition for the sources that still fall back.
