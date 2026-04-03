# Stage 719 - Post-Stage-718 Reader Source Strip Flattening Audit

## Audit Goals

- Confirm the Reader-active source strip is materially flatter and less card-like than the Stage 717 baseline.
- Confirm the source strip remains compact and attached without losing tabs, metadata, or source identity.
- Confirm the Stage 717 quiet outer Reader shell, centered article field, and compact Source / Notebook seam remain intact.
- Confirm generated outputs remain frozen.

## Required Evidence

- Wide Reader default screenshot.
- Reader source-strip crop.
- Reader `Original`
- Reader `Reflowed`
- Reader `Summary`
- Source support opened crop.
- Notebook support opened crop.
- Regression captures for `Home`, `Graph`, embedded `Notebook`, and `Study`.

## Acceptance Criteria

- Source strip does not present as a visibly framed card at rest.
- Source strip height is lower than Stage 717.
- Reader outer stage remains unframed.
- Centered article field remains present and primary.
- Compact support seam remains attached and secondary at rest.
- Source / Notebook expansion still works.
- Generated outputs remain unchanged.

## Required Checks

- Targeted Vitest for Reader/source strip continuity.
- `npm run build`
- `uv run pytest tests/test_api.py -k graph -q`
- `node --check` for the shared Reader harness plus Stage 718/719 scripts
- Live Windows Edge Stage 718/719 audits on `http://127.0.0.1:8000`
