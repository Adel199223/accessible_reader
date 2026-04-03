# Stage 786 - Reader Loaded Reflowed Lead-In Retirement After Stage 785

## Summary

- Reopen `Reader` intentionally from the completed Stage 785 baseline.
- Keep the compact source identity seam, nearby Notebook note-chip trigger, real-availability mode strip, compact overflow, short-document article-field treatment, expanded-source destination compaction, leaner Source support, and Stage 784/785 note-switcher density cleanup intact.
- Retire the loaded `Reflowed` explainer band entirely so the article begins immediately below the tabs and source strip, while keeping `Summary` and `Simplified` derived-context behavior unchanged.

## Why This Stage Exists

- The current loaded `Reflowed` view still spends a full-width band on explanation before the article starts.
- In the current Reader hierarchy, the mode tabs and compact source strip already establish enough context for `Reflowed`.
- That band now reads like leftover chrome rather than a necessary reading aid, especially compared with the much tighter default `Original` and article-first layout.

## Scope

### In scope

- Stop rendering the derived-context shell for loaded `Reflowed`.
- Keep `Summary` and `Simplified` derived-context surfaces, generated empty states, retry/create actions, and summary-detail controls exactly as the current baseline.
- Add explicit audit metrics for loaded-Reflowed derived-context visibility before Notebook support opens.
- Update targeted React tests plus live Playwright audit coverage.
- Roll continuity docs forward after validation if the pass lands cleanly.

### Out of scope

- No backend changes.
- No Reader generated-output changes.
- No source-strip locator/filename cleanup.
- No Source support redesign.
- No Notebook routing redesign.
- No product work on `Home`, `Graph`, embedded `Notebook`, or `Study` beyond regression proof.

## Implementation Notes

- Likely primary files:
  - `frontend/src/components/ReaderWorkspace.tsx`
  - `frontend/src/App.test.tsx`
- Reader audit harness files:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage786_reader_loaded_reflowed_lead_in_retirement_after_stage785.mjs`
  - `scripts/playwright/stage787_post_stage786_reader_loaded_reflowed_lead_in_retirement_audit.mjs`
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
- `node --check` for the shared Reader harness plus Stage 786/787 scripts
- live Reader Stage 786/787 audits on `http://127.0.0.1:8000`
- `git diff --check`
