# Stage 748 - Reader Overflow Payload Deflation After Stage 747

## Summary

- Reopen `Reader` intentionally from the completed Stage 747 baseline.
- Keep the compact reading deck, lean source strip, idle transport compaction, compact source trigger, and frozen generated outputs intact.
- Reduce the remaining Reader chrome clutter by removing passive overflow status/help copy and retiring the compact source strip's generic `Local source` fallback when it adds no new information.

## Why This Stage Exists

- Stage 747 left the at-rest Reader ribbon materially calmer, but the overflow still mixes three content types: quick actions, read-aloud preferences, and passive status/help copy.
- In the shipped Stage 747 overflow evidence, the `Sentence 1 of 2` chip and visible keyboard-shortcut sentence are the least useful remaining items because they do not perform an action and duplicate or outlive other reading cues.
- The same Stage 747 source-strip evidence also shows the compact Reader seam still spending a whole second line on `Local source` for paste items even though the source chip, title, and right-side metadata already identify the document.
- The next highest-leverage cleanup is to keep the overflow focused on controls the user can actually change while also letting compact Reader retire generic fallback copy that adds height more than value.

## Scope

### In scope

- Remove the passive sentence-progress chip from the Reader overflow.
- Remove the visible keyboard-shortcut helper sentence from the Reader overflow.
- Retire the compact Reader source strip's generic `Local source` fallback when there is no real locator or filename to show.
- Keep active read-aloud progress on the expanded transport ribbon only.
- Keep `Settings`, `Source`, `Notebook`, and `Add note` quick actions intact when available.
- Keep voice and rate controls intact in the overflow.
- Keep non-Reader and expanded-source workspaces free to continue using the existing fallback source copy when needed.
- Update targeted Reader tests and Playwright evidence so the slimmer overflow is measurable.
- Update continuity docs after validation lands.

### Out of scope

- No generated-output text, transform logic, payload semantics, or caching changes.
- No backend changes.
- No route changes.
- No removal of the compact source-strip trigger or the expanded Source / Notebook workspaces.
- No broader Reader settings redesign or migration of voice/rate controls into the settings drawer.
- No product work on `Home`, `Graph`, embedded `Notebook`, or `Study` beyond regression proof.

## Implementation Notes

- Primary files:
  - `frontend/src/components/ControlsOverflow.tsx`
  - `frontend/src/components/ReaderWorkspace.tsx`
  - `frontend/src/components/SourceWorkspaceFrame.tsx`
  - `frontend/src/App.test.tsx`
  - `frontend/src/components/SourceWorkspaceFrame.test.tsx`
  - `frontend/src/index.css`
- Reader audit harness files:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
  - `scripts/playwright/stage748_reader_overflow_payload_deflation_after_stage747.mjs`
  - `scripts/playwright/stage749_post_stage748_reader_overflow_payload_deflation_audit.mjs`
- Continuity docs to update after validation:
  - `BUILD_BRIEF.md`
  - `docs/ROADMAP.md`
  - `docs/ROADMAP_ANCHOR.md`
  - `agent.md`
  - `docs/assistant/INDEX.md`
  - `docs/ux/recall_benchmark_matrix.md`

## Required Checks

- targeted Vitest for touched Reader coverage
- `npm run build`
- `uv run pytest tests/test_api.py -k graph -q`
- `node --check` for the shared Reader harness plus Stage 748/749 scripts
- live Reader Stage 748/749 audits on `http://127.0.0.1:8000`
- `git diff --check`
