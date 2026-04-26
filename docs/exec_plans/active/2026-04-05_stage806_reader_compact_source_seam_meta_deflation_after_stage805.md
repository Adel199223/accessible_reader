# Stage 806 - Reader Compact Source-Seam Meta Deflation After Stage 805

## Summary

- Reopen `Reader` intentionally from the completed Stage 805 baseline.
- Keep the compact topbar, compact source seam, shared compact header row, full speech-specific `Read aloud` pill, nearby Notebook handoff, compact overflow, short-document article treatment, expanded-source destination compaction, lean Source support, and frozen generated outputs intact.
- Deflate the remaining compact Reader source-seam badge chrome by turning the compact source type plus note-count metadata into a quieter inline seam while preserving the Notebook handoff.

## Why This Stage Exists

- Stage 804/805 finished the compact `Read aloud` primary action, so the most visible remaining compact-header chrome is now the small cluster of source-seam badges beside the title.
- In the live Reader baseline, the source type and note count still read like extra UI chips rather than quiet document context.
- The next highest-value cleanup is to keep the `Source` trigger and document title intact while demoting the supporting source metadata into calmer inline text or action treatment.

## Scope

### In scope

- Compact Reader only: retire the pill styling from the source type and note-count metadata.
- Keep the note-count interaction and nearby Notebook handoff behavior unchanged.
- Keep the `Source` destination trigger and document title unchanged.
- Keep expanded Source and Notebook support behavior unchanged.
- Keep read-aloud behavior, overflow contents, generated-content behavior, and article layout unchanged.
- Update focused tests, audit metrics, and live Playwright captures for the quieter source seam.
- Roll continuity docs forward after validation if the pass lands cleanly.

### Out of scope

- No backend changes.
- No generated-output changes.
- No read-aloud engine or transport logic changes.
- No topbar redesign.
- No Source or Notebook expanded-support redesign.

## Implementation Notes

- Likely primary files:
  - `frontend/src/components/SourceWorkspaceFrame.tsx`
  - `frontend/src/index.css`
  - `frontend/src/components/SourceWorkspaceFrame.test.tsx`
  - `frontend/src/App.test.tsx`
- Reader audit harness files:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage806_reader_compact_source_seam_meta_deflation_after_stage805.mjs`
  - `scripts/playwright/stage807_post_stage806_reader_compact_source_seam_meta_deflation_audit.mjs`
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
- `node --check` for the shared Reader harness plus Stage 806/807 scripts
- live Reader Stage 806/807 audits on `http://127.0.0.1:8000`
- `git diff --check`
