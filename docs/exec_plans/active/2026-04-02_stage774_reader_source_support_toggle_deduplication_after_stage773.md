# Stage 774 - Reader Source Support Toggle Deduplication After Stage 773

## Summary

- Reopen `Reader` intentionally from the completed Stage 773 baseline.
- Keep the compact source identity seam, nearby Notebook note-chip trigger, real-availability mode strip, compact overflow, short-document article-field treatment, and expanded-source destination compaction intact.
- Retire the duplicate inner `Hide` control from the embedded Source library inside Reader support.

## Why This Stage Exists

- The fresh Stage 773 Source support capture still shows two separate close controls at once:
  - the outer Reader support rail `Hide`
  - the embedded Source library `Hide`
- They both collapse the same local surface, so the second one adds chrome without adding a distinct decision.
- Reader’s Source support now only exists as a support rail, so it should expose one close affordance for that rail instead of nested duplicate collapse controls.

## Scope

### In scope

- Let the embedded library pane hide its own open/close toggle when Reader support already owns visibility.
- Keep the embedded Reader Source library list open by default in that support state.
- Preserve Source reopening, search, selection, and delete affordances inside Reader support.
- Preserve Home and other non-Reader library-pane toggle behavior.
- Add targeted React and live Playwright coverage.
- Roll continuity docs forward after validation.

### Out of scope

- No backend changes.
- No broader Source support redesign.
- No Reader generated-output changes.
- No product work on `Home`, `Graph`, embedded `Notebook`, or `Study` beyond regression proof.

## Implementation Notes

- Primary files:
  - `frontend/src/components/LibraryPane.tsx`
  - `frontend/src/components/ReaderWorkspace.tsx`
  - `frontend/src/App.test.tsx`
- Reader audit harness files:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage774_reader_source_support_toggle_deduplication_after_stage773.mjs`
  - `scripts/playwright/stage775_post_stage774_reader_source_support_toggle_deduplication_audit.mjs`
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
- `node --check` for the shared Reader harness plus Stage 774/775 scripts
- live Reader Stage 774/775 audits on `http://127.0.0.1:8000`
- `git diff --check`
