# Stage 730 - Reader Generated-Mode Empty-State Normalization After Stage 729

## Summary

- Reopen `Reader` as the sole active surface after the Stage 729 attached support-band fusion baseline.
- Keep the centered compact reading deck, fused inline support seam, quiet outer shell, and frozen generated outputs.
- Normalize the generated-mode empty path so `Summary` and `Simplified` unavailable states read as calm inline Reader placeholders instead of top-of-page alert slabs.

## Why This Stage Exists

- Stage 728/729 solved the default Reader structure well.
- The clearest remaining mismatch is the generated-mode empty state: when a generated view is unavailable, Reader still shows a large alert-like banner above the deck even though the mode already exposes a create action and inline placeholder.
- The right next pass is to preserve create/retry behavior while moving that feedback into the calmer derived-mode context and article-adjacent placeholder lane.

## Scope

### In scope

- Retire the large top-of-page `inline-error` slab for generated-mode unavailable states when the current mode still supports inline creation.
- Present unavailable `Summary` / `Simplified` states as compact inline Reader placeholders attached to the derived-mode context instead of as an alert banner separated from the reading deck.
- Keep retry/create actions available without reopening the old error treatment.
- Extend Reader tests and audits to prove the generated empty state is calm, inline, and still actionable.

### Out of scope

- No backend changes.
- No generated-output changes.
- No route changes.
- No new Reader layout pass outside the generated empty-state seam.
- No Home / Graph / Notebook / Study product changes beyond regression proof.

## Implementation Notes

- Primary files:
  - `frontend/src/components/ReaderWorkspace.tsx`
  - `frontend/src/index.css`
  - `frontend/src/App.test.tsx`
- Shared audit updates:
  - `scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
- The generated empty state should:
  - stay inside the existing Reader stage
  - keep `Create Summary` or the corresponding generated action visible
  - keep retry affordances when appropriate
  - avoid looking like a global failure banner when the real state is “not created yet”

## Validation Targets

- `Summary` and `Simplified` unavailable states should no longer show a large top-of-page alert slab.
- The generated empty state should remain inline, actionable, and visually tied to the Reader deck.
- The default Reader state from Stage 729 should remain intact.
- Source / Notebook expansion and generated outputs remain frozen.

## Required Checks

- Targeted Vitest for Reader generated empty-state continuity.
- `npm run build`
- `uv run pytest tests/test_api.py -k graph -q`
- `node --check` for the shared Reader harness plus Stage 730/731 scripts
- Live Reader Stage 730/731 audits on `http://127.0.0.1:8000`
