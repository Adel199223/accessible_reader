# Stage 816 - Reader Heading-First Title Seam Retirement After Stage 813

## Summary

- Reopen `Reader` intentionally from the completed Stage 813 product baseline, with Stage 814/815 remaining only as the launcher-side WSL hardening overlay.
- Keep the compact topbar, quiet inline `Source` trigger, selective source-type retirement, nearby Notebook handoff, speech-specific `Read aloud` pill, compact overflow, expanded Source or Notebook reopen behavior, and generated-mode behavior intact.
- Broaden the compact duplicate-title heuristic so the source-strip title also retires when the article already opens with the same heading after one trivial ordered prefix such as `1.` or `I)`.

## Why This Stage Exists

- Stage 810/811 already removed the compact source-strip title when the article heading exactly matched the saved title.
- A smaller but still meaningful redundancy remains in heading-first documents where the only difference is a trivial ordered prefix.
- The next highest-value cleanup is to collapse that remaining duplication conservatively, without drifting into fuzzy title matching or reopening broader header chrome decisions.

## Scope

### In scope

- Compact at-rest Reader only: broaden duplicate-title retirement from exact-match only to a bounded ordered-prefix match.
- Treat level `1` and level `2` leading headings as eligible for the heuristic.
- Support one leading ordered prefix such as `1.`, `1)`, `I.`, or `I)` on either the saved title or the leading heading.
- Require the stripped remainder to stay non-empty before hiding the source title.
- Keep expanded Reader support showing the source title even for duplicate heading/title pairs.
- Update targeted tests, stage scripts, and continuity docs after validation.

### Out of scope

- No backend changes.
- No broader fuzzy title matching or token-overlap logic.
- No Source or Notebook behavior changes.
- No generated-output changes.
- No additional compact-header chrome redesign.

## Implementation Notes

- Likely primary files:
  - `frontend/src/components/ReaderWorkspace.tsx`
  - `frontend/src/App.test.tsx`
- Reader audit harness files:
  - `scripts/playwright/stage816_reader_heading_first_title_seam_retirement_after_stage813.mjs`
  - `scripts/playwright/stage817_post_stage816_reader_heading_first_title_seam_retirement_audit.mjs`
- Continuity docs to update after validation:
  - `BUILD_BRIEF.md`
  - `AGENTS.md`
  - `agent.md`
  - `docs/ROADMAP.md`
  - `docs/ROADMAP_ANCHOR.md`
  - `docs/assistant/INDEX.md`
  - `docs/ux/recall_benchmark_matrix.md`

## Required Checks

- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- --run src/App.test.tsx src/components/SourceWorkspaceFrame.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k graph -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node --check scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
- `node --check scripts/playwright/stage816_reader_heading_first_title_seam_retirement_after_stage813.mjs`
- `node --check scripts/playwright/stage817_post_stage816_reader_heading_first_title_seam_retirement_audit.mjs`
- `node scripts/playwright/stage816_reader_heading_first_title_seam_retirement_after_stage813.mjs`
- `node scripts/playwright/stage817_post_stage816_reader_heading_first_title_seam_retirement_audit.mjs`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`
