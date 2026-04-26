# Stage 802 - Reader Compact Embedded-Control Height Deflation After Stage 801

## Summary

- Reopen `Reader` intentionally from the completed Stage 801 baseline.
- Keep the compact topbar, fused compact header row, nearby Notebook note-chip trigger, compact overflow, short-document article treatment, expanded-source destination compaction, lean Source support, and frozen generated outputs intact.
- Keep the compact Reader source identity intact while slimming the embedded mode tabs plus `Read aloud` cluster so the fused header finally reads as one calm row instead of lightweight source identity beside oversized pills.

## Why This Stage Exists

- Stage 800/801 successfully fused the compact source seam and control ribbon into one header block.
- The next highest-value Reader cleanup is now within that fused row: the embedded mode tabs and `Read aloud` pill still carry too much vertical weight relative to the compact source seam, so the header reads optically stacked even when the elements already share one row.
- The user-facing goal is a clearer reading-first seam where source identity stays lightweight on the left and `Read aloud` remains the obvious primary action on the right without overpowering the row.

## Scope

### In scope

- Slim the compact embedded mode tabs and transport cluster for at-rest Reader.
- Preserve the current left-side compact source identity seam and the current right-side transport/overflow behavior.
- Keep expanded Source and Notebook support behavior unchanged.
- Preserve the note-chip Notebook handoff label and behavior.
- Update focused tests and live audit metrics for the slimmer embedded-control treatment.
- Roll continuity docs forward after validation if the pass lands cleanly.

### Out of scope

- No backend changes.
- No generated-output changes.
- No article-field sizing change.
- No topbar redesign.
- No Source or Notebook expanded-support redesign.
- No transport behavior change.

## Implementation Notes

- Likely primary files:
  - `frontend/src/components/ReaderWorkspace.tsx`
  - `frontend/src/index.css`
  - `frontend/src/App.test.tsx`
  - `frontend/src/components/SourceWorkspaceFrame.test.tsx`
- Reader audit harness files:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage802_reader_compact_embedded_control_height_deflation_after_stage801.mjs`
  - `scripts/playwright/stage803_post_stage802_reader_compact_embedded_control_height_deflation_audit.mjs`
- Continuity docs to update after validation:
  - `BUILD_BRIEF.md`
  - `AGENTS.md`
  - `agent.md`
  - `docs/ROADMAP.md`
  - `docs/ROADMAP_ANCHOR.md`
  - `docs/assistant/INDEX.md`
  - `docs/ux/recall_benchmark_matrix.md`

## Required Checks

- targeted Vitest for touched Reader coverage
- `npm run build`
- `uv run pytest tests/test_api.py -k graph -q`
- `node --check` for the shared Reader harness plus Stage 802/803 scripts
- live Reader Stage 802/803 audits on `http://127.0.0.1:8000`
- `git diff --check`
