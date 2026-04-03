# Stage 742 - Reader Source-Strip Metadata Deflation After Stage 741

## Summary

- Reopen `Reader` intentionally from the completed Stage 741 baseline.
- Keep the compact reading deck, real-availability mode strip, idle transport compaction, and frozen generated outputs intact.
- Reduce the remaining at-rest source-strip clutter by retiring metadata that repeats what the Reader mode strip already communicates.

## Why This Stage Exists

- Stage 741 cleaned the idle transport ribbon, but the at-rest source strip still shows a `views` count that duplicates the visible mode row directly below it.
- In non-`Original` modes, the Reader-specific source-strip counts also echo the current mode even though that mode is already selected in the visible mode strip.
- That makes the pre-article strip feel busier than it needs to be in the default reading state.
- The next highest-leverage Reader cleanup is to keep the source strip informative while retiring redundant mode metadata from the at-rest chrome.

## Scope

### In scope

- Remove the reader-active source-strip `views` count that duplicates the visible Reader mode strip.
- Retire the reader-active source-strip current-view chip that repeats `Original`, `Reflowed`, or `Summary`.
- Keep the source type cue, note count cue, compact source-destination trigger, and expanded Source / Notebook behavior intact.
- Add targeted component coverage and Playwright audit checks so the leaner source-strip metadata is measurable.
- Update continuity docs after validation lands.

### Out of scope

- No generated-output text, transform logic, payload semantics, or caching changes.
- No backend changes.
- No route changes.
- No changes to the Stage 740/741 idle transport behavior.
- No product work on `Home`, `Graph`, embedded `Notebook`, or `Study` beyond regression proof.

## Implementation Notes

- Primary files:
  - `frontend/src/components/ReaderWorkspace.tsx`
  - `frontend/src/components/SourceWorkspaceFrame.tsx`
  - `frontend/src/components/SourceWorkspaceFrame.test.tsx`
  - `frontend/src/App.test.tsx`
  - `frontend/src/index.css`
- Reader audit harness files:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage742_reader_source_strip_metadata_deflation_after_stage741.mjs`
  - `scripts/playwright/stage743_post_stage742_reader_source_strip_metadata_deflation_audit.mjs`
- Continuity docs to update after validation:
  - `BUILD_BRIEF.md`
  - `docs/ROADMAP.md`
  - `docs/ROADMAP_ANCHOR.md`
  - `agent.md`
  - `docs/assistant/INDEX.md`
  - `docs/ux/recall_benchmark_matrix.md`

## Required Checks

- targeted Vitest for touched Reader and source-strip coverage
- `npm run build`
- `uv run pytest tests/test_api.py -k graph -q`
- `node --check` for the shared Reader harness plus Stage 742/743 scripts
- live Reader Stage 742/743 audits on `http://127.0.0.1:8000`
- `git diff --check`
