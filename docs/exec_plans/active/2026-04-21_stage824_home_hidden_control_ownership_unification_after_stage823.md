# ExecPlan: Stage 824 Home Hidden Control Ownership Unification After Stage 823

## Summary
- Keep `Home` as the active high-leverage Recall-parity surface after Stage 822/823 instead of reopening another Reader micro-polish slice.
- Retire the remaining hidden `Home` split-control model so collapsed Home is board-first: only the board toolbar plus the top-anchored launcher stay visible while the organizer is hidden.
- Keep `Graph`, embedded `Notebook`, original-only `Reader`, and `Study` as regression surfaces only.

## Scope
- Stop rendering the hidden `Home control seam` and the hidden compact organizer-control deck on loaded hidden `Home` paths.
- Reuse the same board-owned toolbar across hidden overview, hidden selected-group, and hidden `Matches`, preserving `Search`, `Add`, `New note`, `List`, and `Sort`.
- Keep organizer-specific controls organizer-owned again: reopen the organizer to access deeper lens and sorting controls instead of reviving a hidden inline slab.
- Extend the live Home audit to assert hidden control ownership across overview, hidden `Captures`, and hidden `Matches`.

## Acceptance
- Hidden loaded `Home` no longer shows `Home control seam` or `Compact organizer controls`.
- Hidden overview, hidden `Captures`, and hidden `Matches` all expose the same board-owned toolbar.
- Hidden organizer-specific controls do not reappear inline while the organizer stays hidden.
- Stage 819 shell ownership and Stage 820/823 hidden-lane wins remain intact.

## Validation
- targeted `frontend/src/App.test.tsx`
- `frontend/npm run build`
- `backend/tests/test_api.py -k graph -q`
- `node --check` on `scripts/playwright/home_rendered_preview_quality_shared.mjs`
- `node --check` on `scripts/playwright/home_organizer_ergonomics_shared.mjs`
- `node --check` on `scripts/playwright/stage824_home_hidden_control_ownership_unification_after_stage823.mjs`
- `node --check` on `scripts/playwright/stage825_post_stage824_home_hidden_control_ownership_unification_audit.mjs`
- Stage 824 live Edge validation
