# ExecPlan: Stage 671 Post-Stage-670 Home Short-Card Note-Variant Differentiation Audit

## Summary
- Audit the Stage 670 short-card note-variant differentiation pass on wide-desktop `Home`.
- Confirm sparse note and promoted short-note cards now use materially different image compositions while richer structured previews remain stable.
- Keep `Graph` and original-only `Reader` as regression surfaces only.

## Scope
- Capture fresh wide-desktop evidence for:
  - the sparse Stage11 paste note card
  - the promoted short Stage13 paste note card
  - the promoted weak `Web` card
  - the promoted `.txt` document card
  - the full Home wide-desktop view
  - regression Graph and original-only Reader wide-desktop views
- Record image-backed differentiation metrics from the preview pixels themselves, not new frontend contracts.
- Preserve the current Home structure, width cadence, early board start, toolbar count, and hidden day-group count baseline.

## Acceptance
- The sparse Stage11 paste card remains `image` / `content-rendered-preview` and keeps the focused-note signature.
- The promoted short Stage13 paste card remains `image` / `content-rendered-preview` and now has a materially different summary-note signature from the sparse Stage11 card.
- The promoted `.txt` card remains `image` / `content-rendered-preview` with the denser `sheet` signature, and weak `Web` stays on a valid image-backed preview path.
- `Graph` and original-only `Reader` remain stable after the Home-only Stage 670 pass.

## Validation
- `node scripts/playwright/stage671_post_stage670_home_short_card_note_variant_differentiation_audit.mjs`
- Save the audit JSON plus screenshots under `output/playwright/`.
