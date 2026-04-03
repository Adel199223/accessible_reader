# Stage 717 - Post-Stage-716 Reader Outer Shell Flattening Audit

## Audit Goals

- Confirm the Reader no longer presents the whole reading deck as one large framed stage shell.
- Confirm the centered article field from Stage 715 remains intact and still owns the visible reading chrome.
- Confirm the compact Source / Notebook seam remains attached and secondary at rest.
- Confirm Source / Notebook expansion, anchored note work, and generated-mode invariants remain stable.

## Required Evidence

- Wide Reader default screenshot.
- Wide Reader `Original` screenshot.
- Wide Reader `Reflowed` screenshot.
- Wide Reader `Summary` screenshot.
- Source support opened crop.
- Notebook support opened crop.
- Regression captures for `Home`, `Graph`, embedded `Notebook`, and `Study`.

## Acceptance Criteria

- No visible heavy outer Reader stage frame at rest.
- The outer Reader stage does not show a visible card-like background, border, or top highlight seam.
- The centered article field remains present and visually primary.
- The compact support seam remains collapsed and secondary at rest.
- Source / Notebook expansion still works.
- Generated outputs remain frozen.

## Required Checks

- Targeted Vitest for Reader and route continuity.
- `npm run build`
- `uv run pytest tests/test_api.py -k graph -q`
- `node --check` for the shared Reader harness plus Stage 716/717 scripts
- Live Windows Edge Stage 716/717 audits on `http://127.0.0.1:8000`
