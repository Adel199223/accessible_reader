# Stage 736 - Reader Stacked Option-Row Cleanup After Stage 735

## Summary

- Reopen `Reader` intentionally from the completed Stage 735 baseline.
- Keep the compact reading deck, inline support seam, and frozen generated outputs intact.
- Remove the feeling of two stacked option rows above the article by demoting the cross-surface `Overview / Reader / Notebook / Graph / Study` controls into a much quieter compact Reader pattern.

## Why This Stage Exists

- Stage 735 improved the Reader lead-in, but the default Reader still stacks two visible option rows above the article: the source-surface row (`Overview / Reader / Notebook / Graph / Study`) and the view-mode row (`Original / Reflowed / Simplified / Summary`).
- That makes the reading surface feel busier than it needs to, especially because the cross-surface row competes with the view-mode row even though it is secondary during reading.
- The next highest-leverage cleanup is to preserve cross-surface access while demoting that upper row out of the main reading rhythm.

## Scope

### In scope

- Demote the default Reader cross-surface row out of the main stacked chrome, ideally into a compact overflow or similarly quiet affordance inside the source strip.
- Keep the `Original / Reflowed / Simplified / Summary` row as the primary visible reading-mode control.
- Preserve direct access to `Overview`, `Notebook`, `Graph`, and `Study` without leaving a full-width second nav band visible at rest.
- Keep the fuller source-workspace navigation available in expanded Reader support states if that remains the clearest pattern.
- Extend the Reader Playwright evidence so the audit proves the stacked-row feel is reduced in the default at-rest Reader state.
- Update roadmap continuity docs after the implementation and audit land.

### Out of scope

- No generated-output text, transform logic, mode payload semantics, or caching changes.
- No backend changes.
- No route changes.
- No new Reader support workflows beyond this chrome cleanup follow-through.
- No product work on `Home`, `Graph`, embedded `Notebook`, or `Study` beyond regression proof.

## Implementation Notes

- Primary files:
  - `frontend/src/components/ReaderWorkspace.tsx`
  - `frontend/src/components/SourceWorkspaceFrame.tsx`
  - `frontend/src/components/RecallShellFrame.tsx`
  - `frontend/src/components/SourceWorkspaceFrame.test.tsx`
  - `frontend/src/components/RecallShellFrame.test.tsx`
  - `frontend/src/App.test.tsx`
  - `frontend/src/index.css`
- Reader audit harness files:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage736_reader_stacked_option_row_cleanup_after_stage735.mjs`
  - `scripts/playwright/stage737_post_stage736_reader_stacked_option_row_cleanup_audit.mjs`
- Continuity docs to update after validation:
  - `BUILD_BRIEF.md`
  - `docs/ROADMAP.md`
  - `docs/ROADMAP_ANCHOR.md`
  - `agent.md`
  - `docs/assistant/INDEX.md`
  - `docs/ux/recall_benchmark_matrix.md`
- Stage 736 should explicitly prove:
  - the default Reader no longer presents the cross-surface row as a full second stacked option band above the article
  - the view-mode row remains the primary visible control strip
  - cross-surface navigation remains accessible and legible after the demotion
  - `Source` and `Notebook` support still expand without route or layout regressions
  - generated empty states remain inline and calm

## Required Checks

- targeted Vitest for `SourceWorkspaceFrame`, `RecallShellFrame`, and `App`
- `npm run build`
- `uv run pytest tests/test_api.py -k graph -q`
- `node --check` for the shared Reader harness plus Stage 736/737 scripts
- live Reader Stage 736/737 audits on `http://127.0.0.1:8000`
- `git diff --check`
