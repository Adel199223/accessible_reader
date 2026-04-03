# Stage 732 - Reader End-to-End Resume Audit And Continuity Sync After Stage 731

## Summary

- Keep `Reader` as the sole active surface, but do not open another redesign slice yet.
- Audit the real local post-Stage-731 baseline end to end and sync the handoff docs so future chats resume from the actual local workspace state.
- Preserve frozen generated outputs and treat `Home`, `Graph`, embedded `Notebook`, and `Study` as regression surfaces only.

## Why This Stage Exists

- The repo continuity currently points to the post-Stage-731 Reader baseline, but the local workspace is dirty above `HEAD` and needs one explicit audit-driven anchor.
- The right next move is to verify the shipped local Reader baseline end to end before reopening another UI pass from memory.
- The existing Reader harness covers default, Source-open, Notebook-open, and Summary-empty states, but the Simplified path still needs to be included in the same end-to-end evidence set.

## Scope

### In scope

- Verify the actual local baseline with `git status` and the current local Reader files.
- Extend the shared Reader Playwright evidence flow so the audit includes `Simplified` in addition to default, `Original`, `Reflowed`, `Summary`, Source-open, and Notebook-open states.
- Run the targeted Reader-first validation ladder and live browser audit against `http://127.0.0.1:8000`.
- Sync the continuity docs so the active checkpoint, resume shortcut, and benchmark matrix reflect the audited local baseline.

### Out of scope

- No backend changes.
- No route changes.
- No generated-output changes.
- No new Reader redesign beyond audit support adjustments.
- No product work on `Home`, `Graph`, embedded `Notebook`, or `Study` beyond regression proof.

## Implementation Notes

- Primary files:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage732_reader_end_to_end_resume_audit_and_continuity_sync_after_stage731.mjs`
  - `scripts/playwright/stage733_post_stage732_reader_end_to_end_resume_audit.mjs`
- Continuity docs to update after the audit:
  - `BUILD_BRIEF.md`
  - `docs/ROADMAP.md`
  - `docs/ROADMAP_ANCHOR.md`
  - `agent.md`
  - `docs/assistant/INDEX.md`
  - `docs/ux/recall_benchmark_matrix.md`
- The Stage 732/733 audit should explicitly prove:
  - default Reader remains compact and reading-first
  - Source support still expands correctly
  - Notebook workbench still opens and edits correctly
  - `Original`, `Reflowed`, `Simplified`, and `Summary` all remain route-safe and deck-contained
  - generated empty states remain inline instead of reopening a global alert slab

## Required Checks

- `git status --short`
- targeted Vitest for Reader, App, SourceWorkspaceFrame, and shell/route regressions
- `npm run build`
- `uv run pytest tests/test_api.py -k graph -q`
- `node --check` for the shared Reader harness plus Stage 732/733 scripts
- live Reader Stage 732/733 audits on `http://127.0.0.1:8000`
- `git diff --check`
