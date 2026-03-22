# ExecPlan: Stage 384 Post-Stage-383 Home Recall-Parity Audit

## Summary
- Audit the Stage 383 Home reset against the current Recall benchmark direction.
- Judge `Home` first on wide desktop, then verify `Graph` and original-only `Reader` as regression surfaces.
- Use original-mode `Reader` captures only; generated-content views remain out of scope for this track.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting Home crops:
  - control seam plus browse/filter strip
  - primary saved-library flow
  - continuation card/list flow lower in the workspace
- Focused regressions second:
  - focused overview

## Acceptance
- The audit states clearly whether Stage 383 moved `Home` closer to Recall’s browse-first, card-flow-first direction.
- The audit records whether `Graph` remained stable and whether original-only `Reader` stayed visually stable with no generated-content detour.
- The handoff uses explicit artifact references and repeats the original-only Reader restriction.

## Validation
- `node --check` for the Stage 383/384 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`

## Result
- Completed on March 19, 2026.
- Stage 384 confirmed that Stage 383 moved `Home` materially closer to the current Recall direction on wide desktop.
- `Graph` stayed visually stable as a refreshed parity baseline behind the Home pass.
- Original-only `Reader` stayed visually stable, generated-content `Reader` work remained out of scope, and original-only `Reader` is now the next likely parity target in the active track.
