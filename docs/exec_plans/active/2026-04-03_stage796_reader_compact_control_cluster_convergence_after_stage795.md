# Stage 796 - Reader Compact Control Cluster Convergence After Stage 795

## Summary

- Reopen `Reader` intentionally from the completed Stage 795 baseline.
- Keep the compact topbar, compact source identity seam, real-availability mode strip, nearby Notebook note-chip trigger, compact overflow, short-document article treatment, expanded-source destination compaction, lean Source support, and frozen generated outputs intact.
- Retire the remaining split-bar feel in the compact Reader control row so mode tabs and the `Read aloud` cluster behave like one packed control band instead of stretching to opposite sides of the header lane.

## Why This Stage Exists

- Stage 794/795 successfully narrowed the compact source strip plus control ribbon to the article-adjacent header lane.
- The next strongest piece of visual slack is now inside that lane: compact Reader still uses a split control row with tabs left and transport pushed to the far edge.
- The highest-value follow-through is to pack those controls into one tighter inline cluster while preserving `Read aloud` as the clearly primary action.

## Scope

### In scope

- Compact the at-rest Reader control ribbon into one packed horizontal control cluster.
- Keep `Original` / `Reflowed` visible and preserve the primary `Read aloud` button plus adjacent overflow.
- Preserve wrap behavior on smaller widths without restoring the wide split-bar layout.
- Preserve expanded Source and Notebook support behavior.
- Preserve generated-mode behavior and frozen outputs.
- Add focused tests plus live audit metrics for the new compact control-cluster spacing.
- Roll continuity docs forward after validation if the pass lands cleanly.

### Out of scope

- No backend changes.
- No topbar or source-strip redesign.
- No Reader generated-output changes.
- No redesign of expanded Source support, Notebook workbench, or article-field sizing.
- No new controls or transport behavior changes.

## Implementation Notes

- Likely primary files:
  - `frontend/src/components/ReaderWorkspace.tsx`
  - `frontend/src/App.test.tsx`
  - `frontend/src/index.css`
- Reader audit harness files:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage796_reader_compact_control_cluster_convergence_after_stage795.mjs`
  - `scripts/playwright/stage797_post_stage796_reader_compact_control_cluster_convergence_audit.mjs`
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
- `node --check` for the shared Reader harness plus Stage 796/797 scripts
- live Reader Stage 796/797 audits on `http://127.0.0.1:8000`
- `git diff --check`
