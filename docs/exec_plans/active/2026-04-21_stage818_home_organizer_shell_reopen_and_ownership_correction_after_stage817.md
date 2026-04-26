# ExecPlan: Stage 818 Home Organizer Shell Reopen And Ownership Correction After Stage 817

## Summary
- Reopen `Home` intentionally after the completed Stage 816/817 Reader ladder because the highest-leverage parity issues are now in the Home organizer shell rather than the Reader header.
- Treat this as a bounded Home follow-through on top of Stage 696/697, focused on organizer shell ownership instead of a broader homepage redesign.
- Keep `Graph`, embedded `Notebook`, `Reader`, and `Study` as regression surfaces only.

## Scope
- Restore safe organizer-shell insets so the `Collections` title and helper line do not sit flush against the clipped rounded support surface.
- Move `Hide organizer` into the organizer header action seam beside `Organizer options` instead of keeping it as a floating absolute overlay.
- Top-anchor the collapsed organizer launcher and hidden compact organizer controls so the hidden state reads like one deliberate collapsed rail instead of a vertically adrift control split.
- Keep the organizer list starting directly under the header with no visual dead band, while preserving section ordering, counts, active-row behavior, previews, resize, collapse/reopen, width continuity, custom collections, and selection actions.

## Acceptance
- The open organizer header no longer clips or crowds the `Collections` title against the shell chrome.
- The collapsed organizer launcher stays visibly top anchored and the compact organizer controls remain available without reading like a centered floating strip.
- The open organizer list begins directly under the header.
- `Graph`, embedded `Notebook`, original-only `Reader`, and `Study` remain stable.

## Validation
- targeted `frontend/src/App.test.tsx`
- `frontend/npm run build`
- `backend/tests/test_api.py -k graph -q`
- `node --check` on `scripts/playwright/home_organizer_ergonomics_shared.mjs`
- `node --check` on `scripts/playwright/stage818_home_organizer_shell_reopen_and_ownership_correction_after_stage817.mjs`
- `node --check` on `scripts/playwright/stage819_post_stage818_home_organizer_shell_reopen_and_ownership_correction_audit.mjs`
- Stage 818 live Edge validation
