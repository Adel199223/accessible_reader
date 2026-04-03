# Stage 731 - Post-Stage-730 Reader Generated-Mode Empty-State Normalization Audit

## Audit Summary

- Verify that Stage 730 turns generated-mode unavailable states into calm inline Reader placeholders instead of top-of-page alert slabs.
- Keep the Stage 729 compact reading deck, fused support seam, quiet source strip, and frozen generated outputs intact.
- Confirm regression stability for `Home`, `Graph`, embedded `Notebook`, and `Study`.

## Audit Checklist

- `Summary` unavailable state no longer shows a large global alert banner.
- The generated empty state remains inline and actionable.
- `Create Summary` remains available when summary content is absent.
- Retry remains available for generated-mode loading failures without reopening the old full-width alert slab.
- Default Reader, Source support, Notebook workbench, and regression surfaces remain stable.

## Required Evidence

- Reader wide-desktop default screenshot.
- Reader `Summary` empty-state screenshot.
- Reader source-strip crop.
- Reader Source support open screenshot.
- Reader Notebook workbench screenshot.
- Reader `Original` and `Reflowed` screenshots.
- Regression screenshots for `Home`, `Graph`, embedded `Notebook`, and `Study`.

## Required Checks

- Targeted Vitest for Reader generated empty-state continuity.
- `npm run build`
- `uv run pytest tests/test_api.py -k graph -q`
- `node --check` for the shared Reader harness plus Stage 730/731 scripts
- Live Reader Stage 730/731 audits on `http://127.0.0.1:8000`
