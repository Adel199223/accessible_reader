# Stage 772 - Reader Expanded Source Destination Compaction After Stage 771

## Summary

- Reopen `Reader` intentionally from the completed Stage 771 baseline.
- Keep the compact source identity seam, nearby Notebook note-chip trigger, real-availability mode strip, compact overflow, short-document article-field treatment, and derived-context cleanup intact.
- Retire the old full source-workspace destination row even when the Reader support rail is expanded.

## Why This Stage Exists

- The fresh Stage 771 captures still bring back the full `Overview / Reader / Notebook / Graph / Study` row whenever `Source` or `Notebook` support opens.
- That reintroduces the same option density the compact Reader strip already removed at rest.
- Reader already has a compact `Source` destination trigger plus in-rail `Source / Notebook` tabs, so the expanded source-workspace row is duplicated navigation rather than a distinct affordance.

## Scope

### In scope

- Keep the compact source-workspace destination trigger visible in expanded Reader states.
- Retire the full expanded Reader source-workspace destination row.
- Preserve Reader cross-surface handoff to `Overview`, `Notebook`, `Graph`, and `Study` through the compact trigger.
- Keep the Reader support rail `Source / Notebook` tabs intact.
- Update targeted React tests and live Playwright audit coverage.
- Roll continuity docs forward after validation.

### Out of scope

- No backend changes.
- No mode-routing changes.
- No support-rail redesign.
- No generated-output changes.
- No product work on `Home`, `Graph`, embedded `Notebook`, or `Study` beyond regression proof.

## Implementation Notes

- Primary files:
  - `frontend/src/components/SourceWorkspaceFrame.tsx`
  - `frontend/src/App.test.tsx`
  - `frontend/src/components/SourceWorkspaceFrame.test.tsx`
- Reader audit harness files:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage772_reader_expanded_source_destination_compaction_after_stage771.mjs`
  - `scripts/playwright/stage773_post_stage772_reader_expanded_source_destination_compaction_audit.mjs`
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
- `node --check` for the shared Reader harness plus Stage 772/773 scripts
- live Reader Stage 772/773 audits on `http://127.0.0.1:8000`
- `git diff --check`
