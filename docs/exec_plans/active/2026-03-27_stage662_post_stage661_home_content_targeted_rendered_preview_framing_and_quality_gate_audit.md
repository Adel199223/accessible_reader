# ExecPlan: Stage 662 Post-Stage-661 Home Content-Targeted Rendered Preview Framing And Quality Gate Audit

## Summary
- Audit the Stage 661 rendered-preview framing and quality-gate pass against the March 25, 2026 Recall homepage benchmark.
- Confirm that wide-desktop `Home` still keeps the Stage 563 structure and the settled Stage 655 fallback path, but now rejects washed-out low-information rendered HTML thumbnails while preserving rich rendered snapshots where saved HTML supports them.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - weak HTML-backed `Web` card
  - rendered `Documents` card
  - representative fallback paste/text card
  - full Home wide-desktop view

## Acceptance
- The audit states clearly whether Stage 661 materially improves rendered-preview quality for saved HTML cards without reopening shell, rail, toolbar, add-tile, width-cadence, or lower-card hierarchy work.
- The audit records a previously weak HTML-backed `Web` case that now either shows a richer rendered crop or falls back cleanly; low-information pale real thumbnails are no longer accepted.
- The audit records at least one strong rendered `Documents` HTML preview that still resolves through `html-rendered-snapshot`, plus one fallback poster that still uses the Stage 655 content-derived path.
- The audit records preserved Stage 615 width cadence, preserved Stage 617 earlier first-row start, and preserved `4` visible toolbar controls with `0` visible day-group count nodes while the Stage 661 framing and quality gate hold.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k 'rendered_snapshot or preview'"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/render_saved_html_preview_asset.mjs scripts/playwright/home_rendered_preview_quality_shared.mjs scripts/playwright/stage661_home_content_targeted_rendered_preview_framing_and_quality_gate_reset_after_stage660.mjs scripts/playwright/stage662_post_stage661_home_content_targeted_rendered_preview_framing_and_quality_gate_audit.mjs"`
- real Windows Edge audit run against the repo-owned launcher path `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Stage 661/662 files

## Outcome
- Complete locally after the Stage 662 audit and validation ladder.
- The audit confirmed that Stage 661 succeeded overall: wide desktop `Home` keeps the Stage 563 selected-collection rail and day-grouped canvas, keeps the settled Stage 655 content-derived fallback path for paste/text/image-less cards, preserves strong rendered HTML previews where saved content is rich, and now rejects washed-out low-signal HTML snapshots before they can present as pale image thumbnails.
- Live Edge evidence recorded a weak HTML-backed `Web` case that now falls back cleanly (`weakWebPreviewMediaKind: fallback`, `weakWebPreviewSourceKind: fallback`, `weakWebHeroText: Debug harness sentence alpha.`), a content-rich `Documents` thumbnail that remains `html-rendered-snapshot` (`documentRenderedNaturalWidth: 960`, `documentRenderedNaturalHeight: 540`, `documentSignalStddev: 37.63`, `documentSignalLightCoverage: 0.8858`, `documentSignalDarkCoverage: 0.0252`), and a preserved fallback paste poster with a substantial content-derived hero seam (`fallbackHeroText: Debug import sentence one.`).
- The audit preserved `352px` representative card width, preserved `203.52px` representative card height, preserved the Stage 617 `90.98px` heading top offset and `115.36px` first-row grid top offset, preserved `4` visible toolbar controls, preserved `0` visible day-group count nodes, and kept stable `Graph` plus original-only `Reader` regression captures green in real Windows Edge.
- The next honest `Home` move shifts away from HTML-backed snapshot framing and quality-gate work toward even richer screenshot-like or otherwise higher-fidelity preview generation only for the sources that still fall back.
