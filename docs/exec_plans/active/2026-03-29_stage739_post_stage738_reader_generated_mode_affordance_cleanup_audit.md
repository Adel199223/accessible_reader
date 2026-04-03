# Stage 739 - Post-Stage-738 Reader Generated-Mode Affordance Cleanup Audit

## Audit Summary

- Verify that the default Reader now shows only the active document's real available modes in the visible mode strip instead of keeping unavailable AI views as equal-weight pills.
- Confirm that generated-mode empty states and create flows still work when `Summary` or another supported generated mode is actually active.
- Ensure the rest of the refreshed surface set remains stable.

## Audit Checklist

- Default Reader keeps the Stage 737 compact reading band, source-destination trigger, and inline support seam.
- Default Reader exposes a calmer mode strip whose visible tabs match the current document's real `available_modes`.
- Default Reader no longer shows unavailable AI modes as equal-weight visible pills in the main mode strip.
- `Summary` empty state and `Create Summary` flow remain reachable.
- `Simplified` creation path remains reachable when supported by the product state.
- Active generated views remain legible when the user is already in `Simplified` or `Summary`.
- `Source` support still opens the embedded library correctly.
- `Notebook` support still opens the note workbench correctly.
- `Home`, `Graph`, embedded `Notebook`, and `Study` remain stable in the same live browser pass.
- Continuity docs resume from the new Stage 739 audit and state the next intentional reopen clearly.

## Required Evidence

- Reader default wide-desktop screenshot.
- Reader top-ribbon crop proving that unavailable modes are absent from the at-rest strip.
- Reader `Source` support opened screenshot.
- Reader `Notebook` workbench screenshot.
- Reader `Original`, `Reflowed`, and `Summary` screenshots, plus `Simplified` when available on the live dataset.
- Regression screenshots for `Home`, `Graph`, embedded `Notebook`, and `Study`.

## Required Checks

- targeted Vitest for `App` plus any touched Reader component coverage
- `npm run build`
- `uv run pytest tests/test_api.py -k graph -q`
- `node --check` for the shared Reader harness plus Stage 738/739 scripts
- live Reader Stage 738/739 audits on `http://127.0.0.1:8000`
- `git diff --check`
