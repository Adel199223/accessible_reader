# Stage 776 - Reader Support Metadata Row Retirement After Stage 775

## Summary

- Reopen `Reader` intentionally from the completed Stage 775 baseline.
- Keep the compact source identity seam, nearby Notebook note-chip trigger, real-availability mode strip, compact overflow, short-document article-field treatment, expanded-source destination compaction, and single `Hide` control intact.
- Retire the duplicate metadata row from the expanded Reader support dock.

## Why This Stage Exists

- The fresh Stage 775 captures still show a second metadata row inside the expanded Reader support dock.
- That row repeats the same source identity already visible in the compact source strip above the article.
- Once the support dock already exposes `Source / Notebook` tabs plus the outer `Hide` affordance, the extra `Paste / notes` chips add chrome without adding a new decision.

## Scope

### In scope

- Remove the expanded Reader support-dock metadata row in both `Source` and `Notebook` support states.
- Keep the support-dock tabs and outer `Hide` affordance intact.
- Preserve Source reopening, source search/selection/delete actions, and Notebook reopening/workbench behavior.
- Update targeted React tests and live Playwright audit coverage.
- Roll continuity docs forward after validation.

### Out of scope

- No backend changes.
- No source-strip redesign.
- No support-tab redesign.
- No Reader generated-output changes.
- No product work on `Home`, `Graph`, embedded `Notebook`, or `Study` beyond regression proof.

## Implementation Notes

- Primary files:
  - `frontend/src/components/ReaderWorkspace.tsx`
  - `frontend/src/App.test.tsx`
- Reader audit harness files:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage776_reader_support_metadata_row_retirement_after_stage775.mjs`
  - `scripts/playwright/stage777_post_stage776_reader_support_metadata_row_retirement_audit.mjs`
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
- `node --check` for the shared Reader harness plus Stage 776/777 scripts
- live Reader Stage 776/777 audits on `http://127.0.0.1:8000`
- `git diff --check`
