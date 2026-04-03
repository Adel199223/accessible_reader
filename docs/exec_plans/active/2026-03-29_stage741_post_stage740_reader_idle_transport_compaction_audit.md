# Stage 741 - Post-Stage-740 Reader Idle Transport Compaction Audit

## Audit Summary

- Verify that the default Reader now keeps the at-rest transport chrome minimal, with one primary read-aloud action instead of the full idle transport cluster.
- Confirm that active playback still exposes the full transport model in component coverage.
- Ensure the rest of the refreshed surface set remains stable.

## Audit Checklist

- Default Reader keeps the Stage 739 compact reading band, available-mode strip, source-destination trigger, and inline support seam.
- Default Reader shows one primary read-aloud affordance at rest instead of the full previous / play / next / stop cluster.
- Default Reader no longer shows idle sentence progress in the main control ribbon.
- Settings, overflow, note capture, and inline Source / Notebook quick access remain reachable.
- `Summary` empty state and `Create Summary` flow remain reachable when supported.
- `Simplified` creation path remains reachable when supported by the live product state.
- `Source` support still opens the embedded library correctly.
- `Notebook` support still opens the note workbench correctly.
- `Home`, `Graph`, embedded `Notebook`, and `Study` remain stable in the same live browser pass.
- Continuity docs resume from the new Stage 741 audit and state the next intentional reopen clearly.

## Required Evidence

- Reader default wide-desktop screenshot.
- Reader control-ribbon crop proving the calmer idle transport state.
- Reader `Source` support opened screenshot.
- Reader `Notebook` workbench screenshot.
- Reader `Original`, `Reflowed`, and `Summary` screenshots, plus `Simplified` when available on the live dataset.
- Regression screenshots for `Home`, `Graph`, embedded `Notebook`, and `Study`.

## Required Checks

- targeted Vitest for `App` plus any touched Reader component coverage
- `npm run build`
- `uv run pytest tests/test_api.py -k graph -q`
- `node --check` for the shared Reader harness plus Stage 740/741 scripts
- live Reader Stage 740/741 audits on `http://127.0.0.1:8000`
- `git diff --check`
