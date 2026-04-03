# Stage 784 - Reader Note Switcher Density Deflation After Stage 783

## Summary

- Reopen `Reader` intentionally from the completed Stage 783 baseline.
- Keep the compact source identity seam, nearby Notebook note-chip trigger, real-availability mode strip, compact overflow, short-document article-field treatment, expanded-source destination compaction, leaner Source support, and Stage 780/783 Notebook cleanup intact.
- Deflate the remaining saved-note switcher density so the Notebook rail reads like a compact note navigator above the richer selected-note workbench instead of a second stack of preview cards.

## Why This Stage Exists

- The Stage 783 audit proved the active note no longer duplicates itself in the saved-note switcher.
- The remaining saved-note buttons still render three visible text layers per note, which makes the switcher feel like a second preview surface rather than a lightweight way to jump between nearby notes.
- The selected-note workbench below already owns the richer anchor preview, excerpt context, and editor, so the switcher can become denser without losing orientation.

## Scope

### In scope

- Compact saved-note switcher rows into a denser navigator treatment.
- Keep enough note identity for fast switching between nearby notes.
- Preserve the fuller anchor preview and edit context in the selected-note workbench.
- Update targeted React tests plus live Playwright audit coverage to measure the denser switcher directly.
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
  - `frontend/src/index.css`
  - `frontend/src/App.test.tsx`
- Reader audit harness files:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage784_reader_note_switcher_density_deflation_after_stage783.mjs`
  - `scripts/playwright/stage785_post_stage784_reader_note_switcher_density_deflation_audit.mjs`
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
- `node --check` for the shared Reader harness plus Stage 784/785 scripts
- live Reader Stage 784/785 audits on `http://127.0.0.1:8000`
- `git diff --check`
