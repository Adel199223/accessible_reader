# ExecPlan: Stage 694 Shared Shell And Navigation Model Reset After Stage 693

## Summary
- Reopen active product work after the Stage 692/693 baseline reset with one shell-owned milestone, not another surface-specific micro-pass.
- Move the app from the current fixed labeled rail into a Recall-like two-tier navigation model:
  - persistent compact icon-first primary rail
  - section-owned adjacent panel that can collapse, resume, and preserve width state
- Keep note placement embedded as `Notebook`; do not restore a top-level `Notes` destination.

## Scope
- Convert the global shell from a fixed labeled rail into a compact icon-first rail with lighter branding.
- Add explicit collapse/resume behavior for section-owned panels, starting with `Home`, `Graph`, and the shell-owned source/section panel model.
- Preserve current routes, local-first behavior, and section semantics while retiring dead `notes`-only shell branches.
- Keep `Graph`, `Home`, embedded `Notebook`, original-only `Reader`, and `Study` functionally stable while the shell changes beneath them.

## Acceptance
- The far-left rail is compact and icon-first at rest.
- The active section panel can collapse and reopen deliberately without losing continuity.
- No top-level `Notes` destination returns.
- `Home`, `Graph`, `Study`, embedded `Notebook`, and original-only `Reader` still route and reopen correctly after the shell reset.

## Validation
- targeted shell and route Vitest coverage
- `backend/tests/test_api.py -k graph -q`
- `frontend/npm run build`
- Stage 695 live Edge audit
