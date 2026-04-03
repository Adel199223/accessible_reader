# Stage 782 - Reader Active Note Tile Compaction After Stage 781

## Summary

- Reopen `Reader` intentionally from the completed Stage 781 baseline.
- Keep the compact source identity seam, nearby Notebook note-chip trigger, real-availability mode strip, compact overflow, short-document article-field treatment, expanded-source destination compaction, leaner Source support, and Stage 780/781 workbench lead-in deflation intact.
- Deflate the remaining duplication between the active saved-note tile and the selected-note workbench so the Notebook rail reads more like a switcher plus editor than two stacked previews of the same note.

## Why This Stage Exists

- The Stage 781 Notebook capture still shows a full active saved-note card above a full selected-note anchor preview plus editor.
- That means the narrow Notebook column repeats the same anchor and note copy twice before the user can edit or promote the note.
- The selected note list should prioritize switching between notes, while the workbench below should carry the richer editing context.

## Scope

### In scope

- Compact the active saved-note tile when the same note is already open in the workbench.
- Preserve enough context in the saved-note list for switching between notes without losing orientation.
- Keep the richer anchor preview, edit flow, delete flow, and promotion flows in the selected-note workbench.
- Update targeted React tests plus live Playwright audit coverage.
- Roll continuity docs forward after validation if the pass lands cleanly.

### Out of scope

- No backend changes.
- No Reader generated-output changes.
- No Source support redesign.
- No Notebook routing redesign.
- No product work on `Home`, `Graph`, embedded `Notebook`, or `Study` beyond regression proof.

## Implementation Notes

- Likely primary files:
  - `frontend/src/components/ReaderWorkspace.tsx`
  - `frontend/src/App.test.tsx`
  - `frontend/src/index.css`
- Reader audit harness files:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage782_reader_active_note_tile_compaction_after_stage781.mjs`
  - `scripts/playwright/stage783_post_stage782_reader_active_note_tile_compaction_audit.mjs`
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
- `node --check` for the shared Reader harness plus Stage 782/783 scripts
- live Reader Stage 782/783 audits on `http://127.0.0.1:8000`
- `git diff --check`
