# ExecPlan: Stage 820 Home Hidden-State Dead Lane Retirement After Stage 819

## Summary
- Keep `Home` as the active high-leverage surface after Stage 818/819 rather than reopening another Reader polish slice.
- Retire the remaining collapsed-Home dead lane so the hidden organizer state no longer leaves an empty side slab or stray seam beside the board.
- Keep `Graph`, embedded `Notebook`, original-only `Reader`, and `Study` as regression surfaces only.

## Scope
- Collapse the hidden Home board back to one real content column beside the narrow organizer launcher lane.
- Keep nearby `Continue / Next source` support inline above the hidden board instead of reserving a companion side rail.
- Preserve the Stage 819 organizer-shell ownership fixes: header-safe title insets, inline `Hide organizer`, launcher top anchoring, list top anchoring, resize continuity, and section behavior.

## Acceptance
- Hidden Home no longer reserves a visible dead companion lane or stray separator beside the board.
- The hidden board begins immediately beside the launcher lane.
- The hidden reopen shelf stays inline above the board when nearby content exists.
- Open organizer behavior from Stage 819 remains intact.

## Validation
- targeted `frontend/src/App.test.tsx`
- `frontend/npm run build`
- `backend/tests/test_api.py -k graph -q`
- `node --check` on `scripts/playwright/home_organizer_ergonomics_shared.mjs`
- `node --check` on `scripts/playwright/stage820_home_hidden_state_dead_lane_retirement_after_stage819.mjs`
- `node --check` on `scripts/playwright/stage821_post_stage820_home_hidden_state_dead_lane_retirement_audit.mjs`
- Stage 820 live Edge validation
