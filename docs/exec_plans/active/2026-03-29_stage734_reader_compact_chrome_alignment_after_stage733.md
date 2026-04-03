# Stage 734 - Reader Compact Chrome Alignment After Stage 733

## Summary

- Keep `Reader` as the sole intentionally reopened surface above the Stage 733 baseline.
- Preserve the compact centered reading band, inline generated empty states, and collapsed support seam.
- Realign the reader-active source strip to the same compact width language as the control ribbon and reading deck so the top chrome reads as one deliberate band instead of one full-width strip above a narrower deck.

## Why This Stage Exists

- The Stage 733 audit proved that the compact Reader deck, inline support seam, and generated-mode empty states are now the real local baseline.
- The highest-leverage remaining Reader mismatch in the current local baseline is no longer a missing behavior. It is a composition mismatch: the reader-active source strip still spans the full workspace width while the actual reading band is centered and compact beneath it.
- That split leaves the top chrome feeling visually disconnected and forces the source strip typography into a more compressed scale than necessary.

## Scope

### In scope

- Center the reader-active `SourceWorkspaceFrame` content onto the same compact band width used by the Reader control ribbon and resting deck.
- Slightly rebalance reader-active source-strip spacing and typography so source identity, summary chips, and workspace tabs remain readable inside that centered band.
- Keep the resting Source / Notebook seam collapsed inline by default and keep expanded Source / Notebook support working as-is.
- Extend the Reader Playwright audit so it measures source-strip alignment against the compact deck instead of only checking the deck and control ribbon.
- Refresh the continuity docs after the implementation and audit land.

### Out of scope

- No generated-output text or transform changes.
- No route or data-contract changes beyond the minimal source-frame state needed for compact-width styling.
- No Reader support-dock redesign beyond alignment and legibility adjustments needed by this compact-chrome pass.
- No product work on `Home`, `Graph`, embedded `Notebook`, or `Study` beyond regression proof.

## Implementation Notes

- Primary files:
  - `frontend/src/components/ReaderWorkspace.tsx`
  - `frontend/src/components/SourceWorkspaceFrame.tsx`
  - `frontend/src/components/RecallShellFrame.tsx`
  - `frontend/src/index.css`
  - `frontend/src/components/SourceWorkspaceFrame.test.tsx`
  - `frontend/src/App.test.tsx`
- Reader audit harness files:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage734_reader_compact_chrome_alignment_after_stage733.mjs`
  - `scripts/playwright/stage735_post_stage734_reader_compact_chrome_alignment_audit.mjs`
- Continuity docs to update after the audit:
  - `BUILD_BRIEF.md`
  - `docs/ROADMAP.md`
  - `docs/ROADMAP_ANCHOR.md`
  - `agent.md`
  - `docs/assistant/INDEX.md`
  - `docs/ux/recall_benchmark_matrix.md`
- The Stage 734/735 pass should explicitly prove:
  - the reader-active source strip no longer stretches wider than the compact Reader band by default
  - source-strip title/meta/tabs remain readable after the alignment pass
  - the compact control ribbon and article field remain centered
  - Source-open and Notebook-open support still expand correctly
  - generated `Simplified` / `Summary` empty states remain inline and route-safe

## Required Checks

- targeted Vitest for Reader shell/source-frame regressions
- `npm run build`
- `uv run pytest tests/test_api.py -k graph -q`
- `node --check` for the shared Reader harness plus Stage 734/735 scripts
- live Reader Stage 734/735 audits on `http://127.0.0.1:8000`
- `git diff --check`
