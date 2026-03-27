# ExecPlan: Stage 661 Home Content-Targeted Rendered Preview Framing And Quality Gate Reset After Stage 660

## Summary
- Keep the Stage 563 selected-collection rail plus day-grouped `Home` canvas intact.
- Improve `html-rendered-snapshot` fidelity only for `Home` cards that already depend on saved HTML, so content-rich sources keep a real image preview while low-signal pale captures fall back cleanly to the Stage 655 poster path.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- `Home` only.
- Keep preview-source precedence unchanged: attachment image, HTML meta image, HTML preload image, HTML inline image, rendered HTML snapshot, then fallback poster.
- Upgrade the saved-HTML snapshot helper so it scores meaningful content regions instead of clipping the first large root box.
- Add a rendered-preview quality gate so weak rendered snapshots are rejected before caching and the card naturally keeps the Stage 655 fallback poster.
- Keep routing, storage schema, shell, rail, toolbar, board cadence, add tile, and lower-card hierarchy unchanged.
- Keep paste/text sources on the existing Stage 655 content-derived fallback path.
- No generated-content `Reader` work.

## Acceptance
- Content-rich saved HTML cards can still expose a cached image preview sourced from `html-rendered-snapshot`, but the captured framing now prefers readable article-like regions rather than top-of-page blank chrome.
- Low-information rendered snapshots are rejected before caching and resolve back to the existing fallback poster path instead of surfacing pale low-signal thumbnails.
- Representative cards stay inside the current Stage 615 width cadence and compact height band, while the Stage 617 earlier board start and the Stage 655 fallback poster path remain intact.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k 'rendered_snapshot or preview'"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- src/components/RecallShellFrame.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/components/RecallWorkspace.stage37.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/render_saved_html_preview_asset.mjs scripts/playwright/home_rendered_preview_quality_shared.mjs scripts/playwright/stage661_home_content_targeted_rendered_preview_framing_and_quality_gate_reset_after_stage660.mjs scripts/playwright/stage662_post_stage661_home_content_targeted_rendered_preview_framing_and_quality_gate_audit.mjs"`
- live `200` checks for `/recall`, `/recall?section=graph`, and `/reader`
- real Windows Edge Stage 661 run against the repo-owned launcher path `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the Stage 661/662 touched set

## Outcome
- Complete locally after the Stage 661 implementation pass and Stage 662 audit.
- The pass upgrades saved-HTML snapshot framing so the helper waits for layout to settle, scores article-like content regions and meaningful descendants, scrolls the chosen region into view when needed, and captures a padded `16:9` clip around the strongest content target instead of clipping the first large root box.
- The preview service now rejects obviously low-information rendered snapshots before caching by using a rendered-preview quality gate and a bumped preview metadata version, so poor pale captures fall back cleanly to the existing Stage 655 poster path.
- Live Edge evidence recorded that a previously weak HTML-backed `Web` card now resolves to `fallback` (`weakWebPreviewMediaKind: fallback`, `weakWebPreviewSourceKind: fallback`, `weakWebHeroText: Debug harness sentence alpha.`), while a content-rich `Documents` HTML card stays on `html-rendered-snapshot` (`documentRenderedNaturalWidth: 960`, `documentRenderedNaturalHeight: 540`, `documentSignalStddev: 37.63`).
- The implementation preserved `352px` representative card width, preserved `203.52px` representative card height, preserved the Stage 617 `90.98px` heading top offset plus `115.36px` first-row grid top offset, and preserved `4` visible toolbar controls with `0` visible day-group count nodes.
- `Graph` and original-only `Reader` remain the regression surfaces for the subsequent Stage 662 audit.
