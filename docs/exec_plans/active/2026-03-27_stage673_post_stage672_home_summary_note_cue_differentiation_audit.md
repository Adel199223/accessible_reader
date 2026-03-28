# ExecPlan: Stage 673 Post-Stage-672 Home Summary-Note Cue Differentiation Audit

## Summary
- Audit the Stage 672 summary-note cue differentiation pass against the March 25, 2026 Recall homepage benchmark lane.
- Confirm that short summary-note cards now carry distinct cue-led accents without disturbing the settled Home structure or the stable `Graph` and original-only `Reader` baselines.

## Scope
- Audit wide-desktop `Home` first on the repo-owned Windows Edge path.
- Capture:
  - the representative sparse Stage11 focus-note card
  - the representative Stage13 Debug summary-note card
  - a second short summary-note control in the Captures lane
  - the weak `Web` control
  - the `.txt` sheet control
  - a wide Home overview, Graph overview, and original-only Reader overview
- Preserve the existing Home regression gates:
  - Stage 615 width cadence
  - Stage 617 earlier board start
  - `4` visible toolbar controls
  - `0` visible day-group count nodes

## Acceptance
- Stage13 Debug remains `image` / `content-rendered-preview` and visibly carries the new cue-led summary-note treatment.
- The second short summary-note control also remains `image` / `content-rendered-preview`, but its cue treatment is visibly different from Stage13 Debug.
- Stage11 stays on the compact focus-note footprint.
- `.txt` and richer `Web` controls remain on their established paths.
- `Graph` and original-only `Reader` remain stable.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/home_rendered_preview_quality_shared.mjs scripts/playwright/stage672_home_summary_note_cue_differentiation_reset_after_stage671.mjs scripts/playwright/stage673_post_stage672_home_summary_note_cue_differentiation_audit.mjs"`
- `node "\\\\wsl.localhost\\Ubuntu\\home\\fa507\\dev\\accessible_reader\\scripts\\playwright\\stage672_home_summary_note_cue_differentiation_reset_after_stage671.mjs"`
- `node "\\\\wsl.localhost\\Ubuntu\\home\\fa507\\dev\\accessible_reader\\scripts\\playwright\\stage673_post_stage672_home_summary_note_cue_differentiation_audit.mjs"`
