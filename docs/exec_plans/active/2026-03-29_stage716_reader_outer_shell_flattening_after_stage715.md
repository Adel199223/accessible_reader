# Stage 716 - Reader Outer Shell Flattening After Stage 715

## Summary

- Reopen `Reader` as the sole active surface after the Stage 715 article-field baseline.
- Keep the centered article field and compact Source / Notebook support seam from Stages 712-715.
- Remove the remaining “large framed deck” feeling around the entire Reader stage so the page reads more like attached reading controls plus a dedicated reading field, not a big card wrapped around everything.
- Generated `Original`, `Reflowed`, `Simplified`, and `Summary` outputs remain frozen.

## Why This Stage Exists

- Stage 715 fixed the inner article field, but the surrounding Reader stage still reads as one large framed panel.
- The latest Reader benchmark direction is calmer and more attached to the page:
  - source strip slim
  - stage chrome compact
  - article field primary
  - compact support seam secondary
- The next useful pass is to flatten the outer Reader shell, not reopen generated content or expand support complexity again.

## Scope

### In scope

- Flatten the outer `.reader-reading-stage` shell so it no longer presents as a prominent card.
- Soften or retire the top border glow / frame treatment inherited from `priority-surface-stage-shell`.
- Keep the title row, view controls, read-aloud transport, article field, and compact support seam intact.
- Preserve Source / Notebook expansion behavior and anchored note workflows.
- Update the Reader tests and live Reader audit to prove the outer stage is visually quiet at rest.

### Out of scope

- No backend changes.
- No route changes.
- No Add Content, Home, Graph, Notebook-placement, or Study changes beyond regression proof.
- No generated output or transform behavior changes.

## Implementation Notes

- Favor CSS and lightweight layout refinement in:
  - `frontend/src/components/ReaderWorkspace.tsx`
  - `frontend/src/index.css`
- Keep the visible article field as the primary framed element.
- If the stage wrapper still needs structural padding, keep it unframed and quiet rather than reverting to a large surface card.
- The support seam should remain visually attached and compact at rest.

## Validation Targets

- The default wide Reader state should:
  - keep the Stage 715 centered article field
  - keep the compact support seam
  - show no obvious large framed shell around the whole reading deck
  - preserve compact Source / Notebook behavior
- Generated-mode controls must remain outside article content and generated text must remain unchanged.

## Required Checks

- Targeted Vitest for Reader and route continuity.
- `npm run build`
- `uv run pytest tests/test_api.py -k graph -q`
- `node --check` for the shared Reader harness plus Stage 716/717 scripts
- Live Windows Edge Stage 716/717 audits on `http://127.0.0.1:8000`
