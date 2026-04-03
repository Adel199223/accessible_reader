# Stage 778 - Reader Source Support Inner Header Deflation After Stage 777

## Summary

- Reopen `Reader` intentionally from the completed Stage 777 baseline.
- Keep the compact source identity seam, nearby Notebook note-chip trigger, real-availability mode strip, compact overflow, short-document article-field treatment, expanded-source destination compaction, single outer `Hide` affordance, and retired support metadata row intact.
- Deflate the remaining redundant inner header chrome inside expanded Reader `Source` support.

## Why This Stage Exists

- The fresh Stage 777 captures still show a second inner title stack inside expanded Reader `Source` support.
- `Source library`, the saved-count line, and the visible `Search` label repeat context that the surrounding `Source / Notebook` tabs plus the search placeholder already communicate.
- Once the support rail already exposes the local tabs, the outer `Hide` affordance, and the saved-source list itself, that extra inner header chrome makes the panel feel denser than it needs to.

## Scope

### In scope

- Remove or demote the redundant inner `Source library` title stack in expanded Reader `Source` support.
- Remove or demote the visible `Search` label there when the search placeholder already names the control.
- Preserve search accessibility, source selection, delete actions, local tab switching, and the single outer `Hide` affordance.
- Update targeted React tests plus live Playwright audit coverage.
- Roll continuity docs forward after validation if the pass lands cleanly.

### Out of scope

- No backend changes.
- No Reader generated-output changes.
- No source-strip redesign.
- No Notebook panel redesign.
- No product work on `Home`, `Graph`, embedded `Notebook`, or `Study` beyond regression proof.

## Implementation Notes

- Likely primary files:
  - `frontend/src/components/LibraryPane.tsx`
  - `frontend/src/components/ReaderWorkspace.tsx`
  - `frontend/src/components/LibraryPane.test.tsx`
  - `frontend/src/App.test.tsx`
- Reader audit harness files:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage778_reader_source_support_inner_header_deflation_after_stage777.mjs`
  - `scripts/playwright/stage779_post_stage778_reader_source_support_inner_header_deflation_audit.mjs`
- Continuity docs to update after validation:
  - `BUILD_BRIEF.md`
  - `AGENTS.md`
  - `agent.md`
  - `docs/ROADMAP.md`
  - `docs/ROADMAP_ANCHOR.md`
  - `docs/assistant/INDEX.md`
  - `docs/ux/recall_benchmark_matrix.md`

## Required Checks

- targeted Vitest for touched Reader and Library coverage
- `npm run build`
- `uv run pytest tests/test_api.py -k graph -q`
- `node --check` for the shared Reader harness plus Stage 778/779 scripts
- live Reader Stage 778/779 audits on `http://127.0.0.1:8000`
- `git diff --check`
