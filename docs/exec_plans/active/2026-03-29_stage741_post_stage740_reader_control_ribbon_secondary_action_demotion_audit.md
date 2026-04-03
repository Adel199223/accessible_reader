# Stage 741 - Post-Stage-740 Reader Control-Ribbon Secondary-Action Demotion Audit

## Audit Summary

- Verify that the default Reader ribbon now keeps only the primary reading controls visible at rest.
- Confirm that Source / Notebook quick access and note-entry affordances remain reachable through overflow instead of occupying equal-weight top-ribbon slots.
- Ensure the rest of the refreshed surface set remains stable.

## Audit Checklist

- Default Reader keeps the Stage 739 compact reading deck, source-destination trigger, and available-mode filtering intact.
- Default Reader no longer shows the inline Source / Notebook quick tabs or duplicate support metadata in the main ribbon.
- Default Reader keeps the core transport controls directly accessible.
- Default Reader keeps the settings trigger and the existing overflow reachable.
- Overflow still exposes the demoted secondary Reader actions needed to open Source, Notebook, and note capture flows.
- Reflowed note capture remains reachable and still opens the Notebook workbench correctly.
- `Source` support still opens the embedded library correctly.
- `Notebook` support still opens the note workbench correctly.
- `Home`, `Graph`, embedded `Notebook`, and `Study` remain stable in the same live browser pass.
- Continuity docs resume from the new Stage 741 audit and state the next intentional reopen clearly.

## Required Evidence

- Reader default wide-desktop screenshot.
- Reader control-ribbon crop proving the calmer at-rest utility set.
- Reader overflow screenshot proving the demoted actions remain reachable.
- Reader `Source` support opened screenshot.
- Reader `Notebook` workbench screenshot.
- Reader `Original`, `Reflowed`, and `Summary` screenshots, plus `Simplified` when available on the live dataset.
- Regression screenshots for `Home`, `Graph`, embedded `Notebook`, and `Study`.

## Required Checks

- targeted Vitest for `App` plus any touched Reader coverage
- `npm run build`
- `uv run pytest tests/test_api.py -k graph -q`
- `node --check` for the shared Reader harness plus Stage 740/741 scripts
- live Reader Stage 740/741 audits on `http://127.0.0.1:8000`
- `git diff --check`
