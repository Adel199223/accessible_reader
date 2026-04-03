# Stage 760 - Reader Short-Document Article-Field Compaction After Stage 759

## Summary

- Reopen `Reader` intentionally from the completed Stage 759 baseline.
- Keep the compact overflow, compact source strip, nearby Notebook note-chip trigger, inline theme choices, and frozen generated outputs intact.
- Reduce the remaining oversized blank article slab for genuinely short documents so the reading lane feels tighter and more proportional when only a few sentences are present.

## Why This Stage Exists

- Stage 759 finished the overflow cleanup, but the next most obvious Reader weight now sits inside the article field itself on short sources.
- Very short documents still render inside a tall reading card that leaves too much dead space beneath the content.
- The highest-leverage next step is to compact only short-document article fields instead of shrinking the default article treatment for longer reading sessions.

## Scope

### In scope

- Add a content-aware short-document article-field treatment in Reader.
- Keep longer documents on the standard article-field size.
- Preserve Source support, nearby Notebook reopening, idle transport, and generated Summary affordances.
- Add targeted Vitest and Playwright coverage that measures short-document article-field height and class presence.
- Update continuity docs after validation lands.

### Out of scope

- No backend changes.
- No route changes.
- No generated-output text or transform logic changes.
- No additional Reader settings or chrome redesign beyond the short-document article field.
- No product work on `Home`, `Graph`, embedded `Notebook`, or `Study` beyond regression proof.

## Implementation Notes

- Primary files:
  - `frontend/src/components/ReaderWorkspace.tsx`
  - `frontend/src/App.test.tsx`
  - `frontend/src/index.css`
- Reader audit harness files:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage760_reader_short_document_article_field_compaction_after_stage759.mjs`
  - `scripts/playwright/stage761_post_stage760_reader_short_document_article_field_compaction_audit.mjs`
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
- `node --check` for the shared Reader harness plus Stage 760/761 scripts
- live Reader Stage 760/761 audits on `http://127.0.0.1:8000`
- `git diff --check`
