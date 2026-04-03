# Stage 780 - Reader Notebook Workbench Lead-In Deflation After Stage 779

## Summary

- Reopen `Reader` intentionally from the completed Stage 779 baseline.
- Keep the compact source identity seam, nearby Notebook note-chip trigger, real-availability mode strip, compact overflow, short-document article-field treatment, expanded-source destination compaction, and leaner Source support intact.
- Deflate the remaining stacked lead-in chrome inside the Reader Notebook workbench so the editable note body arrives sooner.

## Why This Stage Exists

- The fresh Stage 779 Notebook capture still spends a narrow support column on a stacked `Selected note` heading, helper copy, metadata chips, and a separate `Highlighted passage` label before the editor.
- In Reader, the active note is already established by the selected saved-note row and the highlighted anchor itself.
- That extra heading stack makes the workbench feel denser than the now-cleaner Source support panel beside it.

## Scope

### In scope

- Remove or demote redundant selected-note heading/helper chrome inside the Reader Notebook workbench.
- Collapse note metadata into a leaner anchor preview seam when that preserves enough context.
- Preserve save, delete, promote-to-Graph, promote-to-Study, and the active note anchor context.
- Update targeted React tests plus live Playwright audit coverage.
- Roll continuity docs forward after validation if the pass lands cleanly.

### Out of scope

- No backend changes.
- No Reader generated-output changes.
- No source-strip redesign.
- No Reader Notebook routing or promotion-flow redesign.
- No product work on `Home`, `Graph`, embedded `Notebook`, or `Study` beyond regression proof.

## Implementation Notes

- Likely primary files:
  - `frontend/src/components/ReaderWorkspace.tsx`
  - `frontend/src/App.test.tsx`
  - `frontend/src/index.css`
- Reader audit harness files:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage780_reader_notebook_workbench_lead_in_deflation_after_stage779.mjs`
  - `scripts/playwright/stage781_post_stage780_reader_notebook_workbench_lead_in_deflation_audit.mjs`
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
- `node --check` for the shared Reader harness plus Stage 780/781 scripts
- live Reader Stage 780/781 audits on `http://127.0.0.1:8000`
- `git diff --check`
